'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = !!typeId || sort !== 'date_desc';

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-card border border-stroke rounded-[12px] text-[13px] text-ink font-mono placeholder:text-ink-4 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        {/* Filter toggle button */}
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`relative h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-[12px] border transition-colors ${
            hasActiveFilters
              ? 'bg-accent border-accent text-white shadow-[0_2px_8px_var(--accent-glow)]'
              : 'bg-card border-stroke text-ink-3 hover:bg-card-2'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-2 text-white text-[9px] font-bold flex items-center justify-center font-mono border-2 border-bg">
              !
            </span>
          )}
        </button>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="mt-2 flex gap-2">
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="flex-1 h-9 px-3 bg-card border border-stroke rounded-[10px] text-[12px] text-ink-3 font-mono focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 h-9 px-3 bg-card border border-stroke rounded-[10px] text-[12px] text-ink-3 font-mono focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </div>
      )}
    </div>
  );
}
