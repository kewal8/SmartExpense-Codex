import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function daysUntil(date: Date | string) {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function dueLabel(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} day(s) overdue`;
  }
  if (days === 0) {
    return 'Due today';
  }
  if (days <= 3) {
    return `Due in ${days} day(s)`;
  }
  return `Due in ${days} day(s)`;
}

export function jsonResponse<T>(payload: { success: boolean; data?: T; error?: string }, status = 200) {
  return Response.json(payload, { status });
}
