import { FileSearch } from 'lucide-react';

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
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const resolvedPrimary = primaryAction ?? (ctaLabel && onCta ? { label: ctaLabel, onClick: onCta } : undefined);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-10 h-10 rounded-[12px] bg-card-2 border border-stroke flex items-center justify-center mb-3 text-ink-3">
        {icon ?? <FileSearch className="w-4 h-4" />}
      </div>

      <p className="text-[13px] font-semibold text-ink-2 tracking-[-0.1px]">
        {title}
      </p>

      {description && (
        <p className="text-[11.5px] text-ink-3 font-mono mt-1 max-w-[220px]">
          {description}
        </p>
      )}

      {resolvedPrimary && (
        <button
          type="button"
          onClick={resolvedPrimary.onClick}
          className="mt-4 h-8 px-4 rounded-[9px] text-[12px] font-semibold bg-accent-soft border border-accent-border text-accent hover:bg-accent/20 transition-colors"
        >
          {resolvedPrimary.label}
        </button>
      )}

      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="mt-3 text-[12px] font-medium text-ink-3 hover:text-ink-2 transition-colors"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
