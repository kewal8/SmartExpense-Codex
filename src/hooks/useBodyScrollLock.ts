'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyles: Partial<CSSStyleDeclaration> = {};
let savedHtmlStyles: Partial<CSSStyleDeclaration> = {};

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement;

    savedScrollY = window.scrollY;
    savedBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      maxWidth: body.style.maxWidth,
      overflow: body.style.overflow,
      overflowX: body.style.overflowX
    };
    savedHtmlStyles = {
      overscrollBehavior: html.style.overscrollBehavior,
      overflowX: html.style.overflowX,
      width: html.style.width
    };

    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.maxWidth = '100%';
    body.style.overflow = 'hidden';
    body.style.overflowX = 'hidden';

    html.style.overscrollBehavior = 'none';
    html.style.overflowX = 'hidden';
    html.style.width = '100%';
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

  body.style.position = savedBodyStyles.position ?? '';
  body.style.top = savedBodyStyles.top ?? '';
  body.style.left = savedBodyStyles.left ?? '';
  body.style.right = savedBodyStyles.right ?? '';
  body.style.width = savedBodyStyles.width ?? '';
  body.style.maxWidth = savedBodyStyles.maxWidth ?? '';
  body.style.overflow = savedBodyStyles.overflow ?? '';
  body.style.overflowX = savedBodyStyles.overflowX ?? '';
  html.style.overscrollBehavior = savedHtmlStyles.overscrollBehavior ?? '';
  html.style.overflowX = savedHtmlStyles.overflowX ?? '';
  html.style.width = savedHtmlStyles.width ?? '';

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
