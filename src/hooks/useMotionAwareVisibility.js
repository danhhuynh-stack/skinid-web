import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reveals a section when it enters the viewport while keeping a reliable
 * static fallback for reduced-motion users and browsers without observers.
 */
export default function useMotionAwareVisibility(sectionRef, options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -6% 0px' } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const motionPreference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    let observer;

    const reveal = () => setIsVisible(true);
    const revealWithoutMotion = () => {
      reveal();
      observer?.disconnect();
    };

    if (motionPreference?.matches || typeof IntersectionObserver === 'undefined') {
      revealWithoutMotion();
      return undefined;
    }

    observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      reveal();
      observer.disconnect();
    }, { threshold, rootMargin });

    observer.observe(node);

    const handleMotionPreference = (event) => {
      if (event.matches) revealWithoutMotion();
    };

    motionPreference?.addEventListener?.('change', handleMotionPreference);

    return () => {
      observer?.disconnect();
      motionPreference?.removeEventListener?.('change', handleMotionPreference);
    };
  }, [sectionRef, threshold, rootMargin]);

  return isVisible;
}
