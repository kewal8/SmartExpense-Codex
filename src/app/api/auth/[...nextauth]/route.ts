import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export async function GET(req: Request, ctx: unknown) {
  const start = performance.now();
  const res = await handler(req, ctx);
  const totalMs = performance.now() - start;
  const sizeKb = Number(res.headers.get('content-length') ?? '0') / 1024;
  console.log(
    `[PERF] /api/auth/session total=${totalMs.toFixed(1)}ms auth=0.0ms db=0.0ms serialize=0.0ms size=${sizeKb.toFixed(1)}kb status=${res.status}`
  );
  return res;
}

export async function POST(req: Request, ctx: unknown) {
  const start = performance.now();
  const res = await handler(req, ctx);
  const totalMs = performance.now() - start;
  const sizeKb = Number(res.headers.get('content-length') ?? '0') / 1024;
  console.log(
    `[PERF] /api/auth/[...nextauth] total=${totalMs.toFixed(1)}ms auth=0.0ms db=0.0ms serialize=0.0ms size=${sizeKb.toFixed(1)}kb status=${res.status}`
  );
  return res;
}
