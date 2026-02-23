'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PersonDetail } from '@/components/khata/person-detail';
import { Button } from '@/components/ui/button';
import { AddTransactionModal } from '@/components/khata/add-transaction-modal';
import { SettlementModal } from '@/components/khata/settlement-modal';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PageCrumbHeader } from '@/components/layout/page-crumb-header';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MoreVertical } from 'lucide-react';

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
  const router = useRouter();
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [settlingTx, setSettlingTx] = useState<Transaction | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuOpen) return;
      if (!menuRef.current?.contains(event.target as Node) && !menuButtonRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

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

  const closeKhata = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/khata/${params.personId}/close`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to close khata');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['persons'] });
      qc.invalidateQueries({ queryKey: ['person-khata', params.personId] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Khata closed');
      setCloseDialogOpen(false);
      setCloseConfirmed(false);
      setMenuOpen(false);
      router.push('/khata');
      router.refresh();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to close khata', 'error');
    }
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
            <div className="relative">
              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Khata actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen ? (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="Khata actions"
                  className="absolute right-0 top-11 z-30 min-w-[180px] rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-1 shadow-[var(--shadow-medium)] backdrop-blur-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    onClick={() => {
                      setMenuOpen(false);
                      setCloseDialogOpen(true);
                    }}
                  >
                    Close this Khata
                  </button>
                </div>
              ) : null}
            </div>
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
      <ConfirmDialog
        open={closeDialogOpen}
        title="Close this Khata?"
        description="This will permanently delete this khata history with this person, including all lend and borrow entries. This action cannot be undone."
        confirmText="Delete Khata"
        variant="danger"
        isLoading={closeKhata.isPending}
        confirmDisabled={!closeConfirmed}
        loadingLabel="Deleting Khata..."
        onCancel={() => {
          if (closeKhata.isPending) return;
          setCloseDialogOpen(false);
          setCloseConfirmed(false);
        }}
        onConfirm={() => {
          if (closeKhata.isPending || !closeConfirmed) return;
          closeKhata.mutate();
        }}
      >
        <label className="inline-flex items-start gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border border-[var(--border-glass)]"
            checked={closeConfirmed}
            onChange={(e) => setCloseConfirmed(e.target.checked)}
          />
          <span>I understand this will delete all entries.</span>
        </label>
      </ConfirmDialog>
    </div>
  );
}
