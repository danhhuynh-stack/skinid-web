import { useEffect, useRef } from 'react';

/**
 * Hook giám sát phiên làm việc Admin: tự động đăng xuất sau 30 phút không thao tác.
 * Bảo vệ an toàn dữ liệu khách hàng và chống lộ phiên theo tiêu chuẩn GĐ3 Master Admin.
 *
 * @param {Function} onTimeout Callback thực thi khi hết thời gian chờ
 * @param {number} timeoutMs Thời gian không thao tác tính bằng mili-giây (mặc định 30 phút = 1,800,000ms)
 */
export function useAdminIdleTimeout(onTimeout, timeoutMs = 30 * 60 * 1000) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof onTimeout !== 'function') return;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        console.warn('[Admin Security] Phiên làm việc đã hết hạn do không có thao tác trong 30 phút.');
        onTimeout();
      }, timeoutMs);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    for (const evt of events) {
      window.addEventListener(evt, resetTimer, { passive: true });
    }

    // Khởi tạo timer ban đầu
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const evt of events) {
        window.removeEventListener(evt, resetTimer);
      }
    };
  }, [onTimeout, timeoutMs]);
}
