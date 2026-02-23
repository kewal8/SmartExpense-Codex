import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get('month') ?? new Date().getMonth());
  const year = Number(searchParams.get('year') ?? new Date().getFullYear());
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    include: { type: true }
  });

  const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.type.name] = (acc[expense.type.name] ?? 0) + expense.amount;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return jsonResponse({ success: true, data });
}
