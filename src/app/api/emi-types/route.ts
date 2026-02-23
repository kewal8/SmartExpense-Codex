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
  const userId = session.user.id;

  const types = await prisma.emiType.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
  });

  const data = await Promise.all(
    types.map(async (type) => {
      const emiCount = await prisma.eMI.count({
        where: { userId, emiType: { equals: type.name, mode: 'insensitive' } }
      });
      return {
        ...type,
        _count: { emis: emiCount }
      };
    })
  );

  return jsonResponse({ success: true, data });
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  try {
    const input = parseBody(expenseTypeSchema, await req.json());
    const name = input.name.trim();

    if (name.length < 2) {
      return jsonResponse({ success: false, error: 'EMI type must be at least 2 characters' }, 400);
    }

    const duplicate = await prisma.emiType.findFirst({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (duplicate) {
      return jsonResponse({ success: false, error: 'EMI type already exists' }, 409);
    }

    const data = await prisma.emiType.create({
      data: {
        userId,
        name,
        isDefault: false
      }
    });

    return jsonResponse({ success: true, data }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create EMI type';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function PUT(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!id) {
      return jsonResponse({ success: false, error: 'EMI type id is required' }, 400);
    }
    if (name.length < 2) {
      return jsonResponse({ success: false, error: 'EMI type must be at least 2 characters' }, 400);
    }

    const exists = await prisma.emiType.findFirst({
      where: { id, userId }
    });

    if (!exists) {
      return jsonResponse({ success: false, error: 'EMI type not found' }, 404);
    }

    const duplicate = await prisma.emiType.findFirst({
      where: {
        userId,
        id: { not: id },
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (duplicate) {
      return jsonResponse({ success: false, error: 'EMI type already exists' }, 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data = await tx.emiType.update({
        where: { id },
        data: { name }
      });

      if (exists.name.toLowerCase() !== name.toLowerCase()) {
        await tx.eMI.updateMany({
          where: { userId, emiType: { equals: exists.name, mode: 'insensitive' } },
          data: { emiType: name }
        });
      }

      return data;
    });

    return jsonResponse({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update EMI type';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return jsonResponse({ success: false, error: 'EMI type id is required' }, 400);
  }

  const type = await prisma.emiType.findFirst({
    where: { id, userId }
  });

  if (!type) {
    return jsonResponse({ success: false, error: 'EMI type not found' }, 404);
  }

  const inUse = await prisma.eMI.count({
    where: { userId, emiType: { equals: type.name, mode: 'insensitive' } }
  });

  if (inUse > 0) {
    return jsonResponse({ success: false, error: 'This EMI type is used and can’t be deleted.' }, 400);
  }

  await prisma.emiType.delete({ where: { id } });

  return jsonResponse({ success: true, data: { id } });
}
