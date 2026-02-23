import { parseBody } from '@/lib/api';
import { settingsSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      currency: true,
      monthlyBudget: true,
      darkMode: true,
      emailReminders: true,
      reminderFrequency: true
    }
  });

  return jsonResponse({ success: true, data: user });
}

export async function PUT(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const input = parseBody(settingsSchema, await req.json());
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: input,
      select: {
        email: true,
        currency: true,
        monthlyBudget: true,
        darkMode: true,
        emailReminders: true,
        reminderFrequency: true
      }
    });

    return jsonResponse({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
