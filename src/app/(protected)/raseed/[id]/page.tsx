'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { AddEntryModal } from '@/components/raseed/add-entry-modal';

type RaseedEntry = {
  id: string;
  name: string;
  notes?: string;
  amount: number;
  paidBy: string;
  date: string;
};

type RaseedDetail = {
  id: string;
  name: string;
  description?: string;
  entries: RaseedEntry[];
};

const PERSON_COLORS = ['#7c6af7', '#34d399', '#fbbf24', '#f87171', '#94a3b8'];

function computeTotals(entries: RaseedEntry[]) {
  const map = new Map<string, number>();
  for (const e of entries) {
    map.set(e.paidBy, (map.get(e.paidBy) ?? 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export default function RaseedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [showAddEntry, setShowAddEntry] = useState(false);

  const raseed = useQuery<RaseedDetail>({
    queryKey: ['raseed', id],
    queryFn: () =>
      fetch(`/api/raseed/${id}`)
        .then((r) => r.json())
        .then((d) => d.data)
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const res = await fetch(`/api/raseed/${id}/entries/${entryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to delete entry');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raseed', id] });
      showToast('Entry deleted');
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to delete entry', 'error');
    }
  });

  const handleShare = async () => {
    if (!raseed.data) return;
    const totalAmount = raseed.data.entries.reduce((s, e) => s + e.amount, 0);
    const personTotals = computeTotals(raseed.data.entries);
    const lines = [
      `📒 ${raseed.data.name}`,
      `Total: ₹${totalAmount.toLocaleString('en-IN')}`,
      '',
      ...personTotals.map((p) => `${p.name} — ₹${p.total.toLocaleString('en-IN')}`),
      '',
      'Entries:',
      ...raseed.data.entries.map((e) => `• ${e.name} — ${e.paidBy} — ₹${e.amount.toLocaleString('en-IN')}`)
    ];
    const text = lines.join('\n');

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    }
  };

  if (raseed.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-card border border-stroke rounded-[10px] animate-pulse" />
        <div className="h-28 bg-card border border-stroke rounded-[18px] animate-pulse" />
        <div className="h-40 bg-card border border-stroke rounded-[18px] animate-pulse" />
      </div>
    );
  }

  if (!raseed.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-[13px] text-ink-3 font-mono">Log not found</p>
        <button
          onClick={() => router.push('/raseed')}
          className="mt-4 text-[12px] text-accent font-semibold hover:text-accent-2 transition-colors"
        >
          Back to Raseed
        </button>
      </div>
    );
  }

  const data = raseed.data;
  const totalAmount = data.entries.reduce((s, e) => s + e.amount, 0);
  const personTotals = computeTotals(data.entries);

  return (
    <div className="space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/raseed')}
          className="w-8 h-8 rounded-[10px] bg-card border border-stroke flex items-center justify-center hover:bg-card-2 transition-colors flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-ink-3" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-[-0.4px] text-ink truncate">{data.name}</h1>
          {data.description && (
            <p className="text-[11px] text-ink-3 font-mono mt-0.5 truncate">{data.description}</p>
          )}
        </div>
      </div>

      {/* Total card */}
      <div className="bg-card border border-stroke rounded-[18px] shadow-card p-4">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink-2 mb-1">Total Spent</p>
        <p className="font-mono text-[28px] font-semibold tracking-[-0.05em] tabular-nums text-ink leading-none">
          ₹{totalAmount.toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] text-ink-3 font-mono mt-1">
          {data.entries.length} {data.entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* Per-person totals */}
      {personTotals.length > 0 && (
        <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 px-4 py-3 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.04)]">
            By Person
          </p>
          {personTotals.map((p, i) => (
            <div
              key={p.name}
              className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                  style={{ background: PERSON_COLORS[i % PERSON_COLORS.length] }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <p className="text-[14px] font-semibold text-ink tracking-[-0.2px]">{p.name}</p>
              </div>
              <p className="font-mono text-[14px] font-semibold text-ink tracking-[-0.4px] tabular-nums">
                ₹{p.total.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 h-10 bg-card border border-stroke rounded-[14px] shadow-card text-[13px] font-semibold text-ink-2 hover:bg-card-2 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share Summary
      </button>

      {/* Entries list */}
      {data.entries.length > 0 && (
        <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 px-4 py-3 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.04)]">
            Entries
          </p>
          {data.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-ink tracking-[-0.2px] truncate">{entry.name}</p>
                  <p className="font-mono text-[13.5px] font-semibold text-ink tracking-[-0.4px] tabular-nums flex-shrink-0">
                    ₹{entry.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[11px] text-ink-3 font-mono">
                    {entry.paidBy} ·{' '}
                    {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    className="text-ink-4 hover:text-[#f87171] transition-colors ml-2"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {entry.notes && (
                  <p className="text-[11px] text-ink-4 font-mono mt-0.5 italic">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddEntry(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-[18px] bg-accent flex items-center justify-center z-30 shadow-[0_4px_16px_var(--accent-glow)] active:scale-95 transition-transform"
        aria-label="Add entry"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <AddEntryModal
        open={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        raseedId={id}
        existingEntries={data.entries}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['raseed', id] });
          showToast('Entry added');
        }}
      />
    </div>
  );
}
