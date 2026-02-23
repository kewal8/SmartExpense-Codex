import { parseBody } from '@/lib/api';
import { recurringSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(recurringSchema, await req.json());
    const existing = await prisma.recurringPayment.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!existing) {
      return jsonResponse({ success: false, error: 'Recurring payment not found' }, 404);
    }

    const recurring = await prisma.recurringPayment.update({
      where: { id: params.id },
      data: input
    });

    return jsonResponse({ success: true, data: recurring });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update recurring payment';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  await prisma.recurringPayment.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}
