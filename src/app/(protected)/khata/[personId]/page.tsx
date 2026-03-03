'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PersonDetail } from '@/components/khata/person-detail';
import { Button } from '@/components/ui/button';
import { AddTransactionModal } from '@/components/khata/add-transaction-modal';
import { SettlementModal } from '@/components/khata/settlement-modal';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MoreVertical, ChevronLeft } from 'lucide-react';

type Transaction = {
  id: string;
  type: 'lend' | 'borrow';
  amount: number;
  settledAmount: number;
  createdAt: string;
  settled?: boolean;
};

type Person = { id: string; name: string };

export default function PersonKhataPage(props: { params: Promise<{ personId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [settlingTx, setSettlingTx] = useState<Transaction | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
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

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      setDeletingEntryId(entryId);
      const res = await fetch(`/api/khata/entries/${entryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete entry');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['person-khata', params.personId] });
      qc.invalidateQueries({ queryKey: ['persons'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-reminders'] });
      qc.invalidateQueries({ queryKey: ['dashboard-collect-reminders'] });
      showToast('Entry deleted');
      setDeletingTx(null);
      router.refresh();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to delete entry', 'error');
    },
    onSettled: () => setDeletingEntryId(null)
  });

  const transactions = tx.data ?? [];
  const person = (persons.data ?? []).find((p) => p.id === params.personId);
  const personName = person?.name ?? 'Person';
  const netBalance = transactions.reduce((sum, t) => {
    const remaining = t.amount - t.settledAmount;
    return sum + (t.type === 'lend' ? remaining : -remaining);
  }, 0);

  return (
    <div className="space-y-4">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-1">
          {/* Left: back + name + subtitle */}
          <div className="flex items-start gap-3 min-w-0">
            <Link
              href="/khata"
              className="mt-1 flex-shrink-0 w-8 h-8 rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-ink-3" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold tracking-[-0.5px] text-ink truncate">
                {personName}
              </h1>
              <p className="text-[12px] font-mono text-ink-3 mt-0.5">
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} · net{' '}
                <span style={{ color: netBalance >= 0 ? '#34d399' : '#f87171' }}>
                  {netBalance >= 0 ? '+' : '−'}₹{Math.abs(netBalance).toLocaleString('en-IN')}
                </span>
              </p>
            </div>
          </div>

          {/* Right: net balance display */}
          <div className="flex-shrink-0 text-right">
            <p
              className="font-mono text-[20px] font-bold tracking-[-0.5px] tabular-nums"
              style={{ color: netBalance >= 0 ? '#34d399' : '#f87171' }}
            >
              {netBalance >= 0 ? '+' : '−'}₹{Math.abs(netBalance).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.06em] text-ink-4 mt-0.5">
              {netBalance >= 0 ? 'OWES YOU' : 'YOU OWE'}
            </p>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-3 mb-4">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-ink-3 transition-colors hover:bg-card-2"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Khata actions"
                className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-stroke bg-card p-1 shadow-card"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-semantic-red transition-colors hover:bg-[rgba(248,113,113,0.08)] focus-visible:outline-none"
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
      </div>
      {tx.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-card border border-stroke rounded-[16px] shadow-card p-4 animate-pulse">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-5 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <PersonDetail
          transactions={transactions}
          settlingId={settlingId}
          deletingId={deletingEntryId}
          onSettle={(txItem) => setSettlingTx(txItem)}
          onDelete={(txItem) => {
            if (deleteEntry.isPending) return;
            setDeletingTx(txItem);
          }}
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
        open={Boolean(deletingTx)}
        title="Delete entry?"
        description="This will permanently remove this lend/borrow entry. This can’t be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteEntry.isPending}
        onCancel={() => {
          if (deleteEntry.isPending) return;
          setDeletingTx(null);
        }}
        onConfirm={() => {
          if (!deletingTx || deleteEntry.isPending) return;
          deleteEntry.mutate(deletingTx.id);
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
        <label className="inline-flex items-start gap-2 text-[13px] text-ink-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border border-stroke"
            checked={closeConfirmed}
            onChange={(e) => setCloseConfirmed(e.target.checked)}
          />
          <span>I understand this will delete all entries.</span>
        </label>
      </ConfirmDialog>
    </div>
  );
}
