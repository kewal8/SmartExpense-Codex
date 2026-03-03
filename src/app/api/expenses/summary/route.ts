import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') ?? '');
  const year = parseInt(searchParams.get('year') ?? '');

  if (!month || !year) {
    return jsonResponse({ error: 'Missing params' }, 400);
  }

  const thisMonthStart = new Date(year, month - 1, 1);
  const thisMonthEnd = new Date(year, month, 0, 23, 59, 59);

  const lastMonth = month === 1 ? 12 : month - 1;
  const lastMonthYear = month === 1 ? year - 1 : year;
  const lastMonthStart = new Date(lastMonthYear, lastMonth - 1, 1);
  const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

  const [thisMonthData, lastMonthData] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: thisMonthStart, lte: thisMonthEnd }
      },
      _sum: { amount: true },
      _count: true
    }),
    prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      _sum: { amount: true },
      _count: true
    })
  ]);

  const thisTotal = thisMonthData._sum.amount ?? 0;
  const lastTotal = lastMonthData._sum.amount ?? 0;
  const diff = thisTotal - lastTotal;
  const pct = lastTotal > 0 ? Math.round((diff / lastTotal) * 100) : null;

  return jsonResponse({
    thisMonth: { total: thisTotal, count: thisMonthData._count, month, year },
    lastMonth: { total: lastTotal, count: lastMonthData._count },
    diff,
    pct,
    isUp: diff > 0
  });
}
