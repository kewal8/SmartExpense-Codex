import { Prisma } from '@prisma/client';
import { paginationSchema } from '@/lib/validations';
import { parseBody } from '@/lib/api';
import { expenseSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/server-auth';

export async function POST(req: Request) {
  const lifecycleStart = performance.now();
  const timingLabel = `[perf][POST /api/expenses]`;
  const session = await requireAuth();
  if (!session?.user?.id) {
    console.log(`${timingLabel} unauthorized total=${(performance.now() - lifecycleStart).toFixed(1)}ms`);
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const input = parseBody(expenseSchema, body);

    const dbInsertStart = performance.now();
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        amount: input.amount,
        date: input.date,
        typeId: input.typeId,
        note: input.note
      },
      include: { type: true }
    });
    const dbInsertMs = performance.now() - dbInsertStart;
    const totalMs = performance.now() - lifecycleStart;
    console.log(`${timingLabel} dbInsert=${dbInsertMs.toFixed(1)}ms total=${totalMs.toFixed(1)}ms`);

    return jsonResponse({ success: true, data: expense }, 201);
  } catch (error) {
    const totalMs = performance.now() - lifecycleStart;
    console.log(`${timingLabel} error total=${totalMs.toFixed(1)}ms`);
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET(req: Request) {
  const lifecycleStart = performance.now();
  const timingLabel = `[PERF] /api/expenses`;
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(
      `${timingLabel} total=${(performance.now() - lifecycleStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb unauthorized=1`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      typeId: searchParams.get('typeId'),
      search: searchParams.get('search'),
      minAmount: searchParams.get('minAmount'),
      maxAmount: searchParams.get('maxAmount'),
      sort: searchParams.get('sort') || 'date_desc'
    };

    const page = parseBody(paginationSchema, {
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20
    });
    const pageNumber = page.page ?? 1;
    const pageLimit = page.limit ?? 20;

    const where: Prisma.ExpenseWhereInput = {
      userId: session.user.id,
      ...(filters.dateFrom || filters.dateTo
        ? {
            date: {
              gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
              lte: filters.dateTo ? new Date(filters.dateTo) : undefined
            }
          }
        : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.search
        ? {
            note: { contains: filters.search, mode: 'insensitive' }
          }
        : {}),
      ...(filters.minAmount || filters.maxAmount
        ? {
            amount: {
              gte: filters.minAmount ? Number(filters.minAmount) : undefined,
              lte: filters.maxAmount ? Number(filters.maxAmount) : undefined
            }
          }
        : {})
    };

    const orderBy =
      filters.sort === 'date_asc'
        ? { date: 'asc' as const }
        : filters.sort === 'amount_desc'
          ? { amount: 'desc' as const }
          : filters.sort === 'amount_asc'
            ? { amount: 'asc' as const }
            : { date: 'desc' as const };

    const dbSelectStart = performance.now();
    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { type: true },
        orderBy,
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit
      }),
      prisma.expense.count({ where })
    ]);
    const dbSelectMs = performance.now() - dbSelectStart;

    const payload = {
      success: true,
      data: {
        items,
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total,
          totalPages: Math.ceil(total / pageLimit)
        }
      }
    };
    const serializeStart = performance.now();
    const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    const serializeMs = performance.now() - serializeStart;
    const totalMs = performance.now() - lifecycleStart;

    // Perf triage notes:
    // 1) router.refresh overuse: if one POST triggers many GET logs for this route in quick succession, client refresh/invalidation is too broad.
    // 2) N+1 queries: if dbSelectMs scales linearly with item count or query logs show repeated per-row lookups, consolidate with include/join.
    // 3) Overfetching: if payloadBytes is large relative to UI needs, trim selected fields and enforce tighter pagination.
    // 4) Missing indexes: if dbSelectMs remains high on filtered/sorted queries, run EXPLAIN ANALYZE and add composite indexes for WHERE/ORDER BY columns.
    console.log(`${timingLabel} total=${totalMs.toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbSelectMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`);

    return jsonResponse(payload);
  } catch (error) {
    const totalMs = performance.now() - lifecycleStart;
    console.log(`${timingLabel} error total=${totalMs.toFixed(1)}ms`);
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
