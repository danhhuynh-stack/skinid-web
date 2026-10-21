import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../../assets/index.js';
import { getProductById } from '../../catalog/index.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../context/CartContext.jsx';
import { getAvailableCoupons } from '../services/couponService.js';
import FreeShippingBar from './FreeShippingBar.jsx';
import './CartDrawer.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function CartDrawer() {
  const {
    items, subtotal, isOpen, isHydrated, closeCart, removeItem,
    updateQuantity, clearCart, openCheckout,
    appliedCoupon, couponDiscount, shippingFee, effectiveShippingFee, calculatedTotal, couponError,
    applyCoupon, removeCoupon
  } = useCart();

  const closeButtonRef = useRef(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const availableCoupons = getAvailableCoupons();

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

  const handleApplyVoucher = (codeToApply) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    if (!code) return;
    applyCoupon(code);
    setVoucherInput('');
  };

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
          <div>
            <span>ĐƠN HÀNG CỦA BẠN</span>
            <h2 id="react-cart-title">Giỏ hàng ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="react-cart-close" onClick={closeCart} aria-label="Đóng giỏ hàng">×</button>
        </header>

        {isHydrated && !!items.length && (
          <FreeShippingBar subtotal={subtotal} items={items} />
        )}

        <div className="react-cart-items">
          {!isHydrated && <p className="react-cart-status">Đang đồng bộ giỏ hàng…</p>}
          {isHydrated && !items.length && (
            <div className="react-cart-empty">
              <span aria-hidden="true">🛍️</span>
              <strong>Giỏ hàng đang trống</strong>
              <p>Khám phá dược mỹ phẩm chính hãng và phác đồ chăm sóc chuyên sâu.</p>
              <a href="/products" onClick={closeCart}>Khám phá sản phẩm ngay →</a>
            </div>
          )}
          {items.map((item) => {
            const product = getProductById(item.productId);
            const bundleItems = product?.bundleItems || [];
            return (
              <article className="react-cart-item" key={item.productId}>
                <img
                  src={assetUrl(product?.image || '/images/products/placeholder.jpg', product?.brandSlug)}
                  alt={product?.name || 'Sản phẩm'}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f8f9fa" width="100" height="100"/><text fill="%23ced4da" font-size="12" font-family="sans-serif" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">SkinID</text></svg>';
                  }}
                />
                <div className="react-cart-item-copy">
                  <span>{product?.brand || 'SkinID'}</span>
                  <h3>{product?.name || item.productId}</h3>
                  <strong>{formatPrice(product?.price)}</strong>
                  <div className="react-cart-quantity" aria-label={`Số lượng ${product?.name || item.productId}`}>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Giảm số lượng">−</button>
                    <b>{item.quantity}</b>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Tăng số lượng">+</button>
                  </div>

                  {bundleItems.length > 0 && (
                    <div className="react-cart-bundle-breakdown">
                      <div className="react-cart-bundle-title">🎁 Sản phẩm trong combo ({item.quantity > 1 ? `x${item.quantity}` : 'gồm'}):</div>
                      <ul className="react-cart-bundle-list">
                        {bundleItems.map((bItem, idx) => (
                          <li key={idx} className="react-cart-bundle-item">
                            <span className="react-cart-bundle-name">↳ {bItem.name} {bItem.volume ? `(${bItem.volume})` : ''}</span>
                            <span className="react-cart-bundle-price">0₫</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button type="button" className="react-cart-remove" onClick={() => removeItem(item.productId)} aria-label={`Xóa ${product?.name || 'sản phẩm'}`}>
                  Xóa
                </button>
              </article>
            );
          })}
        </div>

        {!!items.length && (
          <footer className="react-cart-footer">
            <div className="react-cart-footer-top">
              <button type="button" className="react-cart-clear" onClick={clearCart}>Xóa tất cả</button>
            </div>

            {/* Khối Nhập Mã Giảm Giá & Gợi Ý Voucher 1-Chạm */}
            <div className="react-cart-voucher-section">
              <div className="react-cart-voucher-header">
                <span className="react-cart-voucher-title">🎟️ Mã ưu đãi / Voucher</span>
              </div>

              {!appliedCoupon ? (
                <>
                  <div className="react-cart-voucher-input-row">
                    <input
                      type="text"
                      className="react-cart-voucher-input"
                      placeholder="Nhập mã giảm giá…"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyVoucher();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="react-cart-voucher-btn"
                      disabled={!voucherInput.trim()}
                      onClick={() => handleApplyVoucher()}
                    >
                      Áp dụng
                    </button>
                  </div>

                  {couponError && (
                    <p className="react-cart-voucher-error" role="alert">
                      ⚠️ {couponError}
                    </p>
                  )}

                  {/* Kho Voucher Khả Dụng - 1 Chạm Áp Dụng Ngay */}
                  <div className="react-cart-voucher-chips">
                    <span className="react-cart-voucher-chips-label">Gợi ý mã:</span>
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        type="button"
                        className="react-cart-voucher-chip"
                        onClick={() => handleApplyVoucher(coupon.code)}
                        title={coupon.description}
                      >
                        <strong>{coupon.code}</strong>
                        <span>({coupon.tag})</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="react-cart-voucher-applied-box">
                  <div className="react-cart-voucher-applied-info">
                    <span className="react-cart-voucher-tag">✓ {appliedCoupon.code}</span>
                    <small>{appliedCoupon.description}</small>
                  </div>
                  <button
                    type="button"
                    className="react-cart-voucher-remove-btn"
                    onClick={removeCoupon}
                    aria-label="Bỏ mã giảm giá"
                  >
                    Bỏ mã ✕
                  </button>
                </div>
              )}
            </div>

            {/* Bảng Chi Tiết Giá & Khấu Trừ Minh Bạch */}
            <div className="react-cart-summary-breakdown">
              <div className="react-cart-fee-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="react-cart-fee-row is-discount">
                  <span>Giảm giá voucher</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="react-cart-fee-row">
                <span>Phí vận chuyển dự kiến</span>
                <span>{effectiveShippingFee === 0 ? <strong className="text-emerald-600">Miễn phí</strong> : formatPrice(effectiveShippingFee)}</span>
              </div>

              <div className="react-cart-fee-row is-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(calculatedTotal)}</strong>
              </div>
            </div>

            {checkoutError && <p className="react-cart-error" role="alert">{checkoutError}</p>}

            <button type="button" className="react-cart-checkout" disabled={isPreparing || !isHydrated} onClick={startCheckout}>
              {isPreparing ? 'Đang chuẩn bị…' : `Tiến hành thanh toán · ${formatPrice(calculatedTotal)}`}
            </button>
            <small>Đảm bảo 100% chính hãng · Đổi trả trong 7 ngày</small>
          </footer>
        )}
      </aside>
    </div>
  );
}
