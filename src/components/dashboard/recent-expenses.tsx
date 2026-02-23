import { formatCurrency, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ReceiptText } from 'lucide-react';

type RecentExpense = {
  id: string;
  amount: number;
  date: string;
  type: { name: string };
};

export function RecentExpenses({ expenses, onAddExpense }: { expenses: RecentExpense[]; onAddExpense: () => void }) {
  return (
    <GlassCard>
      <h2 className="text-xl font-semibold tracking-[-0.01em]">Recent Expenses</h2>
      <div className="mt-4 space-y-2">
        {expenses.length === 0 ? (
          <EmptyState
            title="No recent expenses"
            description="Start logging spending to see your recent activity here."
            icon={<ReceiptText className="h-5 w-5" />}
            ctaLabel="Add Expense"
            onCta={onAddExpense}
          />
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
              <div>
                <p className="text-sm font-medium">{expense.type.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{formatDate(expense.date)}</p>
              </div>
              <p className="font-mono text-sm font-semibold">{formatCurrency(expense.amount)}</p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
