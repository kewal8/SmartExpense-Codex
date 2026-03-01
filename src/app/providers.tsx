'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';

function MobileGestureGuards() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let isStandalone = false;
    let isMobile = false;
    let isTouchDevice = false;

    try {
      isStandalone =
        window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
        ((window.navigator as Navigator & { standalone?: boolean }).standalone ?? false) === true;
      isMobile = window.matchMedia?.('(max-width: 767px)')?.matches === true;
      isTouchDevice = 'ontouchstart' in window || (window.navigator.maxTouchPoints ?? 0) > 0;
    } catch {
      return;
    }

    if (!isTouchDevice || (!isStandalone && !isMobile)) return;

    const preventGesture = (event: Event) => event.preventDefault();
    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    document.addEventListener('touchstart', preventMultiTouch, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchstart', preventMultiTouch);
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
          }
        }
      })
  );

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false} refetchInterval={0}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <MobileGestureGuards />
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
