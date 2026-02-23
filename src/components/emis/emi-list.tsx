import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, Pencil, Trash2 } from 'lucide-react';
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
            <div className="mt-3 flex items-center justify-between">
              <p className="font-mono text-xl font-semibold">{formatCurrency(emi.amount)}</p>
              <p className="text-sm text-[var(--text-secondary)]">Due day {emi.dueDay}</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[rgba(134,134,139,0.2)]">
              <div className="h-2 rounded-full bg-[var(--accent-blue)]" style={{ width: `${Math.min((paidCount / emi.totalEmis) * 100, 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {paidCount} of {emi.totalEmis} paid
            </p>
            <div className="mt-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(emi)}
                  aria-label={`Edit EMI ${emi.name}`}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-blue)] transition-colors hover:bg-[rgba(0,122,255,0.08)]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onMarkPaid(emi.id)}
                  aria-label={`Mark EMI ${emi.name} as paid`}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-green)] transition-colors hover:bg-[rgba(52,199,89,0.12)]"
                >
                  <Check className="h-4 w-4" />
                  Mark Paid
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(emi.id)}
                  disabled={deletingId === emi.id}
                  aria-label={`Delete EMI ${emi.name}`}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.12)] disabled:text-[var(--text-tertiary)]"
                >
                  {deletingId === emi.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
