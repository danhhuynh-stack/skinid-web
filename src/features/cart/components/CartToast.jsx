import { useEffect } from 'react';
import { assetUrl } from '../../../assets/index.js';
import './CartToast.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function CartToast({ toast, onClose, onOpenCart }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { product, quantity = 1 } = toast;
  const image = assetUrl(product?.image || '/images/products/placeholder.jpg', product?.brandSlug);

  return (
    <aside className="cart-toast-layer" aria-live="polite" aria-atomic="true">
      <div className="cart-toast-card" role="status">
        <img
          src={image}
          alt={product?.name || 'Sản phẩm'}
          className="cart-toast-thumb"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = assetUrl('/images/products/placeholder.jpg');
          }}
        />
        <div className="cart-toast-content">
          <span className="cart-toast-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Đã thêm vào giỏ (+{quantity})
          </span>
          <h4 className="cart-toast-title" title={product?.name}>{product?.name || 'Sản phẩm'}</h4>
          <span className="cart-toast-price">{formatPrice(product?.price)}</span>
        </div>
        <div className="cart-toast-actions">
          <button
            type="button"
            className="cart-toast-btn-view"
            onClick={() => {
              onClose?.();
              onOpenCart?.();
            }}
          >
            Xem giỏ →
          </button>
          <button
            type="button"
            className="cart-toast-close"
            onClick={onClose}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>
      </div>
    </aside>
  );
}
