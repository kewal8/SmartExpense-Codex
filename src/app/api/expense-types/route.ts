import { parseBody } from '@/lib/api';
import { expenseTypeSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const data = await prisma.expenseType.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { expenses: true }
      }
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
  });

  return jsonResponse({ success: true, data });
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(expenseTypeSchema, await req.json());
    const normalizedName = input.name.trim();
    if (!normalizedName) {
      return jsonResponse({ success: false, error: 'Type name is required' }, 400);
    }

    const duplicate = await prisma.expenseType.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: normalizedName, mode: 'insensitive' }
      }
    });

    if (duplicate) {
      return jsonResponse({ success: false, error: 'Type name already exists' }, 409);
    }

    const data = await prisma.expenseType.create({
      data: {
        userId: session.user.id,
        name: normalizedName,
        icon: input.icon
      }
    });
    return jsonResponse({ success: true, data }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create expense type';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return jsonResponse({ success: false, error: 'Type id is required' }, 400);
  }

  const linked = await prisma.expense.count({ where: { userId: session.user.id, typeId: id } });
  if (linked > 0) {
    return jsonResponse({ success: false, error: 'Cannot delete expense type linked to expenses' }, 400);
  }

  await prisma.expenseType.deleteMany({ where: { id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id } });
}

export async function PUT(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!id) {
      return jsonResponse({ success: false, error: 'Type id is required' }, 400);
    }
    if (!name) {
      return jsonResponse({ success: false, error: 'Type name is required' }, 400);
    }

    const exists = await prisma.expenseType.findFirst({
      where: { id, userId: session.user.id }
    });
    if (!exists) {
      return jsonResponse({ success: false, error: 'Expense type not found' }, 404);
    }

    const duplicate = await prisma.expenseType.findFirst({
      where: {
        userId: session.user.id,
        id: { not: id },
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (duplicate) {
      return jsonResponse({ success: false, error: 'Type name already exists' }, 409);
    }

    const data = await prisma.expenseType.update({
      where: { id },
      data: { name }
    });

    return jsonResponse({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense type';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
