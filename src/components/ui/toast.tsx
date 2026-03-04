'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'success' | 'error';
type Toast = { id: number; message: string; tone: ToastTone; exiting: boolean };

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const keyframes = `
@keyframes toast-in {
  from { opacity: 0; transform: translateX(calc(100% + 16px)); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(calc(100% + 16px)); }
}
.toast-container {
  position: fixed;
  bottom: 88px;
  right: 16px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  pointer-events: none;
}
@media (min-width: 768px) {
  .toast-container {
    bottom: auto;
    top: 16px;
  }
}
`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone, exiting: false }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    }, 2400);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div className="toast-container">
          {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            style={{
              animation: toast.exiting
                ? 'toast-out 0.2s ease forwards'
                : 'toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
              background: 'var(--card)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '240px',
              maxWidth: '320px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: toast.tone === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
                border: `1px solid ${toast.tone === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
              }}
            >
              {toast.tone === 'error' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 2L2 10M2 2l8 8" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                letterSpacing: '-0.1px',
                flex: 1,
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {toast.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
