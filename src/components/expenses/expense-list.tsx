import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type ExpenseItem = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  type: { name: string };
};

export function ExpenseList({
  expenses,
  deletingId,
  onDelete
}: {
  expenses: ExpenseItem[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  if (expenses.length === 0) {
    return <EmptyState title="No expenses yet" description="Add your first expense to get started." />;
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div key={expense.id} className="glass-card flex items-center justify-between p-4">
          <div>
            <h3 className="text-base font-semibold">{expense.type.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{formatDate(expense.date)}</p>
            {expense.note ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{expense.note}</p> : null}
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold">{formatCurrency(expense.amount)}</p>
            <button
              type="button"
              aria-label={`Delete expense ${expense.type.name}`}
              className="mt-1 inline-flex rounded-lg p-1 text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
              disabled={deletingId === expense.id}
              onClick={() => onDelete(expense.id)}
            >
              {deletingId === expense.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
