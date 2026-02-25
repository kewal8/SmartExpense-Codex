import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type EMIPaidMark = { month: number; year: number };
type EMIItem = {
  id: string;
  name: string;
  amount: number;
  emiType: string;
  dueDay: number;
  totalEmis: number;
  endDate: string;
  startDate: string;
  paidMarks: EMIPaidMark[];
};

export function EMIList({
  emis,
  onEdit,
  onDelete,
  onMarkPaid,
  deletingId
}: {
  emis: EMIItem[];
  onEdit: (emi: EMIItem) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  deletingId: string | null;
}) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
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
      {emis.map((emi) => {
        const paidThisMonth = emi.paidMarks.some((mark) => mark.month === month && mark.year === year);
        const paidCount = emi.paidMarks.length;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), emi.dueDay);
        const overdue = !paidThisMonth && dueDate < now;

        return (
          <div key={emi.id} className={`glass-card p-4 ${overdue ? 'border-[var(--accent-red)]/50' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">{emi.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{formatDate(emi.endDate)} end date</p>
              </div>
              <Badge tone={paidThisMonth ? 'green' : overdue ? 'red' : 'gray'}>
                {paidThisMonth ? 'Paid' : overdue ? 'Overdue' : 'Unpaid'}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xl font-semibold">{formatCurrency(emi.amount)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{emi.emiType}</Badge>
                  <p className="text-sm text-[var(--text-secondary)]">Due day {emi.dueDay}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onMarkPaid(emi.id)}
                  aria-label={`Mark EMI ${emi.name} as paid`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[rgba(52,199,89,0.25)] bg-[rgba(52,199,89,0.12)] px-3 py-2 text-sm font-medium text-[var(--accent-green)] transition-colors hover:bg-[rgba(52,199,89,0.18)]"
                >
                  <Check className="h-4 w-4" />
                  Mark Paid
                </button>
                <div data-action-menu-root className="relative">
                  <button
                    type="button"
                    aria-label="More actions"
                    aria-haspopup="menu"
                    aria-expanded={openMenuId === emi.id}
                    className="tap-feedback-soft inline-flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-secondary)]"
                    onClick={() => setOpenMenuId((current) => (current === emi.id ? null : emi.id))}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenuId === emi.id ? (
                    <div
                      role="menu"
                      aria-label={`Actions for EMI ${emi.name}`}
                      className="absolute right-0 top-11 z-20 min-w-[140px] rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1 shadow-[var(--shadow-medium)] backdrop-blur-xl"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(emi);
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
                        disabled={deletingId === emi.id}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(emi.id);
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          {deletingId === emi.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[rgba(134,134,139,0.2)]">
              <div className="h-2 rounded-full bg-[var(--accent-blue)]" style={{ width: `${Math.min((paidCount / emi.totalEmis) * 100, 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {paidCount} of {emi.totalEmis} paid
            </p>
          </div>
        );
      })}
    </div>
  );
}
