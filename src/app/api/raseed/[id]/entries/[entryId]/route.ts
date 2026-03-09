import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function DELETE(
  _: Request,
  props: { params: Promise<{ id: string; entryId: string }> }
) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const raseed = await prisma.raseed.findFirst({
    where: { id: params.id, userId: session.user.id }
  });
  if (!raseed) {
    return jsonResponse({ success: false, error: 'Raseed not found' }, 404);
  }

  await prisma.raseedEntry.deleteMany({
    where: { id: params.entryId, raseedId: params.id }
  });

  return jsonResponse({ success: true, data: { id: params.entryId } });
}
