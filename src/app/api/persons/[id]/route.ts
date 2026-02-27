import { parseBody } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { personSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(personSchema, await req.json());
    const result = await prisma.person.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: { name: input.name.trim() }
    });
    if (result.count === 0) {
      return jsonResponse({ success: false, error: 'Person not found' }, 404);
    }
    const person = await prisma.person.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!person) {
      return jsonResponse({ success: false, error: 'Person not found' }, 404);
    }
    return jsonResponse({ success: true, data: person });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update person';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const txCount = await prisma.transaction.count({
    where: { userId: session.user.id, personId: params.id }
  });

  if (txCount > 0) {
    return jsonResponse({ success: false, error: 'Cannot delete person with transactions' }, 400);
  }

  await prisma.person.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return jsonResponse({ success: true, data: { id: params.id } });
}
