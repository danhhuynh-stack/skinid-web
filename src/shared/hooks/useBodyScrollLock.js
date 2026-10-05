import { useEffect } from 'react';

const activeLocks = new Set();

function syncBody() {
  if (typeof document !== 'undefined') document.body.classList.toggle('react-no-scroll', activeLocks.size > 0);
}

export function lockBodyScroll(key) {
  activeLocks.add(key);
  syncBody();
}

export function unlockBodyScroll(key) {
  activeLocks.delete(key);
  syncBody();
}

export function useBodyScrollLock(locked, key) {
  useEffect(() => {
    if (!locked) return undefined;
    lockBodyScroll(key);
    return () => unlockBodyScroll(key);
  }, [key, locked]);
}
