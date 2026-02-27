import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function DELETE(_: Request, props: { params: Promise<{ entryId: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const entry = await prisma.transaction.findFirst({
    where: { id: params.entryId, userId },
    select: { id: true, parentId: true, amount: true, personId: true }
  });

  if (!entry) {
    return jsonResponse({ success: false, error: 'Entry not found' }, 404);
  }

  await prisma.$transaction(async (tx) => {
    if (entry.parentId) {
      await tx.transaction.updateMany({
        where: { id: entry.parentId, userId },
        data: {
          settledAmount: { decrement: entry.amount },
          settled: false
        }
      });
      await tx.transaction.deleteMany({
        where: { id: entry.id, userId }
      });
      return;
    }

    await tx.transaction.deleteMany({
      where: {
        userId,
        parentId: entry.id
      }
    });

    await tx.transaction.deleteMany({
      where: {
        id: entry.id,
        userId
      }
    });
  });

  revalidatePath('/khata');
  revalidatePath(`/khata/${entry.personId}`);

  return jsonResponse({ success: true, data: { id: entry.id } });
}
