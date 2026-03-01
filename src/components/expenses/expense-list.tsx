'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type ExpenseItem = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  typeId: string;
  type: { id: string; name: string };
};

export function ExpenseList({
  expenses,
  deletingId,
  onDelete,
  onEdit
}: {
  expenses: ExpenseItem[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onEdit: (expense: ExpenseItem) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!openMenuId) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-expense-action-menu-root]')) return;
      setOpenMenuId(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenuId]);

  if (expenses.length === 0) {
    return <EmptyState title="No expenses yet" description="Start by adding your first expense." />;
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
          <div className="text-right" data-expense-action-menu-root>
            <p className="font-mono text-lg font-semibold">{formatCurrency(expense.amount)}</p>
            <div className="relative mt-1">
              <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={openMenuId === expense.id}
                className="tap-feedback-soft inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-secondary)]"
                onClick={() => setOpenMenuId((current) => (current === expense.id ? null : expense.id))}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === expense.id ? (
                <div
                  role="menu"
                  aria-label={`Actions for expense ${expense.type.name}`}
                  className="absolute right-0 top-10 z-20 min-w-[140px] rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1 shadow-[var(--shadow-medium)] backdrop-blur-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
                    onClick={() => {
                      setOpenMenuId(null);
                      onEdit(expense);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    aria-label={`Delete expense ${expense.type.name}`}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
                    disabled={deletingId === expense.id}
                    onClick={() => {
                      setOpenMenuId(null);
                      onDelete(expense.id);
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {deletingId === expense.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
