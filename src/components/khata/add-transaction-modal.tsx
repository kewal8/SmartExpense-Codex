'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

type TxType = 'lend' | 'borrow';

export function AddTransactionModal({
  open,
  onClose,
  type,
  persons,
  defaultPersonId
}: {
  open: boolean;
  onClose: () => void;
  type: TxType;
  persons: Array<{ id: string; name: string }>;
  defaultPersonId?: string;
}) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [personId, setPersonId] = useState(persons[0]?.id ?? '');

  const options = useMemo(() => persons.map((person) => ({ label: person.name, value: person.id })), [persons]);

  useEffect(() => {
    if (!open) return;
    if (defaultPersonId && persons.some((person) => person.id === defaultPersonId)) {
      setPersonId(defaultPersonId);
      return;
    }
    setPersonId((prev) => (persons.some((person) => person.id === prev) ? prev : persons[0]?.id ?? ''));
  }, [defaultPersonId, open, persons]);

  const createTransaction = useMutation({
    mutationFn: async (payload: { personId: string }) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          personId: payload.personId,
          amount: Number(amount),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          note: note || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create transaction');
      }
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-reminders'] });
      qc.invalidateQueries({ queryKey: ['dashboard-collect-reminders'] });
      qc.invalidateQueries({ queryKey: ['persons'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['person-khata', variables.personId] });
      showToast('Saved');
      onClose();
      setAmount('');
      setDueDate('');
      setNote('');
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to create transaction', 'error');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createTransaction.isPending) return;
    if (!personId) {
      showToast('Add a person in Settings to create a transaction.', 'error');
      return;
    }

    if (!createTransaction.isPending) {
      createTransaction.mutate({ personId });
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
      title={type === 'borrow' ? 'Add Borrow' : 'Add Lend'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Amount</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="h-12 font-mono"
            placeholder="₹0.00"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Person</label>
          <Select value={personId} onChange={(e) => setPersonId(e.target.value)} options={options} disabled={persons.length === 0} />
        </div>

        {persons.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            No people available. Add a person in{' '}
            <Link href="/settings/people" className="text-[var(--accent-blue)]">
              Settings
            </Link>{' '}
            first.
          </p>
        ) : null}

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Due date (optional)</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Note (optional)</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={createTransaction.isPending}
          loadingLabel="Saving..."
          disabled={persons.length === 0}
        >
          {type === 'borrow' ? 'Save Borrow' : 'Save Lend'}
        </Button>
      </form>
    </Modal>
  );
}
