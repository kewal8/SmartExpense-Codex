import { differenceInCalendarMonths } from 'date-fns';
import { parseBody } from '@/lib/api';
import { emiSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(emiSchema, await req.json());
    const emiTypeName = input.emiType.trim();
    const totalEmis = differenceInCalendarMonths(input.endDate, input.startDate) + 1;

    const existing = await prisma.eMI.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!existing) {
      return jsonResponse({ success: false, error: 'EMI not found' }, 404);
    }
    const validType = await prisma.emiType.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: emiTypeName, mode: 'insensitive' }
      }
    });
    if (!validType) {
      return jsonResponse({ success: false, error: 'Invalid EMI type. Please select a configured EMI type.' }, 400);
    }

    const emi = await prisma.eMI.update({
      where: { id: params.id },
      data: { ...input, emiType: validType.name, totalEmis: Math.max(totalEmis, 1) }
    });

    return jsonResponse({ success: true, data: emi });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update EMI';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  await prisma.eMI.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}
