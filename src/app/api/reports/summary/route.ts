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
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;

  // Reports page has no date filters yet, so this summary uses the last 12 calendar months.
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

  return jsonResponse({
    success: true,
    data: {
      monthlyEmi,
      totalEmi: emiOverall._sum.amount ?? 0,
      totalRecurring: recurringOverall._sum.amount ?? 0
    }
  });
}
