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
  const userId = session.user.id;

  const [persons, lendAgg, borrowAgg] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      include: {
        lends: { where: { userId } },
        borrows: { where: { userId } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'lend', settled: false },
      _sum: { amount: true, settledAmount: true }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'borrow', settled: false },
      _sum: { amount: true, settledAmount: true }
    })
  ]);

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

  const owed = (lendAgg._sum.amount ?? 0) - (lendAgg._sum.settledAmount ?? 0);
  const owe = (borrowAgg._sum.amount ?? 0) - (borrowAgg._sum.settledAmount ?? 0);

  return Response.json({
    success: true,
    data: enriched,
    summary: {
      owed,
      owe,
      net: owed - owe
    }
  });
}
