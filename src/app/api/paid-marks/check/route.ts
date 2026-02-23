import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';
import { jsonResponse } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const { searchParams } = new URL(req.url);
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');
  const month = Number(searchParams.get('month'));
  const year = Number(searchParams.get('year'));

  if (!itemType || !itemId || Number.isNaN(month) || Number.isNaN(year)) {
    return jsonResponse({ success: false, error: 'Missing query params' }, 400);
  }

  const paid = await prisma.paidMark.findUnique({
    where: {
      userId_itemType_itemId_month_year: {
        userId: session.user.id,
        itemType,
        itemId,
        month,
        year
      }
    }
  });

  return jsonResponse({ success: true, data: { paid: Boolean(paid), paidMark: paid } });
}
