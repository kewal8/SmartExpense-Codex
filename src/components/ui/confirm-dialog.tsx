'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  confirmDisabled?: boolean;
  loadingLabel?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  confirmDisabled = false,
  loadingLabel = 'Deleting...',
  children,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const titleId = useId();
  const descriptionId = useId();
  useBodyScrollLock(open);

  return (
    <Dialog.Root open={open} onOpenChange={(value) => (!value ? onCancel() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={
            isMobile
              ? 'no-scrollbar fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[20px] border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-modal [@supports(-webkit-touch-callout:none)]:[-webkit-overflow-scrolling:touch]'
              : 'no-scrollbar fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[20px] border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-5 shadow-modal [@supports(-webkit-touch-callout:none)]:[-webkit-overflow-scrolling:touch]'
          }
        >
          {isMobile ? <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--text-tertiary)]/40" /> : null}
          <Dialog.Title id={titleId} className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </Dialog.Title>
          <Dialog.Description id={descriptionId} className="mt-2 text-sm text-[var(--text-secondary)]">
            {description}
          </Dialog.Description>
          {children ? <div className="mt-4">{children}</div> : null}

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} autoFocus>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              disabled={confirmDisabled}
              isLoading={isLoading}
              loadingLabel={loadingLabel}
              onClick={() => {
                if (isLoading || confirmDisabled) return;
                onConfirm();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
