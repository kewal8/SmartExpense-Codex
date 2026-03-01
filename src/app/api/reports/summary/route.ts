import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

type MonthlyEmiPoint = {
  month: string;
  total: number;
  count: number;
};

export async function GET() {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(
      `[PERF] /api/reports/summary total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;

  // Reports page has no date filters yet, so this summary uses the last 12 calendar months.
  const dbStart = performance.now();
  const monthlyEmi = await prisma.$queryRaw<MonthlyEmiPoint[]>(Prisma.sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - interval '11 months',
        date_trunc('month', CURRENT_DATE),
        interval '1 month'
      ) AS month_start
    )
    SELECT
      to_char(m.month_start, 'YYYY-MM') AS month,
      COALESCE(SUM(e."amount"), 0)::float8 AS total,
      COUNT(e."id")::int AS count
    FROM months m
    LEFT JOIN "EMI" e
      ON e."userId" = ${userId}
      AND e."startDate" <= (m.month_start + interval '1 month - 1 day')
      AND e."endDate" >= m.month_start
    GROUP BY m.month_start
    ORDER BY m.month_start;
  `);

  const [emiOverall, recurringOverall] = await Promise.all([
    prisma.eMI.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.recurringPayment.aggregate({ where: { userId }, _sum: { amount: true } })
  ]);
  const dbMs = performance.now() - dbStart;

  const payload = {
    success: true,
    data: {
      monthlyEmi,
      totalEmi: emiOverall._sum.amount ?? 0,
      totalRecurring: recurringOverall._sum.amount ?? 0
    }
  };
  const serializeStart = performance.now();
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/reports/summary total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
