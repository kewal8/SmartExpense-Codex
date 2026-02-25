'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export function BottomSheet({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useBodyScrollLock(open);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 240 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            className="no-scrollbar fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[20px] border border-[var(--border-glass)] bg-[var(--bg-secondary)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-modal [@supports(-webkit-touch-callout:none)]:[-webkit-overflow-scrolling:touch]"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--text-tertiary)]/40" />
            <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
