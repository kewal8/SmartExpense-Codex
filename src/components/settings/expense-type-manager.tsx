'use client';

import { useState } from 'react';
import { Lock, Pencil, Tags, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditExpenseTypeModal } from '@/components/settings/edit-expense-type-modal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { EmptyState } from '@/components/ui/empty-state';

type ExpenseTypeItem = {
  id: string;
  name: string;
  _count: { expenses: number };
};

export function ExpenseTypeManager({
  createOpen,
  onCreateOpenChange
}: {
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);
  const [editingType, setEditingType] = useState<ExpenseTypeItem | null>(null);
  const [confirmTypeId, setConfirmTypeId] = useState<string | null>(null);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);
  const isCreateOpen = createOpen ?? internalCreateOpen;
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen;

  const expenseTypes = useQuery({
    queryKey: ['expense-types'],
    queryFn: async () => {
      const res = await fetch('/api/expense-types');
      if (!res.ok) throw new Error('Failed to fetch expense types');
      return (await res.json()).data as ExpenseTypeItem[];
    }
  });

  const createExpenseType = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/expense-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to create expense type');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-types'] });
      showToast('Saved');
      setCreateOpen(false);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to create expense type', 'error')
  });

  const updateExpenseType = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      const res = await fetch('/api/expense-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update expense type');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-types'] });
      showToast('Saved');
      setEditingType(null);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to update expense type', 'error')
  });

  const deleteExpenseType = useMutation({
    mutationFn: async (id: string) => {
      setDeletingTypeId(id);
      const res = await fetch(`/api/expense-types?id=${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete expense type');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-types'] });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      showToast('Deleted');
      setConfirmTypeId(null);
    },
    onSettled: () => setDeletingTypeId(null),
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to delete expense type', 'error')
  });

  return (
    <>
      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">Expense Types</h2>

        {expenseTypes.isLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-[var(--border-glass)] p-3">
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (expenseTypes.data ?? []).length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No expense types"
              description="Add types to categorize expenses and unlock summaries."
              icon={<Tags className="h-5 w-5" />}
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {(expenseTypes.data ?? []).map((type) => {
              const locked = type._count.expenses > 0;
              const rowLoading = deletingTypeId === type.id;
              const tooltipId = `locked-expense-type-${type.id}`;
              return (
                <div key={type.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{type.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{locked ? `${type._count.expenses} expense(s)` : 'Unused'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit expense type ${type.name}`}
                      className="rounded-lg p-2 text-[var(--accent-blue)] transition-colors hover:bg-[rgba(0,122,255,0.1)] disabled:text-[var(--text-tertiary)]"
                      onClick={() => {
                        if (!updateExpenseType.isPending) setEditingType(type);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={`Delete expense type ${type.name}`}
                        aria-disabled={locked ? 'true' : undefined}
                        aria-describedby={locked ? tooltipId : undefined}
                        className={`rounded-lg p-2 text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.1)] ${
                          locked ? 'cursor-not-allowed' : ''
                        } ${rowLoading ? 'cursor-wait text-[var(--text-tertiary)]' : ''}`}
                        onClick={() => {
                          if (rowLoading) return;
                          if (locked) {
                            if (isMobile) showToast('This type is used in expenses and can’t be deleted.');
                            return;
                          }
                          setConfirmTypeId(type.id);
                        }}
                        disabled={rowLoading}
                      >
                        {rowLoading ? <Spinner className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4 text-[var(--text-tertiary)]" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                      {locked ? (
                        <span
                          id={tooltipId}
                          role="tooltip"
                          className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-max max-w-[230px] rounded-lg bg-black/85 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          This type is used in expenses and can’t be deleted.
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        open={Boolean(confirmTypeId)}
        title="Delete Expense Type?"
        description="This action cannot be undone."
        isLoading={deleteExpenseType.isPending}
        onCancel={() => {
          if (!deleteExpenseType.isPending) setConfirmTypeId(null);
        }}
        onConfirm={() => {
          if (confirmTypeId && !deleteExpenseType.isPending) deleteExpenseType.mutate(confirmTypeId);
        }}
      />

      <EditExpenseTypeModal
        open={isCreateOpen}
        title="Add Expense Type"
        label="Type Name"
        currentName=""
        isLoading={createExpenseType.isPending}
        onClose={() => {
          if (!createExpenseType.isPending) setCreateOpen(false);
        }}
        onSave={(name) => {
          if (!createExpenseType.isPending) createExpenseType.mutate(name.trim());
        }}
      />

      <EditExpenseTypeModal
        open={Boolean(editingType)}
        currentName={editingType?.name ?? ''}
        isLoading={updateExpenseType.isPending}
        onClose={() => {
          if (!updateExpenseType.isPending) setEditingType(null);
        }}
        onSave={(name) => {
          if (editingType && !updateExpenseType.isPending) {
            updateExpenseType.mutate({ id: editingType.id, name: name.trim() });
          }
        }}
      />
    </>
  );
}
