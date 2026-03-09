'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/components/ui/toast';
import { useIndianNumberInput } from '@/hooks/useIndianNumberInput';

type ExistingEntry = { paidBy: string };

function todayInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AddEntryModal({
  open,
  onClose,
  raseedId,
  existingEntries,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  raseedId: string;
  existingEntries: ExistingEntry[];
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const { displayValue: amountDisplay, handleChange: handleAmountChange } = useIndianNumberInput(amount, setAmount);
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setAmount('');
    setPaidBy('');
    setDate(todayInputValue());
    setNotes('');
  }, [open]);

  const usedNames = [...new Set(existingEntries.map((e) => e.paidBy))];

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/raseed/${raseedId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: parseInt(amount, 10),
          paidBy,
          date,
          notes: notes || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add entry');
      return data;
    },
    onSuccess: () => {
      onCreated();
      onClose();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to add entry', 'error');
    }
  });

  const form = (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (create.isPending) return;
        create.mutate();
      }}
    >
      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">
          Expense Name
        </label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chai, Petrol" required />
      </div>

      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Amount</label>
        <Input
          value={amountDisplay}
          onChange={handleAmountChange}
          inputMode="numeric"
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Paid By</label>
        <Input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="Who paid?" required />
        {usedNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {usedNames.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPaidBy(n)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-card-2 border border-stroke text-ink-2 hover:border-accent/40 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div>
        <label className="mb-1 block text-[11.5px] font-semibold text-ink-3 uppercase tracking-[0.06em]">
          Notes (optional)
        </label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" />
      </div>

      <Button type="submit" className="w-full" isLoading={create.isPending} loadingLabel="Adding...">
        Add Entry
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Add Entry">
        {form}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onClose(); }} title="Add Entry">
      {form}
    </Modal>
  );
}
