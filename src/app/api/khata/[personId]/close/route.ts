import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function DELETE(_: Request, { params }: { params: { personId: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  try {
    const person = await prisma.person.findFirst({
      where: { id: params.personId, userId },
      select: { id: true }
    });

    if (!person) {
      return jsonResponse({ success: false, error: 'Khata not found' }, 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedTransactions = await tx.transaction.deleteMany({
        where: { userId, personId: params.personId }
      });

      // Keep the person/contact; only clear khata history.
      return { deletedTransactions: deletedTransactions.count };
    });

    return jsonResponse({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to close khata';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
