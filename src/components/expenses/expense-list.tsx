'use client';

import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { MoreVertical, Pencil, Trash2, UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, Home, Tv, Tag, Wrench } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type ExpenseItem = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  typeId: string;
  type: { id: string; name: string };
};

function getCategoryStyle(category: string): string {
  const lower = category?.toLowerCase() ?? '';
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('zomato') || lower.includes('swiggy'))
    return 'bg-[rgba(248,113,113,0.15)] border-[rgba(248,113,113,0.25)]';
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('uber') || lower.includes('cab'))
    return 'bg-[rgba(124,106,247,0.15)] border-[rgba(124,106,247,0.25)]';
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('clothes'))
    return 'bg-[rgba(100,116,139,0.15)] border-[rgba(100,116,139,0.25)]';
  if (lower.includes('bill') || lower.includes('electric') || lower.includes('rent') || lower.includes('maintenance') || lower.includes('utility'))
    return 'bg-[rgba(251,191,36,0.15)] border-[rgba(251,191,36,0.25)]';
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy'))
    return 'bg-[rgba(52,211,153,0.15)] border-[rgba(52,211,153,0.25)]';
  if (lower.includes('entertain') || lower.includes('movie') || lower.includes('netflix') || lower.includes('ott'))
    return 'bg-[rgba(124,106,247,0.15)] border-[rgba(124,106,247,0.25)]';
  return 'bg-[rgba(110,107,132,0.15)] border-[rgba(110,107,132,0.2)]';
}

function getCategoryIcon(category: string, iconClass = 'w-[16px] h-[16px]') {
  const lower = category?.toLowerCase() ?? '';
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('zomato') || lower.includes('swiggy'))
    return <UtensilsCrossed className={iconClass} style={{ color: '#f87171' }} />;
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('uber') || lower.includes('cab'))
    return <Car className={iconClass} style={{ color: '#9d8ff9' }} />;
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('clothes'))
    return <ShoppingBag className={iconClass} style={{ color: '#94a3b8' }} />;
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy'))
    return <Heart className={iconClass} style={{ color: '#34d399' }} />;
  if (lower.includes('rent'))
    return <Home className={iconClass} style={{ color: '#fbbf24' }} />;
  if (lower.includes('maintenance'))
    return <Wrench className={iconClass} style={{ color: '#fbbf24' }} />;
  if (lower.includes('bill') || lower.includes('electric') || lower.includes('utility'))
    return <Receipt className={iconClass} style={{ color: '#fbbf24' }} />;
  if (lower.includes('entertain') || lower.includes('movie') || lower.includes('netflix') || lower.includes('ott'))
    return <Tv className={iconClass} style={{ color: '#9d8ff9' }} />;
  return <Tag className={iconClass} style={{ color: '#6e6b84' }} />;
}

export function ExpenseList({
  expenses,
  deletingId,
  onDelete,
  onEdit
}: {
  expenses: ExpenseItem[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onEdit: (expense: ExpenseItem) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!openMenuId) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-expense-action-menu-root]')) return;
      setOpenMenuId(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenuId]);

  if (expenses.length === 0) {
    return <EmptyState title="No expenses yet" description="Start by adding your first expense." />;
  }

  const grouped = expenses.reduce((acc, expense) => {
    const dateKey = new Date(expense.date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  const dateGroups = Object.entries(grouped);

  return (
    <div className="space-y-4">
      {dateGroups.map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.amount, 0);
        return (
          <div key={date}>
            {/* Date group header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
                {date}
              </span>
              <span className="text-[11px] font-mono text-ink-4">
                ₹{dayTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* One card per date group */}
            <div className="bg-card border border-stroke rounded-[16px] shadow-card">
              {items.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0"
                >
                  {/* Category icon */}
                  <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 border ${getCategoryStyle(expense.type.name)}`}>
                    {getCategoryIcon(expense.type.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink tracking-[-0.2px] truncate">
                      {expense.type.name}
                    </p>
                    <p className="text-[10.5px] text-ink-3 font-mono mt-0.5 truncate">
                      {expense.type.name}{expense.note ? ` · "${expense.note}"` : ''}
                    </p>
                  </div>

                  {/* Amount + menu */}
                  <div className="flex items-center gap-1 flex-shrink-0" data-expense-action-menu-root>
                    <span className="font-mono text-[13.5px] font-semibold tracking-[-0.4px] tabular-nums text-semantic-red">
                      −₹{expense.amount.toLocaleString('en-IN')}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        aria-label="More actions"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === expense.id}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-ink-4 hover:bg-card-2 hover:text-ink-2 transition-colors ml-1"
                        onClick={() => setOpenMenuId((current) => (current === expense.id ? null : expense.id))}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === expense.id ? (
                        <div
                          role="menu"
                          aria-label={`Actions for expense ${expense.type.name}`}
                          className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-stroke bg-card p-1 shadow-card"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-card-2"
                            onClick={() => {
                              setOpenMenuId(null);
                              onEdit(expense);
                            }}
                          >
                            <span className="inline-flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            aria-label={`Delete expense ${expense.type.name}`}
                            className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-semantic-red transition-colors hover:bg-semantic-red-soft disabled:text-ink-4"
                            disabled={deletingId === expense.id}
                            onClick={() => {
                              setOpenMenuId(null);
                              onDelete(expense.id);
                            }}
                          >
                            <span className="inline-flex items-center gap-2">
                              {deletingId === expense.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                              Delete
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
