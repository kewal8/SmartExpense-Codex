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
