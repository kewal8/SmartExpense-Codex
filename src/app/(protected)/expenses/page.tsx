'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseFilters } from '@/components/expenses/expense-filters';
import { ExpenseList } from '@/components/expenses/expense-list';
import { AddExpenseModal } from '@/components/expenses/add-expense-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils';

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

async function getTypes() {
  const res = await fetch('/api/expense-types');
  if (!res.ok) throw new Error('Failed to fetch types');
  return (await res.json()).data as ExpenseType[];
}

export default function ExpensesPage() {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">My Expenses</h1>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setShowAdd(true);
          }}
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

        {expenses.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-card p-4">
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

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <p className="text-sm text-[var(--text-secondary)]">Page {page}</p>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={expenses.data ? page >= expenses.data.pagination.totalPages : false}
          >
            Next
          </Button>
        </div>
      </section>

      <div className="h-px bg-[var(--border-glass)]" />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Category-wise Spend</h2>
        {categorySummary.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-card p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-5 w-24" />
              </div>
            ))}
          </div>
        ) : (categorySummary.data ?? []).length === 0 ? (
          <EmptyState title="No category spend data" description="Add expenses to see category totals." />
        ) : (
          <div className="space-y-2">
            {(categorySummary.data ?? []).map((item) => (
              <div key={item.typeId} className="glass-card flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.category}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.percentage.toFixed(1)}% of total</p>
                </div>
                <p className="font-mono text-lg font-semibold">{formatCurrency(item.totalAmount)}</p>
              </div>
            ))}
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

