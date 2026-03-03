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
        <p className="text-[12px] text-ink-3 font-mono">Remaining: ₹{remaining.toLocaleString('en-IN')}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`h-11 rounded-xl border text-[13px] font-semibold transition-colors ${mode === 'full' ? 'border-accent bg-accent-soft text-accent' : 'border-stroke text-ink-3 hover:border-ink-4'}`}
            onClick={() => setMode('full')}
          >
            Full
          </button>
          <button
            type="button"
            className={`h-11 rounded-xl border text-[13px] font-semibold transition-colors ${mode === 'partial' ? 'border-accent bg-accent-soft text-accent' : 'border-stroke text-ink-3 hover:border-ink-4'}`}
            onClick={() => setMode('partial')}
          >
            Partial
          </button>
        </div>

        {mode === 'partial' ? (
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Amount</label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Settlement date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} loadingLabel="Saving...">
          Confirm Settlement
        </Button>
      </form>
    </Modal>
  );
}
