import { addDays, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;
  const todayStart = startOfDay(new Date());
  const nextWeekEnd = endOfDay(addDays(todayStart, 7));

  const dueSoon = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'lend',
      settled: false,
      dueDate: {
        gte: todayStart,
        lte: nextWeekEnd
      }
    },
    include: { person: true },
    orderBy: { dueDate: 'asc' }
  });

  const data = dueSoon.map((item) => {
    const dueDate = item.dueDate ?? todayStart;
    const days = differenceInCalendarDays(startOfDay(dueDate), todayStart);
    return {
      id: item.id,
      personName: item.person.name,
      amount: Math.max(item.amount - item.settledAmount, 0),
      dueDate: dueDate.toISOString(),
      dueInDays: days
    };
  });

  return jsonResponse({ success: true, data });
}
