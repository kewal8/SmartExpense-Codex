import { beforeAll, describe, expect, it } from 'vitest';
import request, { type SuperAgentTest } from 'supertest';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';
const EMAIL = process.env.PERF_EMAIL;
const PASSWORD = process.env.PERF_PASSWORD;
const POST_BUDGET_MS = 800;
const GET_BUDGET_MS = 800;
const GET_PAYLOAD_BUDGET_BYTES = 300 * 1024;

type ExpenseType = { id: string; name: string };

let agent: SuperAgentTest;
let typeId: string;

async function loginWithCredentials() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Missing PERF_EMAIL/PERF_PASSWORD for authenticated API performance tests');
  }

  const csrfRes = await agent.get('/api/auth/csrf');
  const csrfToken = csrfRes.body?.csrfToken as string | undefined;
  if (!csrfToken) throw new Error('Could not obtain csrf token from /api/auth/csrf');

  const loginRes = await agent.post('/api/auth/callback/credentials').type('form').send({
    csrfToken,
    email: EMAIL,
    password: PASSWORD,
    callbackUrl: '/dashboard',
    json: 'true'
  });

  expect(loginRes.status, `Credentials login failed. body=${JSON.stringify(loginRes.body)}`).toBeLessThan(400);
}

describe('API perf budget: /api/expenses', () => {
  beforeAll(async () => {
    agent = request.agent(BASE_URL);
    await loginWithCredentials();

    const typesRes = await agent.get('/api/expense-types');
    expect(typesRes.status).toBe(200);
    const types = (typesRes.body?.data ?? []) as ExpenseType[];
    expect(types.length).toBeGreaterThan(0);
    typeId = types[0].id;
  });

  it('POST /api/expenses should stay under local latency budget', async () => {
    const t0 = performance.now();
    const res = await agent.post('/api/expenses').send({
      amount: 99.5,
      date: new Date().toISOString(),
      typeId,
      note: `perf-api-${Date.now()}`
    });
    const elapsedMs = performance.now() - t0;

    console.log(`[perf] POST /api/expenses status=${res.status} time=${elapsedMs.toFixed(1)}ms`);
    expect(res.status).toBe(201);
    expect(elapsedMs).toBeLessThanOrEqual(POST_BUDGET_MS);
  });

  it('GET /api/expenses should stay under latency and payload budgets', async () => {
    const t0 = performance.now();
    const res = await agent.get('/api/expenses?limit=20&page=1');
    const elapsedMs = performance.now() - t0;
    const payloadBytes = Buffer.byteLength(JSON.stringify(res.body), 'utf8');

    console.log(`[perf] GET /api/expenses status=${res.status} time=${elapsedMs.toFixed(1)}ms payload=${payloadBytes}B`);
    expect(res.status).toBe(200);
    expect(elapsedMs).toBeLessThanOrEqual(GET_BUDGET_MS);
    expect(payloadBytes).toBeLessThanOrEqual(GET_PAYLOAD_BUDGET_BYTES);
  });
});
