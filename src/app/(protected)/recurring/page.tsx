'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RecurringList } from '@/components/recurring/recurring-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { RecurringFormModal } from '@/components/recurring/recurring-form-modal';
import { MarkAsPaidModal } from '@/components/shared/mark-as-paid-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type RecurringItem = {
  id: string;
  name: string;
  type: string;
  amount: number;
  dueDay: number;
  nextDueAt: string;
  nextDueInDays: number;
  showMarkPaid: boolean;
};

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringItem | null>(null);
  const [activeRecurringId, setActiveRecurringId] = useState<string | null>(null);
  const [deletingRecurringId, setDeletingRecurringId] = useState<string | null>(null);
  const [confirmRecurringId, setConfirmRecurringId] = useState<string | null>(null);
  const qc = useQueryClient();
  const { showToast } = useToast();
  const recurring = useQuery<RecurringItem[]>({
    queryKey: ['recurring'],
    queryFn: async () => {
      const res = await fetch('/api/recurring');
      if (!res.ok) throw new Error('Failed to load recurring payments');
      return (await res.json()).data;
    }
  });

  const deleteRecurring = useMutation({
    mutationFn: async (id: string) => {
      setDeletingRecurringId(id);
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete recurring payment');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Deleted');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to delete recurring payment', 'error'),
    onSettled: () => setDeletingRecurringId(null)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">Recurring Payments</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="hidden md:inline-flex"
        >
          Add Recurring
        </Button>
      </div>

      {recurring.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-5 w-28" />
            </div>
          ))}
        </div>
      ) : (recurring.data ?? []).length === 0 ? (
        <EmptyState
          title="No recurring payments"
          description="Add rent, subscriptions, or bills to track fixed outflow."
        />
      ) : (
        <RecurringList
          items={recurring.data ?? []}
          onEdit={(item) => {
            setEditing(item);
            setShowForm(true);
          }}
          onDelete={(id) => {
            if (deletingRecurringId) return;
            setConfirmRecurringId(id);
          }}
          onMarkPaid={(id) => setActiveRecurringId(id)}
          deletingId={deletingRecurringId}
        />
      )}

      <button
        type="button"
        aria-label="Add Recurring"
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        className="fixed bottom-24 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-blue)] text-white shadow-medium md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <RecurringFormModal open={showForm} onClose={() => setShowForm(false)} initial={editing} />
      {activeRecurringId ? (
        <MarkAsPaidModal
          open={Boolean(activeRecurringId)}
          onClose={() => setActiveRecurringId(null)}
          itemType="recurring"
          itemId={activeRecurringId}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(confirmRecurringId)}
        title="Delete Recurring Payment?"
        description="This will remove the recurring payment and its payment history if it exists."
        isLoading={deleteRecurring.isPending}
        onCancel={() => {
          if (deleteRecurring.isPending) return;
          setConfirmRecurringId(null);
        }}
        onConfirm={() => {
          if (!confirmRecurringId || deleteRecurring.isPending) return;
          deleteRecurring.mutate(confirmRecurringId, {
            onSuccess: () => setConfirmRecurringId(null)
          });
        }}
      />
    </div>
  );
}
