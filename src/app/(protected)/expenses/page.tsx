'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchX, UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, Home, Circle, Tv, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseFilters } from '@/components/expenses/expense-filters';
import { ExpenseList } from '@/components/expenses/expense-list';
import { AddExpenseModal } from '@/components/expenses/add-expense-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/useDebounce';

type ExpenseType = { id: string; name: string };
type ExpenseItem = {
  id: string;
  amount: number;
  date: string;
  note?: string | null;
  typeId: string;
  type: { id: string; name: string };
};
type CategorySummary = {
  typeId: string;
  category: string;
  totalAmount: number;
  percentage: number;
};

function getCategoryStyle(category: string) {
  const lower = category?.toLowerCase() ?? '';
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('zomato') || lower.includes('swiggy'))
    return 'bg-semantic-red-soft border-semantic-red-border';
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('uber') || lower.includes('cab'))
    return 'bg-accent-soft border-accent-border';
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('clothes'))
    return 'bg-[rgba(100,116,139,0.12)] border-[rgba(100,116,139,0.18)]';
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy'))
    return 'bg-semantic-green-soft border-semantic-green-border';
  if (lower.includes('rent') || lower.includes('maintenance'))
    return 'bg-semantic-amber-soft border-semantic-amber-border';
  if (lower.includes('bill') || lower.includes('electric') || lower.includes('utility'))
    return 'bg-semantic-amber-soft border-semantic-amber-border';
  if (lower.includes('entertain') || lower.includes('movie'))
    return 'bg-accent-soft border-accent-border';
  return 'bg-card-2 border-stroke';
}

function getCategoryIcon(category: string, iconClass = 'w-[16px] h-[16px]') {
  const lower = category?.toLowerCase() ?? '';
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('zomato') || lower.includes('swiggy'))
    return <UtensilsCrossed className={`${iconClass} text-semantic-red`} />;
  if (lower.includes('transport') || lower.includes('travel') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('uber') || lower.includes('cab'))
    return <Car className={`${iconClass} text-accent-2`} />;
  if (lower.includes('shop') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('clothes'))
    return <ShoppingBag className={`${iconClass} text-slate-400`} />;
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('pharmacy'))
    return <Heart className={`${iconClass} text-semantic-green`} />;
  if (lower.includes('rent') || lower.includes('maintenance'))
    return <Home className={`${iconClass} text-semantic-amber`} />;
  if (lower.includes('bill') || lower.includes('electric') || lower.includes('utility'))
    return <Receipt className={`${iconClass} text-semantic-amber`} />;
  if (lower.includes('entertain') || lower.includes('movie') || lower.includes('netflix') || lower.includes('ott'))
    return <Tv className={`${iconClass} text-accent-2`} />;
  if (lower.includes('other'))
    return <Tag className={`${iconClass} text-ink-3`} />;
  return <Circle className={`${iconClass} text-ink-3`} />;
}

async function getTypes() {
  const res = await fetch('/api/expense-types');
  if (!res.ok) throw new Error('Failed to fetch types');
  return (await res.json()).data as ExpenseType[];
}

