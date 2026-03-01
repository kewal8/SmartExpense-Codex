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
  const reqStart = performance.now();
  const authStart = performance.now();
  const session = await requireAuth();
  const authMs = performance.now() - authStart;
  if (!session?.user?.id) {
    console.log(
      `[PERF] /api/persons total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=0.0ms serialize=0.0ms size=0.0kb`
    );
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }
  const userId = session.user.id;

  const dbStart = performance.now();
  const [persons, unsettledTx] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        lends: { where: { userId }, select: { id: true } },
        borrows: { where: { userId }, select: { id: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.transaction.findMany({
      where: { userId, settled: false, type: { in: ['lend', 'borrow'] } },
      select: { personId: true, type: true, amount: true, settledAmount: true }
    })
  ]);
  const dbMs = performance.now() - dbStart;

  const balanceByPerson = new Map<string, number>();
  let owed = 0;
  let owe = 0;
  for (const tx of unsettledTx) {
    const outstanding = tx.amount - tx.settledAmount;
    if (tx.type === 'lend') owed += outstanding;
    if (tx.type === 'borrow') owe += outstanding;
    const current = balanceByPerson.get(tx.personId) ?? 0;
    balanceByPerson.set(tx.personId, current + (tx.type === 'lend' ? outstanding : -outstanding));
  }

  const enriched = persons.map((person) => {
    return {
      ...person,
      netBalance: balanceByPerson.get(person.id) ?? 0
    };
  });

  const serializeStart = performance.now();
  const payload = {
    success: true,
    data: enriched,
    summary: {
      owed,
      owe,
      net: owed - owe
    }
  };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const serializeMs = performance.now() - serializeStart;

  console.log(
    `[PERF] /api/persons total=${(performance.now() - reqStart).toFixed(1)}ms auth=${authMs.toFixed(1)}ms db=${dbMs.toFixed(1)}ms serialize=${serializeMs.toFixed(1)}ms size=${(payloadBytes / 1024).toFixed(1)}kb`
  );

  return Response.json(payload);
}
