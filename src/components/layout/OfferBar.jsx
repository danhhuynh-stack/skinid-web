import { useEffect, useRef, useState } from 'react';

export default function OfferBar({ revealOnUpScroll = false }) {
  const [isVisible, setIsVisible] = useState(!revealOnUpScroll);
  const hideTimerRef = useRef(0);
  const topReadyTimerRef = useRef(0);
  const isTopReadyRef = useRef(false);
  const touchStartYRef = useRef(null);
  const touchStartedAtTopRef = useRef(false);

  useEffect(() => {
    if (!revealOnUpScroll) return undefined;

    const scheduleHide = () => {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setIsVisible(false), 2600);
    };
    const revealFromTopOverscroll = () => {
      setIsVisible(true);
      isTopReadyRef.current = false;
      scheduleHide();
    };
    const armTopOverscroll = () => {
      window.clearTimeout(topReadyTimerRef.current);
      topReadyTimerRef.current = window.setTimeout(() => {
        isTopReadyRef.current = window.scrollY <= 2;
      }, 450);
    };
    const onWheel = (event) => {
      window.clearTimeout(topReadyTimerRef.current);
      if (window.scrollY <= 2 && event.deltaY < -10 && isTopReadyRef.current) revealFromTopOverscroll();
      else {
        if (event.deltaY > 5 || window.scrollY > 2) setIsVisible(false);
        isTopReadyRef.current = false;
        if (window.scrollY <= 2) armTopOverscroll();
      }
    };
    const onScroll = () => {
      if (window.scrollY > 2) {
        isTopReadyRef.current = false;
        window.clearTimeout(topReadyTimerRef.current);
        setIsVisible(false);
      } else {
        armTopOverscroll();
      }
    };
    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
      touchStartedAtTopRef.current = window.scrollY <= 2;
    };
    const onTouchMove = (event) => {
      const currentY = event.touches[0]?.clientY;
      if (touchStartedAtTopRef.current && window.scrollY <= 2 && touchStartYRef.current != null && currentY - touchStartYRef.current > 18) {
        revealFromTopOverscroll();
        touchStartYRef.current = currentY;
      }
    };

    setIsVisible(false);
    isTopReadyRef.current = window.scrollY <= 2;
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.clearTimeout(hideTimerRef.current);
      window.clearTimeout(topReadyTimerRef.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [revealOnUpScroll]);

  return (
    <div className={`offer-bar ${revealOnUpScroll ? 'offer-bar--scroll' : ''} ${isVisible ? 'is-visible' : ''}`.trim()} aria-hidden={revealOnUpScroll && !isVisible}>
      Miễn phí giao hàng cho đơn từ 500.000₫ <span>·</span> Đổi trả trong 7 ngày <span>·</span> Hotline 0924.093.461
    </div>
  );
}
