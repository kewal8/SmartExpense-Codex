# Performance Test Suite

## Install

```bash
npm install
npx playwright install
```

## Required env vars

These tests assume the app is already running at `http://localhost:3000`.

```bash
export E2E_BASE_URL=http://localhost:3000
export API_BASE_URL=http://localhost:3000
export E2E_EMAIL='your-login-email'
export E2E_PASSWORD='your-login-password'
export PERF_EMAIL='your-login-email'
export PERF_PASSWORD='your-login-password'
```

## Run commands

```bash
# Playwright network/perf budget test after saving an expense
npm run test:e2e:perf

# API latency and payload budget tests for /api/expenses
npm run test:api:perf
```

## Failure meaning

- `Too many GETs after save`: broad invalidation or unnecessary refresh after POST.
- `Slow GET detected`: backend query or server/component reload path is too slow.
- `Large GET payload detected`: overfetching (too many rows/fields) from API.
- `POST/GET exceeds 800ms`: API processing or DB latency is beyond local baseline.
- `GET payload > 300KB`: endpoint returns too much data for the requested view.
