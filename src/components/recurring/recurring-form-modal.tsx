'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/components/ui/toast';

type RecurringItem = {
  id: string;
  name: string;
  type: string;
  amount: number;
  dueDay: number;
};

const TYPES = ['Rent', 'Maintenance', 'Insurance', 'Subscription', 'Utilities', 'Other'];

export function RecurringFormModal({
  open,
  onClose,
  initial
}: {
  open: boolean;
  onClose: () => void;
  initial?: RecurringItem | null;
}) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');

  useEffect(() => {
    if (!open) return;
    if (!initial) {
      setName('');
      setType(TYPES[0]);
      setAmount('');
      setDueDay('1');
      return;
    }
    setName(initial.name);
    setType(initial.type);
    setAmount(String(initial.amount));
    setDueDay(String(initial.dueDay));
  }, [initial, open]);

  const submit = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        type,
        amount: Number(amount),
        dueDay: Number(dueDay)
      };
      const url = initial ? `/api/recurring/${initial.id}` : '/api/recurring';
      const method = initial ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to save recurring payment');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Saved');
      onClose();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to save recurring payment', 'error');
    }
  });

  const form = useMemo(
    () => (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (submit.isPending) return;
          submit.mutate();
        }}
      >
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Type</label>
          <Select value={type} onChange={(e) => setType(e.target.value)} options={TYPES.map((t) => ({ label: t, value: t }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Amount</label>
          <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Due Day</label>
          <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" isLoading={submit.isPending} loadingLabel="Saving...">
          {initial ? 'Save Changes' : 'Add Recurring'}
        </Button>
      </form>
    ),
    [amount, dueDay, initial, name, submit, type]
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={initial ? 'Edit Recurring' : 'Add Recurring'}>
        {form}
      </BottomSheet>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
      title={initial ? 'Edit Recurring' : 'Add Recurring'}
    >
      {form}
    </Modal>
  );
}
