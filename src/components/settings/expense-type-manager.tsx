'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
        <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-4">Expense Types</p>

        {expenseTypes.isLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-stroke p-3">
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
          <motion.div
            className="mt-3 space-y-2"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial"
            animate="animate"
          >
            {(expenseTypes.data ?? []).map((type) => {
              const locked = type._count.expenses > 0;
              const rowLoading = deletingTypeId === type.id;
              const tooltipId = `locked-expense-type-${type.id}`;
              return (
                <motion.div
                  key={type.id}
                  variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex items-center justify-between rounded-xl border border-stroke bg-card p-3"
                >
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{type.name}</p>
                    <p className="font-mono text-[11px] text-ink-4">{locked ? `${type._count.expenses} expense(s)` : 'Unused'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit expense type ${type.name}`}
                      className="rounded-lg p-2 text-accent transition-colors hover:bg-accent-soft disabled:text-ink-4"
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
                        className={`rounded-lg p-2 text-[var(--red)] transition-colors hover:bg-[var(--red-soft)] ${
                          locked ? 'cursor-not-allowed' : ''
                        } ${rowLoading ? 'cursor-wait text-ink-4' : ''}`}
                        onClick={() => {
                          if (rowLoading) return;
                          if (locked) {
                            if (isMobile) showToast('This type is used in expenses and can\u2019t be deleted.');
                            return;
                          }
                          setConfirmTypeId(type.id);
                        }}
                        disabled={rowLoading}
                      >
                        {rowLoading ? <Spinner className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4 text-ink-4" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                      {locked ? (
                        <span
                          id={tooltipId}
                          role="tooltip"
                          className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-max max-w-[230px] rounded-lg bg-black/85 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          This type is used in expenses and can&apos;t be deleted.
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
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
