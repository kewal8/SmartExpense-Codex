'use client';

import { useState } from 'react';
import Link from 'next/link';

type Person = {
  id: string;
  name: string;
  netBalance: number;
};

export function PersonList({ persons }: { persons: Person[] }) {
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = persons.filter((p) => {
    if (filter === 'lend') return p.netBalance > 0;
    if (filter === 'borrow') return p.netBalance < 0;
    return true;
  });
  const PREVIEW_COUNT = 4;
  const visible = expanded ? filtered : filtered.slice(0, PREVIEW_COUNT);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {(['all', 'lend', 'borrow'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setExpanded(false); }}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-colors border ${
              filter === f
                ? 'bg-card border-stroke text-ink shadow-card'
                : 'bg-transparent border-transparent text-ink-3'
            }`}
          >
            {f === 'all' ? 'All' : f === 'lend' ? 'Lent' : 'Borrowed'}
          </button>
        ))}
      </div>

      {/* Person cards */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 ? (
          <div className="bg-card border border-stroke rounded-[16px] p-6 text-center shadow-card">
            <p className="text-[13px] text-ink-3">No {filter === 'lend' ? 'lent' : 'borrowed'} entries</p>
          </div>
        ) : (
          visible.map((person) => (
            <Link key={person.id} href={`/khata/${person.id}`} className="block">
              <div className="relative bg-card border border-stroke rounded-[16px] p-4 shadow-card overflow-hidden hover:bg-card-2 transition-colors active:scale-[0.99]">
                {/* Colored left border accent */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                  style={{
                    background: person.netBalance > 0
                      ? '#34d399'
                      : person.netBalance < 0
                      ? '#f87171'
                      : 'var(--ink-4)',
                  }}
                />

                <div className="flex items-center gap-3 pl-2">
                  {/* Avatar */}
                  <div
                    className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0 text-[17px] font-bold"
                    style={{
                      background: person.netBalance > 0
                        ? 'rgba(52,211,153,0.15)'
                        : person.netBalance < 0
                        ? 'rgba(248,113,113,0.15)'
                        : 'var(--card-2)',
                      color: person.netBalance > 0
                        ? '#34d399'
                        : person.netBalance < 0
                        ? '#f87171'
                        : 'var(--ink-3)',
                    }}
                  >
                    {person.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink tracking-[-0.2px]">
                      {person.name}
                    </p>
                    <p className="text-[11px] text-ink-3 font-mono mt-0.5">
                      {person.netBalance > 0
                        ? '↑ Lent'
                        : person.netBalance < 0
                        ? '↓ Borrowed'
                        : '✓ Settled'}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="text-right">
                    <p
                      className="font-mono text-[15px] font-bold tracking-[-0.5px] tabular-nums"
                      style={{
                        color: person.netBalance > 0
                          ? '#34d399'
                          : person.netBalance < 0
                          ? '#f87171'
                          : 'var(--ink-3)',
                      }}
                    >
                      {person.netBalance > 0 ? '+' : person.netBalance < 0 ? '−' : ''}
                      ₹{Math.abs(person.netBalance).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[9.5px] text-ink-4 font-mono uppercase tracking-[0.05em] mt-0.5">
                      {person.netBalance > 0
                        ? 'owes you'
                        : person.netBalance < 0
                        ? 'you owe'
                        : 'settled'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}

        {/* See all */}
        {filtered.length > PREVIEW_COUNT && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-full py-2.5 text-[12px] font-semibold font-mono text-accent tracking-wide text-center"
          >
            {expanded ? '↑ Show less' : `See all ${filtered.length} people →`}
          </button>
        )}
      </div>
    </div>
  );
}
