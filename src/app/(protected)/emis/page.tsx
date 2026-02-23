'use client';

import { Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EMIList } from '@/components/emis/emi-list';
import { MarkAsPaidModal } from '@/components/shared/mark-as-paid-modal';
import { useState } from 'react';
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
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">My EMIs</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="hidden md:inline-flex"
        >
          Add EMI
        </Button>
      </div>

      {emis.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card p-4">
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
        className="fixed bottom-24 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-blue)] text-white shadow-medium md:hidden"
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
