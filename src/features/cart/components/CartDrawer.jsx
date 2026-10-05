import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../../assets/index.js';
import { getProductById } from '../../catalog/index.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../context/CartContext.jsx';
import './CartDrawer.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function CartDrawer() {
  const {
    items, subtotal, isOpen, isHydrated, closeCart, removeItem,
    updateQuantity, clearCart, openCheckout
  } = useCart();
  const closeButtonRef = useRef(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  useBodyScrollLock(isOpen, 'cart');

  useEffect(() => {
    if (!isOpen) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeCart, isOpen]);

  const startCheckout = async () => {
    setCheckoutError('');
    setIsPreparing(true);
    try {
      await openCheckout();
    } catch (error) {
      setCheckoutError(error.message || 'Không thể chuẩn bị thanh toán. Vui lòng thử lại.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className={`react-cart-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="react-cart-backdrop" type="button" aria-label="Đóng giỏ hàng" onClick={closeCart} />
      <aside className="react-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="react-cart-title">
        <header className="react-cart-heading">
          <div><span>ĐƠN HÀNG CỦA BẠN</span><h2 id="react-cart-title">Giỏ hàng</h2></div>
          <button ref={closeButtonRef} type="button" className="react-cart-close" onClick={closeCart} aria-label="Đóng giỏ hàng">×</button>
        </header>

        <div className="react-cart-items">
          {!isHydrated && <p className="react-cart-status">Đang đồng bộ giỏ hàng…</p>}
          {isHydrated && !items.length && (
            <div className="react-cart-empty"><span aria-hidden="true">◯</span><strong>Giỏ hàng đang trống</strong><p>Khám phá sản phẩm phù hợp với làn da của bạn.</p><a href="/products" onClick={closeCart}>Tiếp tục mua sắm</a></div>
          )}
          {items.map((item) => {
            const product = getProductById(item.productId);
            return (
              <article className="react-cart-item" key={item.productId}>
                <img src={assetUrl(product?.image || '/images/products/placeholder.jpg', product?.brandSlug)} alt="" />
                <div className="react-cart-item-copy">
                  <span>{product?.brand || 'SkinID'}</span>
                  <h3>{product?.name || item.productId}</h3>
                  <strong>{formatPrice(product?.price)}</strong>
                  <div className="react-cart-quantity" aria-label={`Số lượng ${product?.name || item.productId}`}>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Giảm số lượng">−</button>
                    <b>{item.quantity}</b>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Tăng số lượng">+</button>
                  </div>
                </div>
                <button type="button" className="react-cart-remove" onClick={() => removeItem(item.productId)} aria-label={`Xóa ${product?.name || 'sản phẩm'}`}>Xóa</button>
              </article>
            );
          })}
        </div>

        {!!items.length && (
          <footer className="react-cart-footer">
            <button type="button" className="react-cart-clear" onClick={clearCart}>Xóa giỏ hàng</button>
            <div><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div>
            {checkoutError && <p role="alert">{checkoutError}</p>}
            <button type="button" className="react-cart-checkout" disabled={isPreparing || !isHydrated} onClick={startCheckout}>
              {isPreparing ? 'Đang chuẩn bị…' : 'Tiến hành thanh toán'}
            </button>
            <small>Giỏ hàng được đồng bộ an toàn với tài khoản của bạn.</small>
          </footer>
        )}
      </aside>
    </div>
  );
}
