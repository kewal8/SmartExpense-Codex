import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';
import { z } from 'zod';

const createRaseedSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const raseeds = await prisma.raseed.findMany({
    where: { userId: session.user.id },
    include: { entries: true },
    orderBy: { createdAt: 'desc' }
  });

  return jsonResponse({ success: true, data: raseeds });
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const input = createRaseedSchema.parse(body);

    const raseed = await prisma.raseed.create({
      data: {
        name: input.name,
        description: input.description,
        userId: session.user.id
      },
      include: { entries: true }
    });

    return jsonResponse({ success: true, data: raseed }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create raseed';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
