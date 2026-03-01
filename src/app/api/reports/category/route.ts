import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(req: Request) {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(
      `[PERF] /api/reports/category total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get('month') ?? new Date().getMonth());
  const year = Number(searchParams.get('year') ?? new Date().getFullYear());
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const dbStart = performance.now();
  const grouped = await prisma.expense.groupBy({
    by: ['typeId'],
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true }
  });
  const typeIds = grouped.map((row) => row.typeId);
  const types = typeIds.length
    ? await prisma.expenseType.findMany({
        where: { id: { in: typeIds } },
        select: { id: true, name: true }
      })
    : [];
  const dbMs = performance.now() - dbStart;

  const typeNameById = new Map(types.map((type) => [type.id, type.name]));
  const data = grouped
    .map((row) => ({ name: typeNameById.get(row.typeId) ?? 'Unknown', value: row._sum.amount ?? 0 }))
    .sort((a, b) => b.value - a.value);

  const serializeStart = performance.now();
  const payload = { success: true, data };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/reports/category total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
}
