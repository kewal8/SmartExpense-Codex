import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type RecurringItem = {
  id: string;
  name: string;
  type: string;
  amount: number;
  dueDay: number;
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
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">{item.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">Due day {item.dueDay}</p>
            </div>
            <Badge tone="blue">{item.type}</Badge>
          </div>
          <p className="mt-2 font-mono text-xl font-semibold">{formatCurrency(item.amount)}</p>
          <div className="mt-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label={`Edit recurring payment ${item.name}`}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-blue)] transition-colors hover:bg-[rgba(0,122,255,0.08)]"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onMarkPaid(item.id)}
                aria-label={`Mark recurring payment ${item.name} as paid`}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-green)] transition-colors hover:bg-[rgba(52,199,89,0.12)]"
              >
                <Check className="h-4 w-4" />
                Mark Paid
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={deletingId === item.id}
                aria-label={`Delete recurring payment ${item.name}`}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
              >
                {deletingId === item.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
