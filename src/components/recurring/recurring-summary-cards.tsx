export function RecurringSummaryCards({ totalMonthly, activeCount }: { totalMonthly: number; activeCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <article className="relative overflow-hidden bg-card border border-stroke rounded-card shadow-card p-4">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[16px] bg-accent" />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-2 mb-2">
          Total / Month
        </p>
        <p className="font-mono text-[20px] font-semibold tracking-[-0.05em] tabular-nums text-ink">
          ₹{totalMonthly.toLocaleString('en-IN')}
        </p>
      </article>

      <article className="relative overflow-hidden bg-card border border-stroke rounded-card shadow-card p-4">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[16px] bg-semantic-green" />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-2 mb-2">
          Active
        </p>
        <p className="font-mono text-[20px] font-semibold tracking-[-0.05em] tabular-nums text-ink">
          {activeCount}
        </p>
      </article>
    </div>
  );
}
