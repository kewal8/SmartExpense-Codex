import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';
import { z } from 'zod';

const createEntrySchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
  amount: z.number().positive(),
  paidBy: z.string().min(1),
  date: z.string().optional()
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const input = createEntrySchema.parse(body);

    const raseed = await prisma.raseed.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!raseed) {
      return jsonResponse({ success: false, error: 'Raseed not found' }, 404);
    }

    const entry = await prisma.raseedEntry.create({
      data: {
        name: input.name,
        notes: input.notes,
        amount: input.amount,
        paidBy: input.paidBy,
        date: input.date ? new Date(input.date) : new Date(),
        raseedId: params.id
      }
    });

    return jsonResponse({ success: true, data: entry }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add entry';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
