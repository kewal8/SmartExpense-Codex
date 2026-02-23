import { parseBody } from '@/lib/api';
import { categoryBudgetSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const data = await prisma.categoryBudget.findMany({
    where: { userId: session.user.id },
    include: { type: true }
  });

  return jsonResponse({ success: true, data });
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(categoryBudgetSchema, await req.json());

    const data = await prisma.categoryBudget.upsert({
      where: { typeId: input.typeId },
      create: {
        userId: session.user.id,
        typeId: input.typeId,
        amount: input.amount
      },
      update: { amount: input.amount }
    });

    return jsonResponse({ success: true, data }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save category budget';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
