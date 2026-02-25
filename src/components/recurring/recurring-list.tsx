import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type RecurringItem = {
  id: string;
  name: string;
  type: string;
  amount: number;
  dueDay: number;
  nextDueAt: string;
  nextDueInDays: number;
  showMarkPaid: boolean;
};

export function RecurringList({
  items,
  onEdit,
  onDelete,
  onMarkPaid,
  deletingId
}: {
  items: RecurringItem[];
  onEdit: (item: RecurringItem) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  deletingId: string | null;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!openMenuId) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-action-menu-root]')) return;
      setOpenMenuId(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenuId]);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold">{item.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">Due day {item.dueDay}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xl font-semibold">{formatCurrency(item.amount)}</p>
              <div className="mt-2">
                <Badge tone="blue">{item.type}</Badge>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {item.showMarkPaid ? (
                <button
                  type="button"
                  onClick={() => onMarkPaid(item.id)}
                  aria-label={`Mark recurring payment ${item.name} as paid`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[rgba(52,199,89,0.25)] bg-[rgba(52,199,89,0.12)] px-3 py-2 text-sm font-medium text-[var(--accent-green)] transition-colors hover:bg-[rgba(52,199,89,0.18)]"
                >
                  <Check className="h-4 w-4" />
                  Mark Paid
                </button>
              ) : (
                <p className="text-xs text-[var(--text-secondary)]">Paid. Next due in {item.nextDueInDays} days</p>
              )}
                <div data-action-menu-root className="relative">
                <button
                  type="button"
                  aria-label="More actions"
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === item.id}
                  className="tap-feedback-soft inline-flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-secondary)]"
                  onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {openMenuId === item.id ? (
                  <div
                    role="menu"
                    aria-label={`Actions for recurring payment ${item.name}`}
                    className="absolute right-0 top-11 z-20 min-w-[140px] rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1 shadow-[var(--shadow-medium)] backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(item);
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
                      disabled={deletingId === item.id}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(item.id);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {deletingId === item.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
