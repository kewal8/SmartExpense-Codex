'use client';

import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';

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
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold tracking-[-0.01em]">Amount to be collected</h2>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <EmptyState
            title="No near deadlines"
            description="No lend entries are due in the next 7 days."
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.personName}</p>
                <p className="text-xs text-[var(--text-secondary)]">Due {dueLabel(item)}</p>
              </div>
              <p className="font-mono text-sm font-semibold">{formatCurrency(item.amount)}</p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
