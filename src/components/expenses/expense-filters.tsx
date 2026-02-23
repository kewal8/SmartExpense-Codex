'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type ExpenseTypeOption = {
  id: string;
  name: string;
};

export function ExpenseFilters({
  search,
  setSearch,
  sort,
  setSort,
  types,
  typeId,
  setTypeId
}: {
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  typeId: string;
  setTypeId: (v: string) => void;
  types: ExpenseTypeOption[];
}) {
  return (
    <div className="sticky top-16 z-10 mb-4 grid grid-cols-1 gap-2 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-3 backdrop-blur-xl md:grid-cols-3">
      <Input placeholder="Search by note" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select
        value={typeId}
        onChange={(e) => setTypeId(e.target.value)}
        options={[{ label: 'All Types', value: '' }, ...types.map((t) => ({ label: t.name, value: t.id }))]}
      />
      <Select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        options={[
          { label: 'Date (Newest)', value: 'date_desc' },
          { label: 'Date (Oldest)', value: 'date_asc' },
          { label: 'Amount (High-Low)', value: 'amount_desc' },
          { label: 'Amount (Low-High)', value: 'amount_asc' }
        ]}
      />
    </div>
  );
}
