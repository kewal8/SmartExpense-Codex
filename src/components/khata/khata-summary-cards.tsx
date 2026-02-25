import { formatCurrency } from '@/lib/utils';

export function KhataSummaryCards({ owed, owe, net }: { owed: number; owe: number; net: number }) {
  const cards = [
    {
      label: 'Total Balance (Net)',
      value: net,
      tone: net >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
    },
    {
      label: 'Total I Owe',
      value: owe,
      tone: 'text-[var(--accent-red)]'
    },
    {
      label: "Total I'm Owed",
      value: owed,
      tone: 'text-[var(--accent-green)]'
    }
  ];

  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`rounded-2xl border border-[var(--border-glass)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] p-4 shadow-[0_1px_2px_rgba(2,6,23,0.06),0_8px_24px_rgba(2,6,23,0.06)] ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}
        >
          <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">{card.label}</p>
          <p className={`mt-2 font-mono text-2xl font-semibold ${card.tone}`}>{formatCurrency(card.value)}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Outstanding only</p>
        </article>
      ))}
    </section>
  );
}
