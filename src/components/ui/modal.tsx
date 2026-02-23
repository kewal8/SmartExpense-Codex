'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({
  open,
  onOpenChange,
  title,
  children
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-5 shadow-modal">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">{title}</Dialog.Title>
            <Dialog.Close aria-label="Close">
              <X className="h-5 w-5 text-[var(--text-secondary)]" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
