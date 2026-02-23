import { addDays, differenceInCalendarDays, endOfMonth, isBefore, startOfMonth } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

function getDueDate(day: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day);
}

function urgency(dueDate: Date) {
  const now = new Date();
  if (isBefore(dueDate, now) && differenceInCalendarDays(now, dueDate) > 0) return 0;
  if (differenceInCalendarDays(dueDate, now) === 0) return 1;
  if (differenceInCalendarDays(dueDate, now) <= 3) return 2;
  return 3;
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const [emis, recurring, borrows, marks] = await Promise.all([
    prisma.eMI.findMany({ where: { userId } }),
    prisma.recurringPayment.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: 'borrow',
        settled: false,
        dueDate: { gte: startOfMonth(now), lte: addDays(endOfMonth(now), 7) }
      },
      include: { person: true }
    }),
    prisma.paidMark.findMany({ where: { userId, month, year } })
  ]);

  const paidKey = new Set(marks.map((m) => `${m.itemType}:${m.itemId}`));

  const reminders = [
    ...emis
      .filter((e) => !paidKey.has(`emi:${e.id}`))
      .map((emi) => {
        const dueDate = getDueDate(emi.dueDay);
        return {
          id: `emi:${emi.id}`,
          kind: 'emi',
          title: emi.name,
          amount: emi.amount,
          dueDate,
          urgency: urgency(dueDate)
        };
      }),
    ...recurring
      .filter((r) => !paidKey.has(`recurring:${r.id}`))
      .map((r) => {
        const dueDate = getDueDate(r.dueDay);
        return {
          id: `recurring:${r.id}`,
          kind: 'recurring',
          title: r.name,
          amount: r.amount,
          dueDate,
          urgency: urgency(dueDate)
        };
      }),
    ...borrows.map((b) => {
      const dueDate = b.dueDate ?? now;
      return {
        id: `borrow:${b.id}`,
        kind: 'borrow',
        title: `Return to ${b.person.name}`,
        amount: b.amount - b.settledAmount,
        dueDate,
        urgency: urgency(dueDate)
      };
    })
  ].sort((a, b) => a.urgency - b.urgency || a.dueDate.getTime() - b.dueDate.getTime());

  return jsonResponse({ success: true, data: reminders });
}
