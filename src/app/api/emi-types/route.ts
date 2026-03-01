import { parseBody } from '@/lib/api';
import { expenseTypeSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(`[PERF] /api/emi-types total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`);
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const dbStart = performance.now();
  const [types, counts] = await Promise.all([
    prisma.emiType.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isDefault: true,
        userId: true,
        createdAt: true
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
    }),
    prisma.eMI.groupBy({
      by: ['emiType'],
      where: { userId },
      _count: { _all: true }
    })
  ]);
  const countByType = new Map(counts.map((row) => [row.emiType.toLowerCase(), row._count._all]));
  const dbMs = performance.now() - dbStart;

  const data = types.map((type) => ({
    ...type,
    _count: { emis: countByType.get(type.name.toLowerCase()) ?? 0 }
  }));

  const serializeStart = performance.now();
  const payload = { success: true, data };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/emi-types total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return jsonResponse(payload);
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
