'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Transaction = {
  id: string;
  amount: number;
  settledAmount: number;
};

export function SettlementModal({
  open,
  onClose,
  transaction,
  isLoading,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  isLoading: boolean;
  onSubmit: (payload: { amount?: number; date: string }) => void;
}) {
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const remaining = transaction ? Math.max(transaction.amount - transaction.settledAmount, 0) : 0;

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
      title="Settle"
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) return;
          onSubmit({ amount: mode === 'partial' ? Number(amount) : undefined, date });
        }}
      >
        <p className="text-sm text-[var(--text-secondary)]">Remaining: ₹{remaining.toFixed(2)}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`h-11 rounded-xl border text-sm ${mode === 'full' ? 'border-[var(--accent-blue)] text-[var(--accent-blue)]' : 'border-[var(--border-glass)] text-[var(--text-secondary)]'}`}
            onClick={() => setMode('full')}
          >
            Full
          </button>
          <button
            type="button"
            className={`h-11 rounded-xl border text-sm ${mode === 'partial' ? 'border-[var(--accent-blue)] text-[var(--accent-blue)]' : 'border-[var(--border-glass)] text-[var(--text-secondary)]'}`}
            onClick={() => setMode('partial')}
          >
            Partial
          </button>
        </div>

        {mode === 'partial' ? (
          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">Amount</label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Settlement date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} loadingLabel="Saving...">
          Confirm Settlement
        </Button>
      </form>
    </Modal>
  );
}
