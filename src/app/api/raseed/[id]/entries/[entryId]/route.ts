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

export async function PUT(
  req: Request,
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

  const body = await req.json();
  const { name, notes, amount, paidBy, date } = body;

  if (!name?.trim() || !amount || !paidBy?.trim()) {
    return jsonResponse({ success: false, error: 'Name, amount, paidBy required' }, 400);
  }

  const entry = await prisma.raseedEntry.update({
    where: { id: params.entryId },
    data: {
      name: name.trim(),
      notes: notes?.trim() || null,
      amount: parseFloat(amount),
      paidBy: paidBy.trim(),
      date: date ? new Date(date) : undefined,
    }
  });

  return jsonResponse({ success: true, data: entry });
}
