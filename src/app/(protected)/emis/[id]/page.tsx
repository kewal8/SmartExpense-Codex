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

      <section className="bg-card border border-stroke rounded-[18px] shadow-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink-2 mb-1">{emi.emiType}</p>
            <p className="font-mono text-[26px] font-semibold tracking-[-0.05em] tabular-nums text-ink">
              ₹{emi.amount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-mono text-ink-2">Due day {emi.dueDay}</p>
            <p className="text-[11px] font-mono text-ink-3 mt-0.5">
              {emi.startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} →{' '}
              {emi.endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-ink-2">{paidByCycle.size} of {emi.totalEmis} paid</span>
            <span className="text-[11px] font-mono text-ink-3">{Math.round((paidByCycle.size / emi.totalEmis) * 100)}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min((paidByCycle.size / emi.totalEmis) * 100, 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {sortedMonths.length === 0 ? (
          <EmptyState
            title="No EMI entries"
            description="Payment cycles will appear here once EMI schedule is available."
          />
        ) : (
          sortedMonths.map((monthKey) => {
            const [year, month] = monthKey.split('-').map(Number);
            return (
              <article key={monthKey}>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 px-1 mb-2">
                  {format(new Date(year, month - 1, 1), 'MMMM yyyy')}
                </p>
                <div className="bg-card border border-stroke rounded-[16px] shadow-card overflow-hidden">
                  {grouped[monthKey]
                    .sort(sortInstallments)
                    .map((entry) => (
                      <div
                        key={`${monthKey}-${entry.dueDate.toISOString()}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[15px] font-semibold text-ink tracking-[-0.4px] tabular-nums">
                            ₹{entry.amount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-ink-3 font-mono mt-0.5">
                            Due {entry.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {entry.paidDate && (
                              <span className="text-ink-2">
                                {' '}· paid {entry.paidDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </p>
                        </div>
                        {entry.status === 'Paid' ? (
                          <span className="text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.2)] text-[#34d399] flex-shrink-0">
                            ✓ Paid
                          </span>
                        ) : entry.isFuturePending ? (
                          <span className="text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[rgba(110,107,132,0.12)] border border-[rgba(110,107,132,0.2)] text-ink-3 flex-shrink-0">
                            Upcoming
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.2)] text-[#fbbf24] flex-shrink-0">
                            Pending
                          </span>
                        )}
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
