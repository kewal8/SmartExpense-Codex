import { parseBody } from '@/lib/api';
import { personSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(personSchema, await req.json());
    const person = await prisma.person.create({
      data: { ...input, userId: session.user.id }
    });
    return jsonResponse({ success: true, data: person }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create person';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const persons = await prisma.person.findMany({
    where: { userId: session.user.id },
    include: {
      lends: { where: { userId: session.user.id } },
      borrows: { where: { userId: session.user.id } }
    },
    orderBy: { name: 'asc' }
  });

  const enriched = persons.map((person) => {
    const lendUnsettled = person.lends
      .filter((t) => t.type === 'lend' && !t.settled)
      .reduce((sum, t) => sum + (t.amount - t.settledAmount), 0);
    const borrowUnsettled = person.lends
      .filter((t) => t.type === 'borrow' && !t.settled)
      .reduce((sum, t) => sum + (t.amount - t.settledAmount), 0);

    return {
      ...person,
      netBalance: lendUnsettled - borrowUnsettled
    };
  });

  return jsonResponse({ success: true, data: enriched });
}
