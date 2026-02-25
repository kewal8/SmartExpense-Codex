import { expect, test } from '@playwright/test';

type GetMetric = {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  sizeBytes: number;
};

const MAX_GET_COUNT = 4;
const MAX_GET_DURATION_MS = 1200;
const MAX_GET_SIZE_BYTES = 250 * 1024;

async function loginIfRequired(page: import('@playwright/test').Page) {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  if (!page.url().includes('/login')) return;

  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing E2E_EMAIL/E2E_PASSWORD for login');
  }

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

test('expense save network budget', async ({ page }) => {
  const startedAt = new Map<import('@playwright/test').Request, number>();
  const getMetrics: GetMetric[] = [];
  let postSaveStartedAt = Number.POSITIVE_INFINITY;

  page.on('request', (request) => {
    startedAt.set(request, Date.now());
  });

  page.on('requestfinished', async (request) => {
    const start = startedAt.get(request);
    if (!start) return;
    const response = await request.response();
    if (!response) return;
    if (request.method() !== 'GET') return;
    if (start < postSaveStartedAt) return;

    let sizeBytes = 0;
    const contentLength = await response.headerValue('content-length');
    if (contentLength && Number.isFinite(Number(contentLength))) {
      sizeBytes = Number(contentLength);
    } else {
      const body = await response.body();
      sizeBytes = body.byteLength;
    }

    getMetrics.push({
      method: request.method(),
      url: request.url(),
      status: response.status(),
      durationMs: Date.now() - start,
      sizeBytes
    });
  });

  await loginIfRequired(page);

  await page.getByRole('button', { name: 'Add Expense' }).first().click();
  await page.getByLabel('Amount').fill('123.45');
  await page.getByLabel('Note').fill(`perf-test-${Date.now()}`);

  const postPromise = page.waitForResponse((response) => {
    return response.request().method() === 'POST' && response.url().includes('/api/expenses');
  });

  postSaveStartedAt = Date.now();
  await page.locator('form button[type="submit"]').filter({ hasText: 'Add Expense' }).click();
  const postResponse = await postPromise;
  expect(postResponse.status()).toBeLessThan(400);

  await page.waitForTimeout(2000);

  console.log('\n[perf] GET requests after save');
  for (const metric of getMetrics) {
    console.log(
      `[perf] ${metric.method} ${metric.url} status=${metric.status} duration=${metric.durationMs}ms size=${metric.sizeBytes}B`
    );
  }

  expect(
    getMetrics.length,
    `Too many GETs after save (${getMetrics.length}). Possible broad invalidation/router.refresh overuse.`
  ).toBeLessThanOrEqual(MAX_GET_COUNT);

  const slow = getMetrics.filter((m) => m.durationMs > MAX_GET_DURATION_MS);
  expect(
    slow.length,
    `Slow GET detected: ${slow.map((m) => `${m.url}=${m.durationMs}ms`).join(', ')}`
  ).toBe(0);

  const large = getMetrics.filter((m) => m.sizeBytes > MAX_GET_SIZE_BYTES);
  expect(
    large.length,
    `Large GET payload detected: ${large.map((m) => `${m.url}=${m.sizeBytes}B`).join(', ')}`
  ).toBe(0);
});
