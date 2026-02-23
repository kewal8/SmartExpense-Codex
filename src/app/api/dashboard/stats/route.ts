import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  const [user, thisMonthExpenses, prevMonthExpenses, tx, emis, recurring] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true }
    }),
    prisma.transaction.findMany({ where: { userId, settled: false } }),
    prisma.eMI.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.recurringPayment.aggregate({ where: { userId }, _sum: { amount: true } })
  ]);

  const toCollect = tx.filter((t) => t.type === 'lend').reduce((sum, t) => sum + (t.amount - t.settledAmount), 0);
  const toPay = tx.filter((t) => t.type === 'borrow').reduce((sum, t) => sum + (t.amount - t.settledAmount), 0);

  const thisMonth = thisMonthExpenses._sum.amount ?? 0;
  const prevMonth = prevMonthExpenses._sum.amount ?? 0;
  const deltaPercent = prevMonth === 0 ? 0 : ((thisMonth - prevMonth) / prevMonth) * 100;

  return jsonResponse({
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
  });
}
