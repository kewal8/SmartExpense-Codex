import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const email = `perf_${Date.now()}@example.com`;
const password = 'PerfPass123!';
const name = 'Perf User';

const routes = [
  { name: 'Expenses', path: '/expenses' },
  { name: 'EMI', path: '/emis' },
  { name: 'Recurring', path: '/recurring' },
  { name: 'Khata', path: '/khata' },
  { name: 'Reports', path: '/reports' },
  { name: 'Settings', path: '/settings' },
  { name: 'Dashboard', path: '/dashboard' }
];

function summarize(entries) {
  const by = new Map();
  for (const e of entries) {
    const u = new URL(e.name);
    const key = u.pathname + (u.search || '');
    if (!by.has(key)) by.set(key, []);
    by.get(key).push(e);
  }
  const out = [];
  for (const [endpoint, list] of by.entries()) {
    out.push({ endpoint, count: list.length, maxDuration: Number(Math.max(...list.map((x) => x.duration)).toFixed(1)), maxTTFB: Number(Math.max(...list.map((x) => x.ttfb)).toFixed(1)), maxSizeKB: Number((Math.max(...list.map((x) => x.size)) / 1024).toFixed(1)) });
  }
  out.sort((a, b) => b.maxDuration - a.maxDuration);
  return out;
}

async function nav(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    const msg = String(e?.message || e);
    if (!msg.includes('ERR_ABORTED') && !msg.includes('Timeout')) throw e;
    await page.waitForTimeout(1200);
  }
}

async function capture(page, label, action) {
  await page.evaluate(() => performance.clearResourceTimings());
  await action();
  await page.waitForTimeout(3000);
  const entries = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.includes('/api/')).map((r) => ({ name: r.name, duration: r.duration, ttfb: r.responseStart - r.startTime, size: r.transferSize || r.encodedBodySize || 0, initiatorType: r.initiatorType })).filter((r) => r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest'));
  return { label, entries, summary: summarize(entries) };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await context.request.post(`${base}/api/register`, { data: { name, email, password } });
const csrf = await (await context.request.get(`${base}/api/auth/csrf`)).json();
await context.request.post(`${base}/api/auth/callback/credentials`, { form: { csrfToken: csrf.csrfToken, email, password, callbackUrl: '/dashboard', json: 'true' } });

await nav(page, `${base}/dashboard`);

const phases = [];
phases.push(await capture(page, 'initial-load', async () => { await page.reload({ waitUntil: 'domcontentloaded' }); }));
for (const r of routes) {
  phases.push(await capture(page, r.name, async () => { await nav(page, `${base}${r.path}`); }));
}

const all = phases.flatMap((p) => p.entries);
const row = (e) => ({ endpoint: new URL(e.name).pathname + new URL(e.name).search, duration: Number(e.duration.toFixed(1)), ttfb: Number(e.ttfb.toFixed(1)), sizeKB: Number((e.size / 1024).toFixed(1)) });

console.log(JSON.stringify({ phases: phases.map((p) => ({ label: p.label, summary: p.summary })), topByDuration: [...all].sort((a, b) => b.duration - a.duration).slice(0, 3).map(row), topByTTFB: [...all].sort((a, b) => b.ttfb - a.ttfb).slice(0, 3).map(row), topBySize: [...all].sort((a, b) => b.size - a.size).slice(0, 3).map(row) }, null, 2));

await browser.close();
