'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function MarkAsPaidModal({
  open,
  onClose,
  itemType,
  itemId
}: {
  open: boolean;
  onClose: () => void;
  itemType: 'emi' | 'recurring';
  itemId: string;
}) {
  const qc = useQueryClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const markPaid = useMutation({
    mutationFn: async () => {
      const now = new Date(paidDate);
      const res = await fetch('/api/paid-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          month: now.getMonth(),
          year: now.getFullYear(),
          paidDate,
          note
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to mark paid');
      return payload;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['emis'] }),
        qc.invalidateQueries({ queryKey: ['recurring'] }),
        qc.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        qc.invalidateQueries({ queryKey: ['dashboard-reminders'] })
      ]);
      await Promise.all([
        qc.refetchQueries({ queryKey: ['emis'], type: 'active' }),
        qc.refetchQueries({ queryKey: ['recurring'], type: 'active' })
      ]);
      showToast('Saved');
      onClose();
      router.refresh();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to mark paid', 'error');
    }
  });

  return (
    <Modal open={open} onOpenChange={(v) => (v ? null : onClose())} title="Mark as Paid">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (markPaid.isPending) return;
          markPaid.mutate();
        }}
      >
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Paid date</label>
          <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">Note</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button className="w-full" type="submit" isLoading={markPaid.isPending} loadingLabel="Saving...">
          Confirm
        </Button>
      </form>
    </Modal>
  );
}
