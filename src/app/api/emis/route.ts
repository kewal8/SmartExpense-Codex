import { differenceInCalendarMonths, startOfMonth } from 'date-fns';
import { parseBody } from '@/lib/api';
import { emiSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

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
    const body = await req.json();
    const input = parseBody(emiSchema, body);
    const emiTypeName = input.emiType.trim();
    const validType = await prisma.emiType.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: emiTypeName, mode: 'insensitive' }
      }
    });
    if (!validType) {
      return jsonResponse({ success: false, error: 'Invalid EMI type. Please select a configured EMI type.' }, 400);
    }
    const totalEmis = differenceInCalendarMonths(input.endDate, input.startDate) + 1;

    const emi = await prisma.eMI.create({
      data: {
        ...input,
        emiType: validType.name,
        userId: session.user.id,
        totalEmis: Math.max(totalEmis, 1)
      }
    });

    return jsonResponse({ success: true, data: emi }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create EMI';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const emis = await prisma.eMI.findMany({
    where: { userId: session.user.id },
    include: { paidMarks: true },
    orderBy: { createdAt: 'desc' }
  });

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const data = emis.map((emi) => {
    const paidByCycle = new Set(emi.paidMarks.map((mark) => `${mark.year}-${mark.month}`));
    const cycleCount = Math.max(emi.totalEmis, 1);
    const monthCursor = Math.max(
      0,
      differenceInCalendarMonths(startOfMonth(todayStart), startOfMonth(emi.startDate))
    );
    let nextInstallmentDueAt: Date | null = null;

    for (let index = monthCursor; index < cycleCount; index += 1) {
      const cycleMonth = emi.startDate.getMonth() + index;
      const cycleYear = emi.startDate.getFullYear() + Math.floor(cycleMonth / 12);
      const normalizedMonth = ((cycleMonth % 12) + 12) % 12;
      const cycleKey = `${cycleYear}-${normalizedMonth}`;

      if (!paidByCycle.has(cycleKey)) {
        nextInstallmentDueAt = cycleDate(cycleYear, normalizedMonth, emi.dueDay);
        break;
      }
    }

    const nextDueInDays = nextInstallmentDueAt
      ? Math.ceil((nextInstallmentDueAt.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...emi,
      nextDueAt: nextInstallmentDueAt,
      nextDueInDays,
      showMarkPaid:
        nextInstallmentDueAt ? nextDueInDays !== null && nextDueInDays >= 0 && nextDueInDays <= 7 : false
    };
  });

  return jsonResponse({ success: true, data });
}
