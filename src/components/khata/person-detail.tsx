import { formatDate } from '@/lib/utils';
import { CheckCheck, Trash2, HandCoins } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

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
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className={`bg-card rounded-[16px] overflow-hidden shadow-card border ${
            tx.settled
              ? 'border-stroke opacity-70'
              : tx.type === 'lend'
              ? 'border-semantic-green/20'
              : 'border-semantic-amber/20'
          }`}
        >
          {/* Card header: type badge + date */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] font-mono text-[11px] font-bold uppercase tracking-wide border ${
                tx.type === 'lend'
                  ? 'bg-semantic-green-soft border-semantic-green-border text-semantic-green'
                  : 'bg-semantic-amber-soft border-semantic-amber-border text-semantic-amber'
              }`}
            >
              {tx.type === 'lend' ? '↑ Lent' : '↓ Borrowed'}
            </div>
            <span className="font-mono text-[11px] text-ink-3">{formatDate(tx.createdAt)}</span>
          </div>

          {/* Amount + actions in one row */}
          <div className="px-4 pb-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[22px] font-semibold tracking-[-0.05em] tabular-nums text-ink">
                ₹{tx.amount.toLocaleString('en-IN')}
              </p>

              {tx.settledAmount > 0 && (
                <p className="font-mono text-[11px] text-ink-3 mt-0.5">
                  {tx.settled
                    ? 'fully settled'
                    : `₹${(tx.amount - tx.settledAmount).toLocaleString('en-IN')} remaining`}
                </p>
              )}
              {!tx.settled && tx.settledAmount === 0 && (
                <p className="font-mono text-[11px] text-ink-3 mt-0.5">
                  ₹{tx.amount.toLocaleString('en-IN')} remaining
                </p>
              )}

              {tx.settledAmount > 0 && tx.amount > 0 && (
                <div className="mt-2 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden max-w-[120px]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (tx.settledAmount / tx.amount) * 100)}%`,
                      background: tx.type === 'lend' ? '#34d399' : '#fbbf24',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Compact action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!tx.settled ? (
                <button
                  type="button"
                  onClick={() => onSettle(tx)}
                  disabled={settlingId === tx.id}
                  className="h-8 px-3 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.2)] text-[#34d399] hover:bg-[rgba(52,211,153,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settlingId === tx.id ? <Spinner className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
                  Settle
                </button>
              ) : (
                <div className="h-8 px-3 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 bg-card-2 border border-stroke text-ink-4 cursor-default">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Settled
                </div>
              )}

              <button
                type="button"
                aria-label="Delete entry"
                disabled={deletingId === tx.id}
                onClick={() => onDelete(tx)}
                className="h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors text-ink-4 border border-stroke bg-card-2 hover:bg-[rgba(248,113,113,0.1)] hover:border-[rgba(248,113,113,0.2)] hover:text-[#f87171] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deletingId === tx.id ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
