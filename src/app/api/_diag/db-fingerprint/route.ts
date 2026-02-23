import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

function shortHash(input: string) {
  return createHash('sha256').update(input).digest('hex').slice(0, 12);
}

function fingerprintUrl(urlValue: string | undefined) {
  if (!urlValue) return null;
  try {
    const parsed = new URL(urlValue);
    const host = parsed.hostname || '(none)';
    const db = (parsed.pathname || '').replace(/^\//, '') || '(none)';
    return {
      host,
      db,
      hash: shortHash(`${host}|${db}`)
    };
  } catch {
    return { host: null, db: null, hash: shortHash(urlValue) };
  }
}

export async function GET(req: Request) {
  const token = process.env.DIAG_TOKEN;
  const incoming = req.headers.get('x-diag-token');
  if (!token || incoming !== token) {
    return new Response('Not found', { status: 404 });
  }

  const dbMeta = await prisma.$queryRaw<
    Array<{
      current_database: string;
      current_schema: string;
      inet_server_addr: string | null;
      version: string;
    }>
  >`SELECT current_database(), current_schema(), inet_server_addr()::text, version()`;

  const row = dbMeta[0];
  const databaseUrlFingerprint = fingerprintUrl(process.env.DATABASE_URL);
  const directUrlFingerprint = fingerprintUrl(process.env.DIRECT_URL);
  const shadowDatabaseUrlFingerprint = fingerprintUrl(process.env.SHADOW_DATABASE_URL);

  return Response.json({
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? null,
      netlifyContext: process.env.CONTEXT ?? process.env.NETLIFY_CONTEXT ?? null,
      netlifyDeployId: process.env.DEPLOY_ID ?? null
    },
    db: {
      currentDatabase: row?.current_database ?? null,
      currentSchema: row?.current_schema ?? null,
      serverAddress: row?.inet_server_addr ?? null,
      version: row?.version ?? null
    },
    envFingerprints: {
      DATABASE_URL: databaseUrlFingerprint,
      DIRECT_URL: directUrlFingerprint,
      SHADOW_DATABASE_URL: shadowDatabaseUrlFingerprint
    }
  });
}
