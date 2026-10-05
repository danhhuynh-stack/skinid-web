import { useEffect } from 'react';

export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef?.current;
    if (!root) return undefined;

    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const revealImmediately = (element) => element.classList.add('is-revealed');
    const revealAll = () => root.querySelectorAll('[data-reveal]').forEach(revealImmediately);

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer?.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });

    const observe = (element) => {
      if (!(element instanceof HTMLElement) || element.dataset.revealBound === 'true') return;
      element.dataset.revealBound = 'true';
      const delay = Number(element.dataset.revealDelay || 0);
      element.style.setProperty('--reveal-delay', `${Math.max(0, delay)}ms`);
      if (motionPreference?.matches || !observer) {
        revealImmediately(element);
        return;
      }
      observer.observe(element);
    };

    root.querySelectorAll('[data-reveal]').forEach(observe);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('[data-reveal]')) observe(node);
        node.querySelectorAll?.('[data-reveal]').forEach(observe);
      }));
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    const handleMotionPreference = (event) => {
      if (!event.matches) return;
      revealAll();
      observer?.disconnect();
    };
    motionPreference?.addEventListener?.('change', handleMotionPreference);

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
      motionPreference?.removeEventListener?.('change', handleMotionPreference);
    };
  }, [rootRef]);
}
