'use client';

import { useState } from 'react';
import { Lock, Trash2, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Modal } from '@/components/ui/modal';

type Person = {
  id: string;
  name: string;
  lends?: Array<{ id: string }>;
  borrows?: Array<{ id: string }>;
};

export function PeopleManager({
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
  const [personName, setPersonName] = useState('');
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
  const [confirmPersonId, setConfirmPersonId] = useState<string | null>(null);
  const isCreateOpen = createOpen ?? internalCreateOpen;
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen;

  const persons = useQuery({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await fetch('/api/persons');
      if (!res.ok) throw new Error('Failed to fetch persons');
      return (await res.json()).data as Person[];
    }
  });

  const addPerson = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to add person');
      return payload;
    },
    onSuccess: () => {
      setPersonName('');
      qc.invalidateQueries({ queryKey: ['persons'] });
      showToast('Saved');
      setCreateOpen(false);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to add person', 'error')
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      setDeletingPersonId(id);
      const res = await fetch(`/api/persons/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete person');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['persons'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Deleted');
      setConfirmPersonId(null);
    },
    onSettled: () => setDeletingPersonId(null),
    onError: (error) => showToast(error instanceof Error ? error.message : 'Failed to delete person', 'error')
  });

  return (
    <>
      <GlassCard className="p-4">
        <h2 className="text-xl font-semibold">People</h2>

        {persons.isLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-[var(--border-glass)] p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
        ) : persons.data && persons.data.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No people added"
              description="Add someone to start tracking lend and borrow balances."
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {(persons.data ?? []).map((person) => {
              const txCount = (person.lends?.length ?? 0) + (person.borrows?.length ?? 0);
              const locked = txCount > 0;
              const rowLoading = deletingPersonId === person.id;
              const tooltipId = `locked-person-${person.id}`;

              return (
                <div key={person.id} className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{person.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{txCount > 0 ? `${txCount} transaction(s)` : 'No transactions'}</p>
                  </div>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-label={`Delete ${person.name}`}
                      aria-disabled={locked ? 'true' : undefined}
                      aria-describedby={locked ? tooltipId : undefined}
                      className={`rounded-lg p-2 text-[var(--accent-red)] transition-colors hover:bg-[rgba(255,59,48,0.1)] ${
                        locked ? 'cursor-not-allowed' : ''
                      } ${rowLoading ? 'cursor-wait text-[var(--text-tertiary)]' : ''}`}
                      onClick={() => {
                        if (rowLoading) return;
                        if (locked) {
                          if (isMobile) showToast('This person has transactions and can’t be deleted.');
                          return;
                        }
                        setConfirmPersonId(person.id);
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
                        This person has transactions and can’t be deleted.
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <Modal
        open={isCreateOpen}
        onOpenChange={(value) => {
          if (!value && !addPerson.isPending) {
            setCreateOpen(false);
            setPersonName('');
          }
        }}
        title="Add Person"
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (addPerson.isPending) return;
            if (!personName.trim()) return;
            addPerson.mutate(personName.trim());
          }}
        >
          <div>
            <label htmlFor="person-name" className="mb-1 block text-sm text-[var(--text-secondary)]">
              Person Name
            </label>
            <Input
              id="person-name"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person name"
              aria-label="Person name"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setCreateOpen(false);
                setPersonName('');
              }}
              disabled={addPerson.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!personName.trim()} isLoading={addPerson.isPending} loadingLabel="Adding...">
              Add Person
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmPersonId)}
        title="Delete Person?"
        description="This action cannot be undone."
        isLoading={deletePerson.isPending}
        onCancel={() => {
          if (deletePerson.isPending) return;
          setConfirmPersonId(null);
        }}
        onConfirm={() => {
          if (!confirmPersonId || deletePerson.isPending) return;
          deletePerson.mutate(confirmPersonId);
        }}
      />
    </>
  );
}
