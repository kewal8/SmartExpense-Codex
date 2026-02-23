'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useToast } from '@/components/ui/toast';

type ExpenseTypeOption = { id: string; name: string };

export function AddExpenseModal({
  open,
  onClose,
  types
}: {
  open: boolean;
  onClose: () => void;
  types: ExpenseTypeOption[];
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [typeId, setTypeId] = useState(types[0]?.id ?? '');
  const [note, setNote] = useState('');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const qc = useQueryClient();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), date, typeId, note })
      });
      if (!res.ok) throw new Error('Failed to create expense');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
      setAmount('');
      setNote('');
      showToast('Saved');
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to save expense', 'error');
    }
  });

  useEffect(() => {
    if (!typeId && types[0]?.id) {
      setTypeId(types[0].id);
    }
  }, [typeId, types]);

  const body = (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (mutation.isPending) return;
        mutation.mutate();
      }}
    >
      <div>
        <label className="mb-1 block text-sm text-[var(--text-secondary)]">Amount</label>
        <Input
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          className="h-14 text-2xl font-mono"
          placeholder="₹0.00"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-secondary)]">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-secondary)]">Type</label>
        <Select value={typeId} onChange={(e) => setTypeId(e.target.value)} options={types.map((t) => ({ label: t.name, value: t.id }))} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-secondary)]">Note</label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" isLoading={mutation.isPending} loadingLabel="Saving...">
        Add Expense
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Add Expense">
        {body}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onOpenChange={(value) => (value ? null : onClose())} title="Add Expense">
      {body}
    </Modal>
  );
}
