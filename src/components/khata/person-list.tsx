import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

type Person = {
  id: string;
  name: string;
  netBalance: number;
};

export function PersonList({ persons }: { persons: Person[] }) {
  return (
    <div className="space-y-2">
      {persons.map((person) => (
        <Link key={person.id} href={`/khata/${person.id}`} className="glass-card flex items-center justify-between p-4">
          <div>
            <h3 className="text-base font-semibold">{person.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">Net balance</p>
          </div>
          <p className="font-mono text-lg font-semibold">{formatCurrency(person.netBalance)}</p>
        </Link>
      ))}
    </div>
  );
}
