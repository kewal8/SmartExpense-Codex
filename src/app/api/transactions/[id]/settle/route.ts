import { parseBody } from '@/lib/api';
import { settlementSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(settlementSchema, await req.json());

    const original = await prisma.transaction.findFirst({
      where: { id: params.id, userId: session.user.id }
    });

    if (!original) {
      return jsonResponse({ success: false, error: 'Transaction not found' }, 404);
    }

    const remaining = Math.max(original.amount - original.settledAmount, 0);
    const settleAmount = input.amount ?? remaining;

    if (settleAmount <= 0 || settleAmount > remaining) {
      return jsonResponse({ success: false, error: 'Invalid settlement amount' }, 400);
    }

    const settlementType = original.type === 'lend' ? 'borrow' : 'lend';

    const result = await prisma.$transaction(async (tx) => {
      const settlement = await tx.transaction.create({
        data: {
          userId: session.user.id,
          personId: original.personId,
          type: settlementType,
          amount: settleAmount,
          dueDate: input.date,
          note: `Settlement for ${original.id}`,
          parentId: original.id,
          settled: true,
          settledAmount: settleAmount
        }
      });

      const updated = await tx.transaction.update({
        where: { id: original.id },
        data: {
          settledAmount: { increment: settleAmount }
        }
      });

      const shouldSettle = updated.settledAmount >= updated.amount;

      if (shouldSettle) {
        await tx.transaction.update({
          where: { id: original.id },
          data: { settled: true }
        });
      }

      return { settlement };
    });

    return jsonResponse({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Settlement failed';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
