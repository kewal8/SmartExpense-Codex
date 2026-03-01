import { Prisma } from '@prisma/client';
import { eachMonthOfInterval, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(
      `[PERF] /api/reports/monthly total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const end = endOfMonth(new Date());
  const start = startOfMonth(subMonths(end, 5));
  const months = eachMonthOfInterval({ start, end });

  const dbStart = performance.now();
  const grouped = await prisma.$queryRaw<Array<{ month_start: Date; total: number }>>(Prisma.sql`
    SELECT
      date_trunc('month', "date") AS month_start,
      COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "Expense"
    WHERE "userId" = ${userId}
      AND "date" >= ${start}
      AND "date" <= ${end}
    GROUP BY date_trunc('month', "date")
    ORDER BY month_start ASC
  `);
  const dbMs = performance.now() - dbStart;

  const byMonth = new Map(grouped.map((row) => [format(new Date(row.month_start), 'MMM yy'), row.total]));
  const data = months.map((monthStart) => ({
    month: format(monthStart, 'MMM yy'),
    total: byMonth.get(format(monthStart, 'MMM yy')) ?? 0
  }));

  const serializeStart = performance.now();
  const payload = { success: true, data };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/reports/monthly total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
