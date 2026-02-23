import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const txCount = await prisma.transaction.count({
    where: { userId: session.user.id, personId: params.id }
  });

  if (txCount > 0) {
    return jsonResponse({ success: false, error: 'Cannot delete person with transactions' }, 400);
  }

  await prisma.person.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}
