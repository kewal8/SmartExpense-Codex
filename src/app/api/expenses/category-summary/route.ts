import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const typeId = searchParams.get('typeId');
  const search = searchParams.get('search');

  const where = {
    userId: session.user.id,
    ...(dateFrom || dateTo
      ? {
          date: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        }
      : {}),
    ...(typeId ? { typeId } : {}),
    ...(search
      ? {
          note: { contains: search, mode: 'insensitive' as const }
        }
      : {})
  };

  const grouped = await prisma.expense.groupBy({
    by: ['typeId'],
    where,
    _sum: { amount: true }
  });

  if (grouped.length === 0) {
    return jsonResponse({ success: true, data: [] });
  }

  const typeIds = grouped.map((item) => item.typeId);
  const types = await prisma.expenseType.findMany({
    where: { id: { in: typeIds }, userId: session.user.id },
    select: { id: true, name: true }
  });

  const typeNameById = new Map(types.map((type) => [type.id, type.name]));
  const total = grouped.reduce((sum, item) => sum + (item._sum.amount ?? 0), 0);

  const data = grouped
    .map((item) => {
      const amount = item._sum.amount ?? 0;
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        typeId: item.typeId,
        category: typeNameById.get(item.typeId) ?? 'Unknown',
        totalAmount: amount,
        percentage
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return jsonResponse({ success: true, data });
}

