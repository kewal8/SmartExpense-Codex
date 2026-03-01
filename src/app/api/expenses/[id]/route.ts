import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const expense = await prisma.expense.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!expense) {
    return jsonResponse({ success: false, error: 'Expense not found' }, 404);
  }

  await prisma.expense.delete({ where: { id: params.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const expense = await prisma.expense.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!expense) {
    return jsonResponse({ success: false, error: 'Expense not found' }, 404);
  }

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const date = new Date(body.date);
    const typeId = String(body.typeId ?? '');
    const note = typeof body.note === 'string' ? body.note : '';

    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse({ success: false, error: 'Amount must be greater than 0' }, 400);
    }
    if (!typeId) {
      return jsonResponse({ success: false, error: 'Type is required' }, 400);
    }
    if (Number.isNaN(date.getTime())) {
      return jsonResponse({ success: false, error: 'Invalid date' }, 400);
    }

    const type = await prisma.expenseType.findFirst({
      where: { id: typeId, userId: session.user.id },
      select: { id: true }
    });
    if (!type) {
      return jsonResponse({ success: false, error: 'Invalid expense type' }, 400);
    }

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        amount,
        date,
        typeId,
        note: note.trim() ? note.trim() : null
      },
      select: {
        id: true,
        amount: true,
        date: true,
        note: true,
        typeId: true,
        type: { select: { id: true, name: true } }
      }
    });

    return jsonResponse({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
