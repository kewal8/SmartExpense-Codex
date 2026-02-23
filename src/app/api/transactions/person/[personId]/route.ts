import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(_: Request, { params }: { params: { personId: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const data = await prisma.transaction.findMany({
    where: { userId: session.user.id, personId: params.personId },
    include: { person: true, settlements: true },
    orderBy: { createdAt: 'desc' }
  });

  return jsonResponse({ success: true, data });
}
