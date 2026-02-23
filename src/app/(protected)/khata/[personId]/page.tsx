'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PersonDetail } from '@/components/khata/person-detail';
import { Button } from '@/components/ui/button';
import { AddTransactionModal } from '@/components/khata/add-transaction-modal';
import { SettlementModal } from '@/components/khata/settlement-modal';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';

type Transaction = {
  id: string;
  type: 'lend' | 'borrow';
  amount: number;
  settledAmount: number;
  createdAt: string;
  settled?: boolean;
};

type Person = { id: string; name: string };

export default function PersonKhataPage({ params }: { params: { personId: string } }) {
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [settlingTx, setSettlingTx] = useState<Transaction | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const qc = useQueryClient();
  const { showToast } = useToast();

  const tx = useQuery<Transaction[]>({
    queryKey: ['person-khata', params.personId],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/person/${params.personId}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return (await res.json()).data;
    }
  });
  const persons = useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await fetch('/api/persons');
      if (!res.ok) throw new Error('Failed to fetch persons');
      return (await res.json()).data;
    }
  });

  const settle = useMutation({
    mutationFn: async (payload: { id: string; amount?: number; date: string }) => {
      setSettlingId(payload.id);
      const res = await fetch(`/api/transactions/${payload.id}/settle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payload.amount, date: payload.date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to settle');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['person-khata', params.personId] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Saved');
      setSettlingTx(null);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to settle', 'error'),
    onSettled: () => setSettlingId(null)
  });

  return (
    <div className="space-y-4">
      <PageCrumbHeader
        title="Person Khata"
        parentLabel="Khata"
        parentHref="/khata"
        crumbs={[
          { label: 'Khata', href: '/khata' },
          { label: 'Person Khata' }
        ]}
        rightSlot={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowLend(true)}>
              Lend
            </Button>
            <Button onClick={() => setShowBorrow(true)}>Borrow</Button>
          </div>
        }
      />
      {tx.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-5 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <PersonDetail
          transactions={tx.data ?? []}
          settlingId={settlingId}
          onSettle={(txItem) => setSettlingTx(txItem)}
          onLend={() => setShowLend(true)}
          onBorrow={() => setShowBorrow(true)}
        />
      )}
      <AddTransactionModal
        open={showLend}
        onClose={() => setShowLend(false)}
        type="lend"
        persons={(persons.data ?? []).map((person) => ({ id: person.id, name: person.name }))}
        defaultPersonId={params.personId}
      />
      <AddTransactionModal
        open={showBorrow}
        onClose={() => setShowBorrow(false)}
        type="borrow"
        persons={(persons.data ?? []).map((person) => ({ id: person.id, name: person.name }))}
        defaultPersonId={params.personId}
      />
      <SettlementModal
        open={Boolean(settlingTx)}
        onClose={() => setSettlingTx(null)}
        transaction={settlingTx}
        isLoading={settle.isPending}
        onSubmit={(payload) => {
          if (!settlingTx || settle.isPending) return;
          settle.mutate({ id: settlingTx.id, ...payload });
        }}
      />
    </div>
  );
}
