import { parseBody } from '@/lib/api';
import { paidMarkSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

async function getExpenseTypeId(userId: string, preferredTypeName: string) {
  const preferred = await prisma.expenseType.findFirst({
    where: { userId, name: { equals: preferredTypeName, mode: 'insensitive' } }
  });

  if (preferred) {
    return preferred.id;
  }

  const fallback = await prisma.expenseType.findFirst({
    where: { userId, name: 'Other' }
  });

  if (fallback) {
    return fallback.id;
  }

  const created = await prisma.expenseType.create({
    data: { userId, name: 'Other', isDefault: true }
  });

  return created.id;
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  try {
    const input = parseBody(paidMarkSchema, await req.json());

    const existing = await prisma.paidMark.findUnique({
      where: {
        userId_itemType_itemId_month_year: {
          userId,
          itemType: input.itemType,
          itemId: input.itemId,
          month: input.month,
          year: input.year
        }
      }
    });

    if (existing) {
      return jsonResponse({ success: false, error: 'Already marked as paid for selected month' }, 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      let amount = 0;
      let source: 'emi' | 'recurring';
      const sourceId = input.itemId;
      let preferredType = 'Other';

      if (input.itemType === 'emi') {
        const emi = await tx.eMI.findFirst({ where: { id: input.itemId, userId } });
        if (!emi) throw new Error('EMI not found');
        amount = emi.amount;
        source = 'emi';
        preferredType = emi.emiType;
      } else {
        const recurring = await tx.recurringPayment.findFirst({ where: { id: input.itemId, userId } });
        if (!recurring) throw new Error('Recurring payment not found');
        amount = recurring.amount;
        source = 'recurring';
        preferredType = recurring.type;
      }

      const typeId = await getExpenseTypeId(userId, preferredType);

      const expense = await tx.expense.create({
        data: {
          userId,
          amount,
          date: input.paidDate,
          typeId,
          note: input.note ?? `${input.itemType.toUpperCase()} payment`,
          source,
          sourceId
        }
      });

      const paidMark = await tx.paidMark.create({
        data: {
          ...input,
          userId,
          expenseId: expense.id,
          emiId: input.itemType === 'emi' ? input.itemId : undefined,
          recurringId: input.itemType === 'recurring' ? input.itemId : undefined
        }
      });

      return { paidMark, expense };
    });

    return jsonResponse({ success: true, data: result }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as paid';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get('month'));
  const year = Number(searchParams.get('year'));

  const marks = await prisma.paidMark.findMany({
    where: {
      userId,
      month: Number.isNaN(month) ? undefined : month,
      year: Number.isNaN(year) ? undefined : year
    },
    orderBy: { createdAt: 'desc' }
  });

  return jsonResponse({ success: true, data: marks });
}
