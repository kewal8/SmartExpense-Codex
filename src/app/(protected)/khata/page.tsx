'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PersonList } from '@/components/khata/person-list';
import { KhataSummaryCards } from '@/components/khata/khata-summary-cards';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

type Person = { id: string; name: string; netBalance: number };
type KhataSummary = { owed: number; owe: number; net: number };
type PersonsResponse = { data: Person[]; summary?: KhataSummary };

export default function KhataPage() {
  const router = useRouter();
  const persons = useQuery<PersonsResponse>({
    queryKey: ['persons', 'khata-summary'],
    queryFn: async () => {
      const res = await fetch('/api/persons');
      if (!res.ok) throw new Error('Failed to fetch persons');
      const payload = await res.json();
      return { data: payload.data ?? [], summary: payload.summary };
    }
  });

  const summary = persons.data?.summary ?? { owed: 0, owe: 0, net: 0 };
  const personItems = persons.data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-[28px] font-bold tracking-[-0.02em]">Khata</h1>
      {persons.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="glass-card p-4">
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
          <PersonList persons={personItems} />
        </>
      )}
    </div>
  );
}
