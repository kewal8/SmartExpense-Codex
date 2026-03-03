'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

type CollectItem = {
  id: string;
  personName: string;
  amount: number;
  dueDate: string;
  dueInDays: number;
};

function dueLabel(item: CollectItem) {
  if (item.dueInDays === 0) return 'Today';
  if (item.dueInDays === 1) return 'Tomorrow';
  if (item.dueInDays > 1 && item.dueInDays <= 7) return `In ${item.dueInDays} days`;
  return formatDate(item.dueDate);
}

export function AmountToCollect({ items }: { items: CollectItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 3;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <GlassCard>
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">
          Amount to Collect
        </span>
        {items.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono bg-semantic-amber-soft text-semantic-amber border border-semantic-amber-border">
            {items.length} pending
          </span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-10 h-10 rounded-[12px] bg-card-2 border border-stroke flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4 text-ink-4" />
            </div>
            <p className="text-[13px] font-semibold text-ink-3 tracking-[-0.1px]">No near deadlines</p>
            <p className="text-[11.5px] text-ink-4 font-mono mt-1 max-w-[200px]">No lend entries are due in the next 7 days.</p>
          </div>
        ) : (
          visible.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-card border border-stroke bg-card-2 p-3 transition-colors hover:bg-card">
              <div>
                <p className="text-[13px] font-semibold text-ink">{item.personName}</p>
                <p className="text-[11px] text-ink-3 font-mono">Due {dueLabel(item)}</p>
              </div>
              <p className="font-mono text-[13px] font-semibold tabular-nums text-semantic-amber">{formatCurrency(item.amount)}</p>
            </div>
          ))
        )}
      </div>
      {items.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full pt-3 pb-1 text-[12px] font-semibold text-accent hover:text-accent-2 transition-colors font-mono tracking-wide"
        >
          {expanded ? '↑ Show less' : `See all ${items.length} entries →`}
        </button>
      )}
    </GlassCard>
  );
}
