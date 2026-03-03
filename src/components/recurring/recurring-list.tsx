import { useEffect, useState } from 'react';
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
        <div
          key={item.id}
          className={`bg-card border rounded-[14px] shadow-card px-4 py-3 flex items-center gap-3 ${
            item.showMarkPaid ? 'border-[rgba(248,113,113,0.2)]' : 'border-stroke'
          }`}
        >
          {/* Status dot */}
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.showMarkPaid ? 'bg-[#f87171]' : 'bg-[#34d399]'
            }`}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-semibold text-ink tracking-[-0.2px] truncate">
                {item.name}
              </p>
              <Badge tone="blue">{item.type}</Badge>
            </div>
            <p className="text-[11px] text-ink-3 font-mono">
              Due day {item.dueDay}
              {!item.showMarkPaid && item.nextDueInDays !== undefined && (
                item.nextDueInDays < 0
                  ? <span className="text-[#f87171]"> · overdue</span>
                  : item.nextDueInDays === 0
                  ? <span className="text-[#fbbf24]"> · due today</span>
                  : <span className="text-ink-4"> · next in {item.nextDueInDays}d</span>
              )}
            </p>
          </div>

          {/* Amount */}
          <p className="font-mono text-[15px] font-semibold tracking-[-0.4px] tabular-nums text-ink flex-shrink-0">
            ₹{item.amount.toLocaleString('en-IN')}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.showMarkPaid ? (
              <button
                type="button"
                onClick={() => onMarkPaid(item.id)}
                aria-label={`Mark recurring payment ${item.name} as paid`}
                className="h-8 px-3 rounded-[9px] text-[12px] font-semibold flex items-center gap-1.5 bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.2)] text-[#34d399] hover:bg-[rgba(52,211,153,0.2)] transition-colors whitespace-nowrap"
              >
                <Check className="w-3 h-3" />
                Mark Paid
              </button>
            ) : (
              <div className="h-8 px-3 rounded-[9px] flex items-center gap-1.5 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.12)]">
                <span className="text-[11px] font-mono font-semibold text-[#34d399]">✓ Paid</span>
              </div>
            )}

            <div data-action-menu-root className="relative">
              <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={openMenuId === item.id}
                className="w-7 h-7 flex items-center justify-center rounded-[7px] text-ink-4 hover:bg-card-2 transition-colors"
                onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === item.id ? (
                <div
                  role="menu"
                  aria-label={`Actions for recurring payment ${item.name}`}
                  className="absolute right-0 top-full mt-1 z-50 min-w-[130px] bg-card border border-stroke rounded-[10px] shadow-card p-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-card-2"
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
                    className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-semantic-red transition-colors hover:bg-[rgba(248,113,113,0.1)] disabled:text-ink-4"
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
      ))}
    </div>
  );
}
