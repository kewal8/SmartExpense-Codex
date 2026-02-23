'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let lockCount = 0;
let savedScrollY = 0;

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement;

    savedScrollY = window.scrollY;

    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    html.style.overscrollBehavior = 'none';
  }
  lockCount += 1;
}

function unlockBodyScroll(force = false) {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;

  lockCount = force ? 0 : Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const body = document.body;
  const html = document.documentElement;

  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.overflow = '';
  html.style.overscrollBehavior = '';

  window.scrollTo(0, savedScrollY);
}

export function useBodyScrollLock(locked: boolean) {
  const pathname = usePathname();

  useEffect(() => {
    if (!locked) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [locked]);

  useEffect(() => {
    if (!locked) return;
    unlockBodyScroll(true);
  }, [pathname, locked]);
}

