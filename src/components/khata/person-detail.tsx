import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { HandCoins } from 'lucide-react';

type Transaction = {
  id: string;
  type: 'lend' | 'borrow';
  amount: number;
  settledAmount: number;
  settled?: boolean;
  createdAt: string;
};

export function PersonDetail({
  transactions,
  settlingId,
  deletingId,
  onSettle,
  onDelete,
  onLend,
  onBorrow
}: {
  transactions: Transaction[];
  settlingId: string | null;
  deletingId: string | null;
  onSettle: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onLend?: () => void;
  onBorrow?: () => void;
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Lend or borrow to start tracking balances with this person."
        icon={<HandCoins className="h-5 w-5" />}
        primaryAction={onLend ? { label: 'Lend', onClick: onLend } : undefined}
        secondaryAction={onBorrow ? { label: 'Borrow', onClick: onBorrow } : undefined}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <Badge tone={tx.type === 'lend' ? 'green' : 'orange'}>{tx.type.toUpperCase()}</Badge>
            <p className="text-xs text-[var(--text-secondary)]">{formatDate(tx.createdAt)}</p>
          </div>
          <p className="mt-2 font-mono text-xl font-semibold">{formatCurrency(tx.amount)}</p>
          <p className="text-xs text-[var(--text-secondary)]">Settled: {formatCurrency(tx.settledAmount)}</p>
          <div className="mt-3 flex items-center gap-2">
            {!tx.settled ? (
              <button
                type="button"
                onClick={() => onSettle(tx)}
                disabled={settlingId === tx.id}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--accent-blue)] transition-colors hover:bg-[rgba(0,122,255,0.08)] disabled:text-[var(--text-tertiary)]"
              >
                {settlingId === tx.id ? <Spinner className="h-4 w-4" /> : <CheckCheck className="h-4 w-4" />}
                Settle
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Delete entry"
              disabled={deletingId === tx.id}
              onClick={() => onDelete(tx)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[rgba(255,59,48,0.08)] hover:text-[var(--accent-red)] disabled:text-[var(--text-tertiary)]"
            >
              {deletingId === tx.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
