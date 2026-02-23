import { differenceInCalendarMonths } from 'date-fns';
import { parseBody } from '@/lib/api';
import { emiSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

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

  return jsonResponse({ success: true, data: emis });
}
