'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditExpenseTypeModal } from '@/components/settings/edit-expense-type-modal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { EmptyState } from '@/components/ui/empty-state';

type EmiTypeItem = {
  id: string;
  name: string;
  _count: { emis: number };
};

export function EmiTypeManager({
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
  const [editingEmiType, setEditingEmiType] = useState<EmiTypeItem | null>(null);
  const [confirmEmiTypeId, setConfirmEmiTypeId] = useState<string | null>(null);
  const [deletingEmiTypeId, setDeletingEmiTypeId] = useState<string | null>(null);
  const isCreateOpen = createOpen ?? internalCreateOpen;
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen;

  const emiTypes = useQuery({
    queryKey: ['emi-types'],
    queryFn: async () => {
      const res = await fetch('/api/emi-types');
      if (!res.ok) throw new Error('Failed to fetch EMI types');
      return (await res.json()).data as EmiTypeItem[];
    }
  });

  const createEmiType = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/emi-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to create EMI type');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-types'] });
      showToast('Saved');
      setCreateOpen(false);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to create EMI type', 'error')
  });

  const updateEmiType = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      const res = await fetch('/api/emi-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update EMI type');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-types'] });
      qc.invalidateQueries({ queryKey: ['emis'] });
      showToast('Saved');
      setEditingEmiType(null);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to update EMI type', 'error')
  });

  const deleteEmiType = useMutation({
    mutationFn: async (id: string) => {
      setDeletingEmiTypeId(id);
      const res = await fetch(`/api/emi-types?id=${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete EMI type');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emi-types'] });
      qc.invalidateQueries({ queryKey: ['emis'] });
      showToast('Deleted');
      setConfirmEmiTypeId(null);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to delete EMI type', 'error'),
    onSettled: () => setDeletingEmiTypeId(null)
  });

  return (
    <>
      <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden p-4">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-4">EMI Types</p>

        {emiTypes.isLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-stroke p-3">
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (emiTypes.data ?? []).length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No EMI types"
              description="Add EMI types to organize your EMI list and reports."
              icon={<CreditCard className="h-5 w-5" />}
            />
          </div>
        ) : (
          <motion.div
            className="mt-3 space-y-2"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial"
            animate="animate"
          >
            {(emiTypes.data ?? []).map((type) => {
              const locked = type._count.emis > 0;
              const rowLoading = deletingEmiTypeId === type.id;
              const tooltipId = `locked-emi-type-${type.id}`;
              return (
                <motion.div
                  key={type.id}
                  variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex items-center justify-between rounded-xl border border-stroke bg-card p-3"
                >
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{type.name}</p>
                    <p className="font-mono text-[11px] text-ink-4">{locked ? `${type._count.emis} EMI(s)` : 'Unused'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit EMI type ${type.name}`}
                      className="rounded-lg p-2 text-accent transition-colors hover:bg-accent-soft disabled:text-ink-4"
                      onClick={() => {
                        if (!updateEmiType.isPending) setEditingEmiType(type);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={`Delete EMI type ${type.name}`}
                        aria-disabled={locked ? 'true' : undefined}
                        aria-describedby={locked ? tooltipId : undefined}
                        className={`rounded-lg p-2 text-[var(--red)] transition-colors hover:bg-[var(--red-soft)] ${
                          locked ? 'cursor-not-allowed' : ''
                        } ${rowLoading ? 'cursor-wait text-ink-4' : ''}`}
                        onClick={() => {
                          if (rowLoading) return;
                          if (locked) {
                            if (isMobile) showToast('This EMI type is in use and can\u2019t be deleted.');
                            return;
                          }
                          setConfirmEmiTypeId(type.id);
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
                          This EMI type is in use and can&apos;t be deleted.
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmEmiTypeId)}
        title="Delete EMI Type?"
        description="This action cannot be undone."
        isLoading={deleteEmiType.isPending}
        onCancel={() => {
          if (!deleteEmiType.isPending) setConfirmEmiTypeId(null);
        }}
        onConfirm={() => {
          if (confirmEmiTypeId && !deleteEmiType.isPending) deleteEmiType.mutate(confirmEmiTypeId);
        }}
      />

      <EditExpenseTypeModal
        open={isCreateOpen}
        title="Add EMI Type"
        label="EMI Type Name"
        currentName=""
        isLoading={createEmiType.isPending}
        onClose={() => {
          if (!createEmiType.isPending) setCreateOpen(false);
        }}
        onSave={(name) => {
          if (!createEmiType.isPending) createEmiType.mutate(name.trim());
        }}
      />

      <EditExpenseTypeModal
        open={Boolean(editingEmiType)}
        title="Edit EMI Type"
        label="EMI Type Name"
        currentName={editingEmiType?.name ?? ''}
        isLoading={updateEmiType.isPending}
        onClose={() => {
          if (!updateEmiType.isPending) setEditingEmiType(null);
        }}
        onSave={(name) => {
          if (editingEmiType && !updateEmiType.isPending) {
            updateEmiType.mutate({ id: editingEmiType.id, name: name.trim() });
          }
        }}
      />
    </>
  );
}
