'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/components/ui/toast';

type EMIItem = {
  id: string;
  name: string;
  amount: number;
  emiType: string;
  dueDay: number;
  startDate: string;
  endDate: string;
};
type EmiTypeOption = { id: string; name: string };

export function EMIFormModal({
  open,
  onClose,
  initial
}: {
  open: boolean;
  onClose: () => void;
  initial?: EMIItem | null;
}) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const emiTypes = useQuery<EmiTypeOption[]>({
    queryKey: ['emi-types'],
    queryFn: async () => {
      const res = await fetch('/api/emi-types');
      if (!res.ok) throw new Error('Failed to load EMI types');
      return (await res.json()).data;
    }
  });
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [emiType, setEmiType] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!open) return;
    if (!initial) {
      setName('');
      setAmount('');
      setDueDay('1');
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      return;
    }
    setName(initial.name);
    setAmount(String(initial.amount));
    setEmiType(initial.emiType);
    setDueDay(String(initial.dueDay));
    setStartDate(new Date(initial.startDate).toISOString().slice(0, 10));
    setEndDate(new Date(initial.endDate).toISOString().slice(0, 10));
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    if (initial?.emiType) {
      setEmiType(initial.emiType);
      return;
    }
    if (!emiType && (emiTypes.data?.length ?? 0) > 0) {
      setEmiType(emiTypes.data![0].name);
    }
  }, [emiType, emiTypes.data, initial?.emiType, open]);

  const submit = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        amount: Number(amount),
        emiType,
        dueDay: Number(dueDay),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };

      const url = initial ? `/api/emis/${initial.id}` : '/api/emis';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to save EMI');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emis'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Saved');
      onClose();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to save EMI', 'error');
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
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Monthly Amount</label>
          <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">EMI Type</label>
          <Select
            value={emiType}
            onChange={(e) => setEmiType(e.target.value)}
            options={(emiTypes.data ?? []).map((t) => ({ label: t.name, value: t.name }))}
          />
          {(emiTypes.data ?? []).length === 0 ? (
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              No EMI types available.{' '}
              <Link href="/settings" className="text-[var(--accent-blue)] underline-offset-2 hover:underline">
                Manage EMI Types in Settings.
              </Link>
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Due Day</label>
          <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={submit.isPending}
          loadingLabel="Saving..."
          disabled={(emiTypes.data ?? []).length === 0}
        >
          {initial ? 'Save Changes' : 'Add EMI'}
        </Button>
      </form>
    ),
    [amount, dueDay, emiType, emiTypes.data, endDate, initial, name, startDate, submit]
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={initial ? 'Edit EMI' : 'Add EMI'}>
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
      title={initial ? 'Edit EMI' : 'Add EMI'}
    >
      {form}
    </Modal>
  );
}
