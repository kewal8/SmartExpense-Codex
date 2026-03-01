import { addDays, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(`[PERF] /api/dashboard/collect-reminders total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`);
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = session.user.id;
  const todayStart = startOfDay(new Date());
  const nextWeekEnd = endOfDay(addDays(todayStart, 7));

  const dbStart = performance.now();
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
    select: {
      id: true,
      amount: true,
      settledAmount: true,
      dueDate: true,
      person: { select: { name: true } }
    },
    orderBy: { dueDate: 'asc' }
  });
  const dbMs = performance.now() - dbStart;

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

  const serializeStart = performance.now();
  const payload = { success: true, data };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/dashboard/collect-reminders total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
