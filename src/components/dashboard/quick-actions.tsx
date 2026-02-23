'use client';

import { Plus, HandCoins, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions({
  onAddExpense,
  onLend,
  onBorrow
}: {
  onAddExpense: () => void;
  onLend: () => void;
  onBorrow: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Button className="w-full" onClick={onAddExpense}>
        <Plus className="mr-2 h-4 w-4" /> Add Expense
      </Button>
      <Button className="w-full bg-[var(--accent-green)]" onClick={onLend}>
        <HandCoins className="mr-2 h-4 w-4" /> Lend
      </Button>
      <Button className="w-full bg-[var(--accent-orange)]" onClick={onBorrow}>
        <ArrowDownCircle className="mr-2 h-4 w-4" /> Borrow
      </Button>
    </div>
  );
}
