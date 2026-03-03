'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, Home, Tv, Tag, Wrench, ReceiptText } from 'lucide-react';

type RecentExpense = {
  id: string;
  amount: number;
  date: string;
  type: { name: string };
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

function getCategoryIcon(category: string, iconClass = 'w-[18px] h-[18px]') {
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

export function RecentExpenses({ expenses, onAddExpense }: { expenses: RecentExpense[]; onAddExpense: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 4;
  const visible = expanded ? expenses : expenses.slice(0, PREVIEW_COUNT);

  if (expenses.length === 0) {
    return (
      <div className="bg-card border border-stroke rounded-[18px] overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)]">
          <div>
            <p className="text-[13px] font-bold text-ink tracking-[-0.2px]">Recent Transactions</p>
            <p className="text-[11px] text-ink-3 font-mono mt-0.5">0 total</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 rounded-[12px] bg-card-2 border border-stroke flex items-center justify-center mb-3">
            <ReceiptText className="w-4 h-4 text-ink-4" />
          </div>
          <p className="text-[13px] font-semibold text-ink-3 tracking-[-0.1px]">No recent expenses</p>
          <p className="text-[11.5px] text-ink-4 font-mono mt-1 max-w-[200px]">Start logging spending to see your recent activity here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-stroke rounded-[18px] overflow-hidden shadow-card">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)]">
        <div>
          <p className="text-[13px] font-bold text-ink tracking-[-0.2px]">Recent Transactions</p>
          <p className="text-[11px] text-ink-3 font-mono mt-0.5">{expenses.length} total</p>
        </div>
      </div>

      {/* Rows */}
      {visible.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] last:border-b-0 transition-colors active:bg-card-2"
        >
          {/* Icon */}
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border ${getCategoryStyle(expense.type.name)}`}>
            {getCategoryIcon(expense.type.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-ink tracking-[-0.2px] truncate">
              {expense.type.name}
            </p>
            <p className="text-[11px] text-ink-3 font-mono mt-0.5">
              {formatDate(expense.date)}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-[14px] font-semibold tracking-[-0.4px] text-semantic-red">
              −₹{expense.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      ))}

      {/* See all */}
      {expenses.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="w-full py-3 text-[12px] font-semibold font-mono text-accent tracking-wide border-t border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] hover:bg-card-2 transition-colors"
        >
          {expanded ? '↑ Show less' : `See all ${expenses.length} transactions →`}
        </button>
      )}
    </div>
  );
}
