import { parseBody } from '@/lib/api';
import { recurringSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(recurringSchema, await req.json());
    const recurring = await prisma.recurringPayment.create({
      data: { ...input, userId: session.user.id }
    });
    return jsonResponse({ success: true, data: recurring }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recurring payment';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const recurring = await prisma.recurringPayment.findMany({
    where: { userId: session.user.id },
    include: { paidMarks: true },
    orderBy: { createdAt: 'desc' }
  });

  return jsonResponse({ success: true, data: recurring });
}
