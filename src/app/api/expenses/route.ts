import { Prisma } from '@prisma/client';
import { paginationSchema } from '@/lib/validations';
import { parseBody } from '@/lib/api';
import { expenseSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/server-auth';

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const input = parseBody(expenseSchema, body);

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

    return jsonResponse({ success: true, data: expense }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
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

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { type: true },
        orderBy,
        skip: (page.page - 1) * page.limit,
        take: page.limit
      }),
      prisma.expense.count({ where })
    ]);

    return jsonResponse({
      success: true,
      data: {
        items,
        pagination: {
          page: page.page,
          limit: page.limit,
          total,
          totalPages: Math.ceil(total / page.limit)
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
