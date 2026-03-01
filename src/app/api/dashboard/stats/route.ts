import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
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
      `[PERF] /api/dashboard/stats total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  const dbStart = performance.now();
  const [user, thisMonthExpenses, prevMonthExpenses, txByType, emis, recurring] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { monthlyBudget: true } }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true }
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, settled: false },
      _sum: { amount: true, settledAmount: true }
    }),
    prisma.eMI.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.recurringPayment.aggregate({ where: { userId }, _sum: { amount: true } })
  ]);
  const dbMs = performance.now() - dbStart;

  const txSums = new Map(txByType.map((row) => [row.type, (row._sum.amount ?? 0) - (row._sum.settledAmount ?? 0)]));
  const toCollect = txSums.get('lend') ?? 0;
  const toPay = txSums.get('borrow') ?? 0;

  const thisMonth = thisMonthExpenses._sum.amount ?? 0;
  const prevMonth = prevMonthExpenses._sum.amount ?? 0;
  const deltaPercent = prevMonth === 0 ? 0 : ((thisMonth - prevMonth) / prevMonth) * 100;

  const payload = {
    success: true,
    data: {
      thisMonthSpend: thisMonth,
      lastMonthSpend: prevMonth,
      deltaPercent,
      monthlyBudget: user?.monthlyBudget ?? null,
      toCollect,
      toPay,
      fixedOutflow: (emis._sum.amount ?? 0) + (recurring._sum.amount ?? 0)
    }
  };
  const serializeStart = performance.now();
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/dashboard/stats total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
