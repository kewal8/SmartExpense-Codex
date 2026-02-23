'use client';

import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';

const toneByUrgency = ['red', 'orange', 'orange', 'gray'] as const;

type ReminderItem = {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  urgency: 0 | 1 | 2 | 3;
  kind: string;
};

export function PaymentReminders({ reminders }: { reminders: ReminderItem[] }) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold tracking-[-0.01em]">Payment Reminders</h2>
      <div className="mt-4 space-y-2">
        {reminders.length === 0 ? (
          <EmptyState
            title="No upcoming payments"
            description="You’re all caught up for now."
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{reminder.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">Due {formatDate(reminder.dueDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-semibold">{formatCurrency(reminder.amount)}</p>
                <Badge tone={toneByUrgency[reminder.urgency]}> {reminder.kind} </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
