'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

const PREVIEW_COUNT = 3;

export function AmountToCollect({ items }: { items: CollectItem[] }) {
  const visible = items.slice(0, PREVIEW_COUNT);

  return (
    <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden p-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-1 pb-3 border-b border-[rgba(255,255,255,0.04)]">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">
          Amount to Collect
        </span>
        {items.length > 0 && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.2)] text-[#fbbf24]">
            {items.length} pending
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 rounded-[12px] bg-card-2 border border-stroke flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4 text-ink-4" />
          </div>
          <p className="text-[13px] font-semibold text-ink-3 tracking-[-0.1px]">No near deadlines</p>
          <p className="text-[11.5px] text-ink-4 font-mono mt-1 max-w-[200px]">No lend entries are due in the next 7 days.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 pt-3">
            {visible.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-stroke rounded-[14px] shadow-card px-4 py-[13px] flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: '#fbbf24' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink tracking-[-0.2px] truncate">
                    {item.personName}
                  </p>
                  <p className="text-[11px] text-ink-3 font-mono mt-0.5">
                    Due {dueLabel(item)}
                  </p>
                </div>
                <p className="font-mono text-[14px] font-bold tracking-[-0.4px] tabular-nums flex-shrink-0" style={{ color: '#fbbf24' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          {/* See all — navigates to khata page */}
          {items.length > PREVIEW_COUNT && (
            <Link
              href="/khata"
              className="flex items-center justify-center gap-1.5 w-full pt-3 mt-2 text-[13px] font-semibold text-accent font-mono border-t border-[rgba(255,255,255,0.04)] hover:bg-card-2 transition-colors"
            >
              See all {items.length} entries →
            </Link>
          )}
        </>
      )}
    </div>
  );
}
