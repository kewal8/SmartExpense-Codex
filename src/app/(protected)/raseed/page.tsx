'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AddRaseedModal } from '@/components/raseed/add-raseed-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type RaseedItem = {
  id: string;
  name: string;
  description?: string;
  entries: Array<{ amount: number }>;
  createdAt: string;
};

function computeRaseed(r: RaseedItem) {
  const totalAmount = r.entries.reduce((sum, e) => sum + e.amount, 0);
  const entryCount = r.entries.length;
  return { ...r, totalAmount, entryCount };
}

export default function RaseedPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteRaseedId, setDeleteRaseedId] = useState<string | null>(null);

  const raseeds = useQuery<RaseedItem[]>({
    queryKey: ['raseeds'],
    queryFn: () => fetch('/api/raseed').then((r) => r.json()).then((d) => d.data ?? [])
  });

  const deleteRaseedMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/raseed/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raseeds'] });
      showToast('Log deleted');
    },
    onError: () => {
      showToast('Failed to delete log', 'error');
    }
  });

  const items = (raseeds.data ?? []).map(computeRaseed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.4px] text-ink">Raseed</h1>
          <p className="text-[12px] text-ink-3 font-mono mt-0.5">Your expense logs</p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="h-8 px-3 text-[12px] bg-accent rounded-[8px] shadow-[0_2px_8px_var(--accent-glow)] hidden md:flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New Log
        </Button>
      </div>

      {/* Loading skeletons */}
      {raseeds.isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-stroke rounded-[16px] h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!raseeds.isLoading && items.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-4 h-4" />}
          title="No logs yet"
          description="Create a Raseed to start logging group expenses"
          primaryAction={{ label: 'New Log', onClick: () => setShowAdd(true) }}
        />
      )}

      {/* List */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-stroke rounded-[16px] shadow-card p-4 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              onClick={() => router.push(`/raseed/${r.id}`)}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 border"
                style={{ background: 'rgba(124,106,247,0.12)', borderColor: 'rgba(124,106,247,0.2)' }}
              >
                <BookOpen className="w-4 h-4" style={{ color: '#9d8ff9' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink tracking-[-0.2px] truncate">{r.name}</p>
                <p className="text-[11px] text-ink-3 font-mono mt-0.5">
                  {r.entryCount} {r.entryCount === 1 ? 'entry' : 'entries'} · ₹
                  {r.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-4 hover:text-ink-2 hover:bg-card-2 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpenId === r.id && (
                  <>
                    <div className="fixed inset-0 z-[199]" onClick={() => setMenuOpenId(null)} />
                    <div className="absolute right-0 top-full mt-1 z-[200] bg-card border border-stroke rounded-[12px] shadow-card overflow-hidden min-w-[130px]">
                      <button
                        onClick={() => {
                          setDeleteRaseedId(r.id);
                          setMenuOpenId(null);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-semibold hover:bg-[rgba(248,113,113,0.08)] transition-colors"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Log
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB (mobile) */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-[18px] bg-accent flex items-center justify-center z-30 shadow-[0_4px_16px_var(--accent-glow)] active:scale-95 transition-transform md:hidden"
        aria-label="New log"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <AddRaseedModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['raseeds'] });
          showToast('Log created');
        }}
      />

      <ConfirmDialog
        open={!!deleteRaseedId}
        title="Delete Log"
        description="This will permanently delete the log and all its entries. This cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteRaseedId) deleteRaseedMutation.mutate(deleteRaseedId);
          setDeleteRaseedId(null);
        }}
        onCancel={() => setDeleteRaseedId(null)}
      />
    </div>
  );
}
