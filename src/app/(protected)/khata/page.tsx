'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { PersonList } from '@/components/khata/person-list';
import { KhataSummaryCards } from '@/components/khata/khata-summary-cards';
import { AddTransactionModal } from '@/components/khata/add-transaction-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

type Person = { id: string; name: string; netBalance: number };
type KhataSummary = { owed: number; owe: number; net: number };
type PersonsResponse = { data: Person[]; summary?: KhataSummary };

export default function KhataPage() {
  const router = useRouter();
  const [showLend, setShowLend] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);

  const persons = useQuery<PersonsResponse>({
    queryKey: ['persons', 'khata-summary'],
    queryFn: async () => {
      const res = await fetch('/api/persons?limit=50');
      if (!res.ok) throw new Error('Failed to fetch persons');
      const payload = await res.json();
      return { data: payload.data ?? [], summary: payload.summary };
    }
  });

  const summary = persons.data?.summary ?? { owed: 0, owe: 0, net: 0 };
  const personItems = persons.data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-ink">Khata</h1>
      {persons.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-card border border-stroke rounded-card shadow-card p-4 animate-pulse">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-5 w-24" />
            </div>
          ))}
        </div>
      ) : personItems.length === 0 ? (
        <EmptyState
          title="No people yet"
          description="Add a person to start your khata tracking."
          primaryAction={{ label: 'Add Person', onClick: () => router.push('/settings/people') }}
        />
      ) : (
        <>
          <KhataSummaryCards owed={summary.owed} owe={summary.owe} net={summary.net} />

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 px-1">
              Quick Actions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setShowLend(true)}
                className="flex flex-shrink-0 items-center gap-2 rounded-[12px] bg-card border border-stroke px-3 py-2.5 shadow-card hover:bg-card-2 transition-colors active:scale-95"
              >
                <div className="w-8 h-8 rounded-[8px] bg-semantic-green-soft border border-semantic-green-border flex items-center justify-center">
                  <ArrowUp size={14} className="text-semantic-green" />
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-ink">Lend</p>
                  <p className="text-[10px] text-ink-3">Give money</p>
                </div>
              </button>

              <button
                onClick={() => setShowBorrow(true)}
                className="flex flex-shrink-0 items-center gap-2 rounded-[12px] bg-card border border-stroke px-3 py-2.5 shadow-card hover:bg-card-2 transition-colors active:scale-95"
              >
                <div className="w-8 h-8 rounded-[8px] bg-semantic-amber-soft border border-semantic-amber-border flex items-center justify-center">
                  <ArrowDown size={14} className="text-semantic-amber" />
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-ink">Borrow</p>
                  <p className="text-[10px] text-ink-3">Take money</p>
                </div>
              </button>
            </div>
          </div>

          <PersonList persons={personItems} />
        </>
      )}

      <AddTransactionModal
        open={showLend}
        onClose={() => setShowLend(false)}
        type="lend"
        persons={personItems.map((p) => ({ id: p.id, name: p.name }))}
      />
      <AddTransactionModal
        open={showBorrow}
        onClose={() => setShowBorrow(false)}
        type="borrow"
        persons={personItems.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
