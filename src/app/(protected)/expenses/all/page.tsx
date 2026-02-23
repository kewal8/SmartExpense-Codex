'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ExpenseFilters } from '@/components/expenses/expense-filters';
import { ExpenseList } from '@/components/expenses/expense-list';
import { AddExpenseModal } from '@/components/expenses/add-expense-modal';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchX } from 'lucide-react';

async function getTypes() {
  const res = await fetch('/api/expense-types');
  if (!res.ok) throw new Error('Failed to fetch types');
  return (await res.json()).data;
}

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [typeId, setTypeId] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
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
      return (await res.json()).data;
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
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">All Expenses</h1>
        <div className="flex items-center gap-2">
          <a href="/api/reports/export">
            <Button variant="secondary">Export CSV</Button>
          </a>
          <Button onClick={() => setShowAdd(true)}>Add Expense</Button>
        </div>
      </div>

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
            description="Try adjusting your filters or date range."
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
            description="Start tracking spending by adding your first expense."
            ctaLabel="Add Expense"
            onCta={() => setShowAdd(true)}
          />
        )
      ) : (
        <ExpenseList
          expenses={expenses.data?.items ?? []}
          deletingId={deletingExpenseId}
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

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} types={types.data ?? []} />
      <ConfirmDialog
        open={Boolean(confirmExpenseId)}
        title="Delete Expense?"
        description="This action cannot be undone."
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
