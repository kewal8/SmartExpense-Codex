'use client';

import { Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EMIList } from '@/components/emis/emi-list';
import { MarkAsPaidModal } from '@/components/shared/mark-as-paid-modal';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EMIFormModal } from '@/components/emis/emi-form-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type EMIItem = {
  id: string;
  name: string;
  amount: number;
  emiType: string;
  dueDay: number;
  totalEmis: number;
  startDate: string;
  endDate: string;
  paidMarks: Array<{ month: number; year: number }>;
  nextDueAt: string | null;
  nextDueInDays: number | null;
  showMarkPaid: boolean;
};

export default function EmisPage() {
  const [activeEmiId, setActiveEmiId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EMIItem | null>(null);
  const [deletingEmiId, setDeletingEmiId] = useState<string | null>(null);
  const [confirmEmiId, setConfirmEmiId] = useState<string | null>(null);
  const qc = useQueryClient();
  const { showToast } = useToast();
  const emis = useQuery<EMIItem[]>({
    queryKey: ['emis'],
    queryFn: async () => {
      const res = await fetch('/api/emis');
      if (!res.ok) throw new Error('Failed to load EMIs');
      return (await res.json()).data;
    }
  });
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const { totalMonthly, activeCount, overdueCount } = useMemo(() => {
    const data = emis.data ?? [];
    const totalMonthly = data.reduce((sum, e) => sum + e.amount, 0);
    const activeCount = data.filter(e => e.paidMarks.length < e.totalEmis).length;
    const overdueCount = data.filter(e => {
      const paidThisMonth = e.paidMarks.some(m => m.month === month && m.year === year);
      const dueDate = new Date(year, month, e.dueDay);
      return !paidThisMonth && dueDate < now;
    }).length;
    return { totalMonthly, activeCount, overdueCount };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emis.data]);

  const deleteEmi = useMutation({
    mutationFn: async (id: string) => {
      setDeletingEmiId(id);
      const res = await fetch(`/api/emis/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete EMI');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emis'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Deleted');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to delete EMI', 'error'),
    onSettled: () => setDeletingEmiId(null)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold tracking-[-0.5px] text-ink" style={{ fontSize: '20px' }}>My EMIs</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="hidden md:inline-flex bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_4px_12px_var(--accent-glow)] hover:bg-accent/90 transition-all border-0"
        >
          Add EMI
        </Button>
      </div>

      {!emis.isLoading && (emis.data ?? []).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="relative overflow-hidden bg-card border border-stroke rounded-[14px] shadow-card p-3">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[14px] bg-accent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-2 mb-1">Monthly</p>
            <p className="font-mono text-[15px] font-semibold tracking-[-0.05em] tabular-nums text-ink">₹{totalMonthly.toLocaleString('en-IN')}</p>
          </div>
          <div className="relative overflow-hidden bg-card border border-stroke rounded-[14px] shadow-card p-3">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[14px] bg-accent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-2 mb-1">Active</p>
            <p className="font-mono text-[15px] font-semibold tracking-[-0.05em] tabular-nums text-ink">{activeCount}</p>
          </div>
          <div className="relative overflow-hidden bg-card border border-stroke rounded-[14px] shadow-card p-3">
            <div className={`absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[14px] ${overdueCount > 0 ? 'bg-semantic-red' : 'bg-semantic-green'}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-2 mb-1">Overdue</p>
            <p className={`font-mono text-[15px] font-semibold tracking-[-0.05em] tabular-nums ${overdueCount > 0 ? 'text-semantic-red' : 'text-ink'}`}>{overdueCount}</p>
          </div>
        </div>
      )}

      {emis.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-card border border-stroke rounded-card shadow-card animate-pulse p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-5 w-32" />
              <Skeleton className="mt-3 h-2 w-full" />
            </div>
          ))}
        </div>
      ) : (emis.data ?? []).length === 0 ? (
        <EmptyState
          title="No EMIs set up"
          description="Add an EMI to track monthly due dates and progress."
        />
      ) : (
        <EMIList
          emis={emis.data ?? []}
          onEdit={(emi) => {
            setEditing(emi);
            setShowForm(true);
          }}
          onDelete={(id) => {
            if (deletingEmiId) return;
            setConfirmEmiId(id);
          }}
          onMarkPaid={(id) => setActiveEmiId(id)}
          deletingId={deletingEmiId}
        />
      )}

      <button
        type="button"
        aria-label="Add EMI"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        className="fixed bottom-24 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-[0_4px_16px_var(--accent-glow)] text-white md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {activeEmiId ? (
        <MarkAsPaidModal open={Boolean(activeEmiId)} onClose={() => setActiveEmiId(null)} itemType="emi" itemId={activeEmiId} />
      ) : null}
      <EMIFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initial={editing}
      />
      <ConfirmDialog
        open={Boolean(confirmEmiId)}
        title="Delete EMI?"
        description="This will remove the EMI and its payment history if it exists."
        isLoading={deleteEmi.isPending}
        onCancel={() => {
          if (deleteEmi.isPending) return;
          setConfirmEmiId(null);
        }}
        onConfirm={() => {
          if (!confirmEmiId || deleteEmi.isPending) return;
          deleteEmi.mutate(confirmEmiId, {
            onSuccess: () => setConfirmEmiId(null)
          });
        }}
      />
    </div>
  );
}
