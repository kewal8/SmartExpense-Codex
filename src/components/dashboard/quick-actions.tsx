'use client';

import { Plus, ArrowUp, ArrowDown } from 'lucide-react';

export function QuickActions({
  onAddExpense,
  onLend,
  onBorrow,
}: {
  onAddExpense: () => void;
  onLend: () => void;
  onBorrow: () => void;
}) {
  return (
    <div className="bg-card border border-stroke rounded-card shadow-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-3">Quick Actions</p>
      <div className="flex gap-2">
        {/* Primary — Add Expense */}
        <button
          onClick={onAddExpense}
          className="flex flex-1 items-center gap-2.5 rounded-[10px] bg-accent px-3 py-2.5 shadow-[0_4px_12px_var(--accent-glow)] transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <Plus size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold text-white leading-none">Add Expense</p>
            <p className="text-[10px] text-white/55 mt-0.5">Log a transaction</p>
          </div>
        </button>

        {/* Lend */}
        <button
          onClick={onLend}
          className="flex flex-1 items-center gap-2.5 rounded-[10px] bg-card-2 border border-stroke px-3 py-2.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-semantic-green-soft border border-semantic-green-border">
            <ArrowUp size={14} className="text-semantic-green" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold text-ink leading-none">Lend</p>
            <p className="text-[10px] text-ink-3 mt-0.5">Give money</p>
          </div>
        </button>

        {/* Borrow */}
        <button
          onClick={onBorrow}
          className="flex flex-1 items-center gap-2.5 rounded-[10px] bg-card-2 border border-stroke px-3 py-2.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-semantic-amber-soft border border-semantic-amber-border">
            <ArrowDown size={14} className="text-semantic-amber" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold text-ink leading-none">Borrow</p>
            <p className="text-[10px] text-ink-3 mt-0.5">Take money</p>
          </div>
        </button>
      </div>
    </div>
  );
}
