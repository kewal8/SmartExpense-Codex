'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

type ReminderItem = {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  urgency: 0 | 1 | 2 | 3;
  kind: string;
};

const PREVIEW_COUNT = 3;

export function PaymentReminders({ reminders }: { reminders: ReminderItem[] }) {
  const visible = reminders.slice(0, PREVIEW_COUNT);

  return (
    <div className="bg-card border border-stroke rounded-[18px] shadow-card overflow-hidden p-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">
          Upcoming Dues
        </span>
        {reminders.length > 0 && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[rgba(248,113,113,0.12)] border border-[rgba(248,113,113,0.2)] text-[#f87171]">
            {reminders.length} due
          </span>
        )}
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 rounded-[12px] bg-card-2 border border-stroke flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4 text-ink-3" />
          </div>
          <p className="text-[13px] font-semibold text-ink-2">All caught up</p>
          <p className="text-[11.5px] text-ink-3 font-mono mt-1">No upcoming dues</p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="space-y-2">
            {visible.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-card border border-stroke rounded-[14px] shadow-card px-4 py-[13px] flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                {/* Colored dot — urgency indicator */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: reminder.urgency === 0
                      ? '#f87171'
                      : reminder.urgency === 1
                      ? '#fbbf24'
                      : '#6e6b84'
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink tracking-[-0.2px] truncate">
                    {reminder.title}
                  </p>
                  <p className="text-[11px] text-ink-3 font-mono mt-0.5">
                    Due {new Date(reminder.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Amount + urgency badge */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="font-mono text-[14px] font-bold tracking-[-0.4px] tabular-nums"
                    style={{
                      color: reminder.urgency === 0
                        ? '#f87171'
                        : reminder.urgency === 1
                        ? '#fbbf24'
                        : 'var(--ink)'
                    }}
                  >
                    ₹{reminder.amount.toLocaleString('en-IN')}
                  </p>
                  {reminder.urgency <= 1 && (
                    <span
                      className="text-[9.5px] font-bold font-mono uppercase tracking-[0.04em] px-1.5 py-0.5 rounded-[4px] mt-[3px] inline-block"
                      style={{
                        background: reminder.urgency === 0 ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)',
                        border: `1px solid ${reminder.urgency === 0 ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                        color: reminder.urgency === 0 ? '#f87171' : '#fbbf24'
                      }}
                    >
                      {reminder.urgency === 0 ? 'Urgent' : 'Soon'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* See all — navigates to recurring page */}
          {reminders.length > PREVIEW_COUNT && (
            <Link
              href="/recurring"
              className="flex items-center justify-center gap-1.5 w-full pt-3 mt-2 text-[13px] font-semibold text-accent font-mono border-t border-[rgba(255,255,255,0.04)] hover:bg-card-2 transition-colors"
            >
              See all {reminders.length} dues →
            </Link>
          )}
        </>
      )}
    </div>
  );
}
