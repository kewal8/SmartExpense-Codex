import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';
import { z } from 'zod';

const updateRaseedSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const raseed = await prisma.raseed.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { entries: { orderBy: { createdAt: 'asc' } } }
  });

  if (!raseed) {
    return jsonResponse({ success: false, error: 'Raseed not found' }, 404);
  }

  return jsonResponse({ success: true, data: raseed });
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const input = updateRaseedSchema.parse(body);

    const existing = await prisma.raseed.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!existing) {
      return jsonResponse({ success: false, error: 'Raseed not found' }, 404);
    }

    const raseed = await prisma.raseed.update({
      where: { id: params.id },
      data: input,
      include: { entries: { orderBy: { createdAt: 'asc' } } }
    });

    return jsonResponse({ success: true, data: raseed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update raseed';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  await prisma.raseed.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}
