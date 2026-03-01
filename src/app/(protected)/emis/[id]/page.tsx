import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { format, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

function cycleDate(year: number, month: number, dueDay: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(dueDay, 1), lastDay);
  return new Date(year, month, safeDay);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmiDetailPage(props: PageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const emi = await prisma.eMI.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { paidMarks: true }
  });

  if (!emi) {
    notFound();
  }

  const paidByCycle = new Map<string, (typeof emi.paidMarks)[number]>();
  for (const mark of emi.paidMarks) {
    const key = `${mark.year}-${mark.month}`;
    const existing = paidByCycle.get(key);
    if (!existing || mark.paidDate.getTime() > existing.paidDate.getTime()) {
      paidByCycle.set(key, mark);
    }
  }
  const installmentCount = Math.max(emi.totalEmis, 1);
  const today = startOfDay(new Date());

  const installments = Array.from({ length: installmentCount }).map((_, index) => {
    const cycleMonth = emi.startDate.getMonth() + index;
    const cycleYear = emi.startDate.getFullYear() + Math.floor(cycleMonth / 12);
    const normalizedMonth = ((cycleMonth % 12) + 12) % 12;
    const cycleKey = `${cycleYear}-${normalizedMonth}`;
    const dueDate = cycleDate(cycleYear, normalizedMonth, emi.dueDay);
    const paidMark = paidByCycle.get(cycleKey);

    return {
      cycleKey: format(dueDate, 'yyyy-MM'),
      dueDate,
      amount: emi.amount,
      paidDate: paidMark?.paidDate ?? null,
      status: paidMark ? 'Paid' : 'Pending',
      isFuturePending: !paidMark && dueDate > today,
      activityDate: paidMark?.paidDate ?? dueDate
    };
  });

  const sortInstallments = (a: (typeof installments)[number], b: (typeof installments)[number]) => {
    if (a.isFuturePending !== b.isFuturePending) {
      return a.isFuturePending ? 1 : -1;
    }
    if (!a.isFuturePending && !b.isFuturePending) {
      return b.activityDate.getTime() - a.activityDate.getTime();
    }
    return a.dueDate.getTime() - b.dueDate.getTime();
  };

  const grouped = installments.reduce<Record<string, typeof installments>>((acc, installment) => {
    if (!acc[installment.cycleKey]) {
      acc[installment.cycleKey] = [];
    }
    acc[installment.cycleKey].push(installment);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    const aTop = grouped[a].slice().sort(sortInstallments)[0];
    const bTop = grouped[b].slice().sort(sortInstallments)[0];
    return sortInstallments(aTop, bTop);
  });

  return (
    <div className="space-y-4">
      <PageCrumbHeader
        title={emi.name}
        parentLabel="EMI"
        parentHref="/emis"
        crumbs={[
          { label: 'EMI', href: '/emis' },
          { label: emi.name }
        ]}
      />

      <section className="glass-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{emi.emiType}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{formatCurrency(emi.amount)}</p>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            <p>Due day {emi.dueDay}</p>
            <p>{formatDate(emi.startDate)} to {formatDate(emi.endDate)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {sortedMonths.length === 0 ? (
          <EmptyState
            title="No EMI entries"
            description="Payment cycles will appear here once EMI schedule is available."
          />
        ) : (
          sortedMonths.map((monthKey) => {
            const [year, month] = monthKey.split('-').map(Number);
            return (
            <article key={monthKey} className="glass-card p-4">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">{format(new Date(year, month - 1, 1), 'MMMM yyyy')}</h2>
              <div className="mt-3 space-y-2">
                {grouped[monthKey]
                  .sort(sortInstallments)
                  .map((entry) => (
                    <div key={`${monthKey}-${entry.dueDate.toISOString()}`} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-glass)] p-3">
                      <div className="min-w-0">
                        <p className="font-mono text-base font-semibold">{formatCurrency(entry.amount)}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Due: {formatDate(entry.dueDate)}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Paid Date: {entry.paidDate ? formatDate(entry.paidDate) : '—'}
                        </p>
                      </div>
                      <Badge tone={entry.status === 'Paid' ? 'green' : 'gray'}>{entry.status}</Badge>
                    </div>
                  ))}
              </div>
            </article>
            );
          })
        )}
      </section>
    </div>
  );
}
