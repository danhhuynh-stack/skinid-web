import { FREE_SHIPPING_THRESHOLD, hasNonFreeshipItems } from '../services/checkoutService.js';
import './FreeShippingBar.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function FreeShippingBar({ subtotal = 0, threshold = FREE_SHIPPING_THRESHOLD, items = [] }) {
  const isComboInCart = hasNonFreeshipItems(items);
  const current = Number(subtotal) || 0;
  const isAchieved = current >= threshold;
  const percentage = Math.min(100, Math.max(0, Math.round((current / threshold) * 100)));
  const remaining = Math.max(0, threshold - current);

  if (isComboInCart) {
    return (
      <div className="free-shipping-container is-combo-notice" role="region" aria-label="Chính sách vận chuyển">
        <p className="free-shipping-message">
          <span>📦 Đơn chứa <strong>Combo ưu đãi</strong> áp dụng phí ship chuẩn <strong>30.000₫</strong> (chính sách giảm sâu).</span>
        </p>
      </div>
    );
  }

  return (
    <div className="free-shipping-container" role="region" aria-label="Tiến trình miễn phí vận chuyển">
      <p className={`free-shipping-message ${isAchieved ? 'is-achieved' : ''}`}>
        {isAchieved ? (
          <span>🎉 Chúc mừng! Đơn hàng được <strong>Miễn phí vận chuyển</strong>!</span>
        ) : (
          <span>
            Mua thêm <strong>{formatPrice(remaining)}</strong> để nhận <strong>Freeship</strong>!
          </span>
        )}
        <span className="font-mono text-[11px] font-bold text-gray-400">{percentage}%</span>
      </p>
      <div className="free-shipping-track">
        <div
          className={`free-shipping-fill ${isAchieved ? 'is-achieved' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
