import { parseBody } from '@/lib/api';
import { transactionSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(transactionSchema, await req.json());
    const tx = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        personId: input.personId,
        type: input.type,
        amount: input.amount,
        dueDate: input.dueDate,
        note: input.note
      },
      include: { person: true }
    });
    return jsonResponse({ success: true, data: tx }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create transaction';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const tx = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { person: true, settlements: true },
    orderBy: { createdAt: 'desc' }
  });

  return jsonResponse({ success: true, data: tx });
}