export default function ExpensesPage() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [typeId, setTypeId] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [confirmExpenseId, setConfirmExpenseId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 350);
  const qc = useQueryClient();
  const { showToast } = useToast();

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20', sort });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (typeId) params.set('typeId', typeId);
    return params.toString();
  }, [debouncedSearch, page, sort, typeId]);
  const hasActiveFilters = Boolean(debouncedSearch || typeId || sort !== 'date_desc');

  const expenses = useQuery({
    queryKey: ['expenses', query],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?${query}`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return (await res.json()).data as {
        items: ExpenseItem[];
        pagination: { totalPages: number };
      };
    }
  });

  const categorySummary = useQuery({
    queryKey: ['expense-category-summary', query],
    queryFn: async () => {
      const res = await fetch(`/api/expenses/category-summary?${query}`);
      if (!res.ok) throw new Error('Failed to fetch category summary');
      return (await res.json()).data as CategorySummary[];
    }
  });

  const types = useQuery({ queryKey: ['expense-types'], queryFn: getTypes });

  const summary = useQuery({
    queryKey: ['expense-summary', thisMonth, thisYear],
    queryFn: async () => {
      const res = await fetch(`/api/expenses/summary?month=${thisMonth}&year=${thisYear}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingExpenseId(id);
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Failed to delete expense');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-category-summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      showToast('Deleted');
    },
    onSettled: () => setDeletingExpenseId(null),
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to delete expense', 'error');
    }
  });

  const totalPages = expenses.data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold tracking-[-0.4px] text-ink">My Expenses</h1>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setShowAdd(true);
          }}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-accent text-white shadow-[0_2px_8px_var(--accent-glow)] hover:bg-accent/90 transition-all border-0 h-8"
        >
          Add Expense
        </Button>
      </div>

      <section className="space-y-3">
        <ExpenseFilters
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          types={types.data ?? []}
          typeId={typeId}
          setTypeId={setTypeId}
        />

        {summary.data && (
          <div className="bg-card border border-stroke rounded-[16px] shadow-card px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3 font-mono mb-1">
                {new Date(now.getFullYear(), now.getMonth()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
              <p className="font-mono text-[22px] font-semibold tracking-[-0.05em] tabular-nums text-ink leading-none">
                ₹{summary.data.thisMonth.total.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-3 font-mono mb-1.5">
                vs last month
              </p>
              {summary.data.lastMonth.total > 0 ? (
                <>
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono"
                    style={{
                      background: summary.data.isUp ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
                      border: `1px solid ${summary.data.isUp ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
                      color: summary.data.isUp ? '#f87171' : '#34d399'
                    }}
                  >
                    {summary.data.isUp ? '↑' : '↓'}{summary.data.pct !== null ? `${Math.abs(summary.data.pct)}%` : ''}
                  </div>
                  <p className="text-[10px] text-ink-4 font-mono mt-1">
                    ₹{summary.data.lastMonth.total.toLocaleString('en-IN')} last mo
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-ink-3 font-mono">No data</p>
              )}
            </div>
          </div>
        )}

        {expenses.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card border border-stroke rounded-[16px] shadow-card p-4 animate-pulse h-14">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-3 w-24" />
                <Skeleton className="mt-3 h-5 w-20" />
              </div>
            ))}
          </div>
        ) : expenses.data?.items?.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              title="No results found"
              description="Try adjusting your filters."
              icon={<SearchX className="h-5 w-5" />}
              primaryAction={{
                label: 'Clear filters',
                onClick: () => {
                  setSearch('');
                  setTypeId('');
                  setSort('date_desc');
                  setPage(1);
                }
              }}
            />
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Start by adding your first expense."
              ctaLabel="Add Expense"
              onCta={() => setShowAdd(true)}
            />
          )
        ) : (
          <ExpenseList
            expenses={expenses.data?.items ?? []}
            deletingId={deletingExpenseId}
            onEdit={(expense) => {
              setEditingExpense(expense);
              setShowAdd(true);
            }}
            onDelete={(id) => {
              if (deletingExpenseId) return;
              setConfirmExpenseId(id);
            }}
          />
        )}

        <div className="flex items-center justify-between px-1 py-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold font-mono bg-card border border-stroke text-ink-3 hover:bg-card-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[11px] font-mono text-ink-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold font-mono bg-card border border-stroke text-ink-3 hover:bg-card-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </section>

      <div className="h-px bg-stroke" />

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Category Breakdown</span>
          <span className="text-[11px] font-mono text-ink-4">this page</span>
        </div>
        {categorySummary.isLoading ? (
          <div className="bg-card border border-stroke rounded-[16px] shadow-card overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="px-4 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0 animate-pulse">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (categorySummary.data ?? []).length === 0 ? (
          <EmptyState title="No category spend data" description="Add expenses to see category totals." />
        ) : (
          <div className="bg-card border border-stroke rounded-[16px] overflow-hidden shadow-card">
            {(categorySummary.data ?? []).map((item) => {
              const pct = Math.round(item.percentage);
              return (
                <div
                  key={item.typeId}
                  className="px-4 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center border flex-shrink-0 ${getCategoryStyle(item.category)}`}>
                        {getCategoryIcon(item.category, 'w-3.5 h-3.5')}
                      </div>
                      <span className="text-[13.5px] font-semibold text-ink tracking-[-0.2px]">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-[13.5px] font-semibold text-ink tracking-[-0.4px] tabular-nums">
                      ₹{item.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-card-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-ink-4 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AddExpenseModal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          setEditingExpense(null);
        }}
        types={types.data ?? []}
        initialExpense={editingExpense}
      />

      <ConfirmDialog
        open={Boolean(confirmExpenseId)}
        title="Delete entry?"
        description="This will permanently remove this expense. This can’t be undone."
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          if (deleteMutation.isPending) return;
          setConfirmExpenseId(null);
        }}
        onConfirm={() => {
          if (!confirmExpenseId || deleteMutation.isPending) return;
          deleteMutation.mutate(confirmExpenseId, {
            onSuccess: () => setConfirmExpenseId(null)
          });
        }}
      />
    </div>
  );
}

