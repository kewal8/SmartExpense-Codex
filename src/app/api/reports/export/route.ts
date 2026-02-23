import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-auth';

export async function GET() {
  const session = await requireAuth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: { type: true },
    orderBy: { date: 'desc' }
  });

  const header = 'Date,Amount,Type,Note,Source\n';
  const rows = expenses
    .map((e) => {
      const safeNote = (e.note ?? '').replaceAll('"', '""');
      return `${e.date.toISOString()},${e.amount},${e.type.name},"${safeNote}",${e.source ?? 'manual'}`;
    })
    .join('\n');

  const csv = `${header}${rows}`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="smart-expense-report.csv"'
    }
  });
}
