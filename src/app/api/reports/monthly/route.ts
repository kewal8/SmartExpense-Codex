import { eachMonthOfInterval, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const end = endOfMonth(new Date());
  const start = startOfMonth(subMonths(end, 5));
  const months = eachMonthOfInterval({ start, end });

  const data = await Promise.all(
    months.map(async (monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const total = await prisma.expense.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      return { month: format(monthStart, 'MMM yy'), total: total._sum.amount ?? 0 };
    })
  );

  return jsonResponse({ success: true, data });
}
