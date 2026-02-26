import { formatCurrency } from '@/lib/utils';

export function RecurringSummaryCards({ totalMonthly, activeCount }: { totalMonthly: number; activeCount: number }) {
  return (
    <section className="grid grid-cols-2 gap-2">
      <article className="rounded-2xl border border-[var(--border-glass)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] p-4 shadow-[0_1px_2px_rgba(2,6,23,0.06),0_8px_24px_rgba(2,6,23,0.06)]">
        <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Total Recurring / Month</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(totalMonthly)}</p>
      </article>
      <article className="rounded-2xl border border-[var(--border-glass)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] p-4 shadow-[0_1px_2px_rgba(2,6,23,0.06),0_8px_24px_rgba(2,6,23,0.06)]">
        <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Active Recurring</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-[var(--text-primary)]">{activeCount}</p>
      </article>
    </section>
  );
}
