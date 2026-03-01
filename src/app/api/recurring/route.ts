import { parseBody } from '@/lib/api';
import { recurringSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';
import { addMonths, differenceInCalendarDays, startOfDay } from 'date-fns';

function cycleDate(year: number, month: number, dueDay: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(dueDay, 1), lastDay);
  return new Date(year, month, safeDay);
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(recurringSchema, await req.json());
    const recurring = await prisma.recurringPayment.create({
      data: { ...input, userId: session.user.id }
    });
    return jsonResponse({ success: true, data: recurring }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recurring payment';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET() {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(`[PERF] /api/recurring total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`);
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const dbStart = performance.now();
  const recurring = await prisma.recurringPayment.findMany({
    where: { userId: session.user.id },
    include: { paidMarks: true },
    orderBy: { createdAt: 'desc' }
  });
  const dbMs = performance.now() - dbStart;

  const today = startOfDay(new Date());

  const data = recurring.map((item) => {
    const latestPaid = [...item.paidMarks]
      .filter((mark) => mark.itemType === 'recurring')
      .sort((a, b) => b.paidDate.getTime() - a.paidDate.getTime())[0];

    let nextDueAt: Date;
    if (latestPaid) {
      const paidCycle = cycleDate(latestPaid.year, latestPaid.month, item.dueDay);
      nextDueAt = addMonths(paidCycle, 1);
    } else {
      const thisMonthDue = cycleDate(today.getFullYear(), today.getMonth(), item.dueDay);
      nextDueAt = thisMonthDue >= today ? thisMonthDue : addMonths(thisMonthDue, 1);
    }

    const nextDueInDays = differenceInCalendarDays(startOfDay(nextDueAt), today);

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      amount: item.amount,
      dueDay: item.dueDay,
      nextDueAt,
      nextDueInDays,
      showMarkPaid: nextDueInDays >= 0 && nextDueInDays <= 7
    };
  });

  const serializeStart = performance.now();
  const payload = { success: true, data };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/recurring total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
