import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
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
  nextDueAt: string | null;
  nextDueInDays: number | null;
  showMarkPaid: boolean;
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
  const router = useRouter();
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
          <div
            key={emi.id}
            role="link"
            tabIndex={0}
            aria-label={`Open EMI details for ${emi.name}`}
            onClick={() => router.push(`/emis/${emi.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(`/emis/${emi.id}`);
              }
            }}
            className={`bg-card border border-stroke rounded-card shadow-card cursor-pointer p-4 active:scale-[0.99] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${overdue ? 'border-semantic-red/30 shadow-[0_0_0_1px_rgba(248,113,113,0.15)]' : ''}`}
          >
            {/* Row 1: Name + end date left, badge right */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-[14px] font-semibold text-ink tracking-[-0.2px]">{emi.name}</p>
                <p className="text-[11px] text-ink-3 font-mono mt-0.5">ends {new Date(emi.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
              </div>
              <Badge tone={paidThisMonth ? 'green' : overdue ? 'red' : 'gray'}>
                {paidThisMonth ? 'Paid' : overdue ? 'Overdue' : 'Unpaid'}
              </Badge>
            </div>

            {/* Row 2: Amount left, actions right */}
            {(() => {
              const pct = Math.min((paidCount / emi.totalEmis) * 100, 100);
              const fillColor = overdue ? '#f87171' : pct > 80 ? '#34d399' : 'var(--accent)';
              return (
                <>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div>
                      <p className="font-mono text-[20px] font-semibold text-ink tracking-[-0.05em] tabular-nums">₹{emi.amount.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge tone="blue">{emi.emiType}</Badge>
                        <span className="text-[11px] text-ink-2 font-mono">Due day {emi.dueDay}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {emi.showMarkPaid ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMarkPaid(emi.id);
                          }}
                          aria-label={`Mark EMI ${emi.name} as paid`}
                          className="inline-flex h-8 items-center gap-1.5 bg-semantic-green-soft border border-semantic-green-border text-semantic-green text-[12px] font-semibold rounded-[9px] px-3 hover:bg-semantic-green/20 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Mark Paid
                        </button>
                      ) : (
                        <p className="text-[11px] text-ink-3 font-mono">
                          {emi.nextDueAt ? `Paid. Next due ${formatDate(emi.nextDueAt)}` : 'All installments paid'}
                        </p>
                      )}
                      <div data-action-menu-root className="relative">
                        <button
                          type="button"
                          aria-label="More actions"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === emi.id}
                          className="inline-flex h-8 w-8 items-center justify-center text-ink-4 hover:bg-card-2 hover:text-ink-2 rounded-lg"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((current) => (current === emi.id ? null : emi.id));
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === emi.id ? (
                          <div
                            role="menu"
                            aria-label={`Actions for EMI ${emi.name}`}
                            className="absolute right-0 top-9 z-20 min-w-[140px] bg-card border border-stroke shadow-float rounded-card p-1"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="block w-full text-left transition-colors text-[13px] text-ink hover:bg-card-2 rounded-[6px] px-3 py-2"
                              onClick={(event) => {
                                event.stopPropagation();
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
                              className="block w-full text-left transition-colors text-semantic-red hover:bg-semantic-red-soft rounded-[6px] px-3 py-2 disabled:text-ink-4"
                              onClick={(event) => {
                                event.stopPropagation();
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

                  {/* Row 3: Progress bar + count inline */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: fillColor }} />
                    </div>
                    <span className="text-[10.5px] text-ink-2 font-mono flex-shrink-0 tabular-nums">{paidCount}/{emi.totalEmis}</span>
                  </div>
                </>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
