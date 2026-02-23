import { FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  ctaLabel,
  onCta
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const resolvedPrimary = primaryAction ?? (ctaLabel && onCta ? { label: ctaLabel, onClick: onCta } : undefined);

  return (
    <div className="glass-card text-center">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-glass)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
        {icon ?? <FileSearch className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
      {resolvedPrimary ? (
        <div className="mt-4">
          <Button onClick={resolvedPrimary.onClick}>{resolvedPrimary.label}</Button>
        </div>
      ) : null}
      {secondaryAction ? (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="mt-3 text-sm font-medium text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-blue)]/80"
        >
          {secondaryAction.label}
        </button>
      ) : null}
    </div>
  );
}
