import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import {
  createShippingAddress,
  fetchVietnamWards,
  vietnamProvinces
} from '../../../shared/services/vietnamAddressService.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../context/CartContext.jsx';
import { createOrder, FREE_SHIPPING_THRESHOLD, hasNonFreeshipItems } from '../services/checkoutService.js';
import { saveCachedOrder } from '../services/orderCacheService.js';
import { syncOrderToS3 } from '../services/s3SyncService.js';
import { getAvailableCoupons } from '../services/couponService.js';
import { BANK_CONFIG } from '../../../config/bankConfig.js';
import { getProductById } from '../../catalog/index.js';
import { assetUrl } from '../../../assets/index.js';
import VietQrPaymentModal from './VietQrPaymentModal.jsx';
import OrderSuccessModal from './OrderSuccessModal.jsx';
import './CheckoutModal.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

function formFromUser(user) {
  const address = user?.shippingAddress || {};
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    provinceCode: String(address.provinceCode || ''),
    wardCode: String(address.wardCode || ''),
    line1: address.line1 || (!user?.shippingAddress ? user?.address || '' : ''),
    note: ''
  };
}

export default function CheckoutModal() {
  const { user, refreshSession } = useAuth();
  const {
    items, subtotal, isCheckoutOpen, closeCheckout, completeCheckout,
    appliedCoupon, couponDiscount, shippingFee, effectiveShippingFee, calculatedTotal, couponError,
    applyCoupon, removeCoupon
  } = useCart();

  const [form, setForm] = useState(() => formFromUser(user));
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const attemptIdRef = useRef('');
  const isSubmittingRef = useRef(false);
  const closeButtonRef = useRef(null);
  const availableCoupons = getAvailableCoupons();
  const isComboInCart = hasNonFreeshipItems(items);
  const isCouponFreeship = appliedCoupon?.type === 'shipping' || appliedCoupon?.code === 'FREESHIP';

  useBodyScrollLock(isCheckoutOpen && !createdOrder, 'checkout');

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    if (!isCheckoutOpen) return undefined;
    setForm(formFromUser(user));
    setError('');
    setCreatedOrder(null);
    setShowQrModal(false);
    setPaymentMethod('cod');
    setCouponInput('');
    attemptIdRef.current = globalThis.crypto.randomUUID();
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmittingRef.current && !createdOrder) closeCheckout();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeCheckout, createdOrder, isCheckoutOpen, user]);

  useEffect(() => {
    let active = true;
    if (!isCheckoutOpen || !form.provinceCode) {
      setWards([]);
      return undefined;
    }
    setIsLoadingWards(true);
    fetchVietnamWards(form.provinceCode)
      .then((results) => { if (active) setWards(results); })
      .catch(() => {
        if (!active) return;
        const saved = user?.shippingAddress;
        setWards(saved?.wardCode ? [{ code: saved.wardCode, name: saved.wardName || 'Phường/xã đã lưu' }] : []);
      })
      .finally(() => { if (active) setIsLoadingWards(false); });
    return () => { active = false; };
  }, [form.provinceCode, isCheckoutOpen, user?.shippingAddress]);

  const update = (field) => (event) => {
    setError('');
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    applyCoupon(code);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const name = form.name.trim();
    const phone = form.phone.replace(/[\s.-]/g, '');
    try {
      if (name.length < 2) throw new Error('Vui lòng nhập họ và tên người nhận.');
      if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(phone)) {
        throw new Error('Số điện thoại Việt Nam chưa đúng định dạng.');
      }
      const shippingAddress = createShippingAddress({
        line1: form.line1,
        provinceCode: form.provinceCode,
        wardCode: form.wardCode,
        wards
      });
      if (!shippingAddress.provinceCode) throw new Error('Vui lòng nhập đầy đủ địa chỉ nhận hàng.');

      const enrichedItems = items.map((item) => {
        const product = getProductById(item.productId);
        const price = Number(product?.price || item.price || 0);
        const quantity = Math.max(1, Math.trunc(Number(item.quantity) || 1));
        return {
          productId: item.productId,
          sku: product?.productCode || item.productId,
          name: product?.name || item.productId,
          image: product?.image || '',
          volume: product?.volume || '',
          price,
          quantity,
          lineTotal: price * quantity
        };
      });

      setIsSubmitting(true);
      const result = await createOrder({
        idempotencyKey: attemptIdRef.current,
        customer: { name, phone, shippingAddress },
        note: form.note,
        paymentMethod,
        couponCode: appliedCoupon?.code || '',
        items: enrichedItems
      });
      completeCheckout();
      await refreshSession().catch(() => undefined);
      const shortId = String(result.orderId || '').slice(0, 8).toUpperCase();
      const finalTotal = Number(result.total) || calculatedTotal;

      // Resilient real-time sync directly to S3 POS
      syncOrderToS3({
        orderId: result.orderId,
        order: {
          id: result.orderId,
          customer: { name, phone, address: shippingAddress.fullAddress, shippingAddress },
          items: enrichedItems,
          subtotal,
          discountAmount: couponDiscount,
          couponCode: appliedCoupon?.code || '',
          shippingFee: effectiveShippingFee,
          total: finalTotal,
          paymentMethod,
          note: form.note
        }
      }).then((s3Res) => {
        if (s3Res?.success) {
          console.log('[SkinID S3 Sync] Synced successfully to S3 POS:', s3Res.s3OrderId);
          if (user?.uid) {
            saveCachedOrder(user.uid, {
              id: result.orderId,
              s3SyncStatus: 'synced',
              s3OrderId: s3Res.s3OrderId,
              s3SyncedAt: new Date().toISOString()
            });
          }
        } else {
          console.warn('[SkinID S3 Sync] S3 sync pending:', s3Res?.error);
        }
      }).catch((s3Err) => {
        console.warn('[SkinID S3 Sync] Background error:', s3Err?.message);
      });

      setCreatedOrder({
        orderId: result.orderId,
        shortId,
        customer: { name, phone, address: shippingAddress.fullAddress, shippingAddress },
        total: finalTotal,
        paymentMethod,
        items: enrichedItems
      });
    } catch (requestError) {
      setError(requestError.message || 'Không thể tạo đơn hàng. Vui lòng thử lại; hệ thống sẽ không tạo đơn trùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (!createdOrder) return;
    const shortId = createdOrder.shortId;
    setCreatedOrder(null);
    closeCheckout();
    globalThis.location.assign(`/profile?tab=orders&placed=${encodeURIComponent(shortId)}`);
  };

  const handleContinueShopping = () => {
    setCreatedOrder(null);
    closeCheckout();
    globalThis.location.assign('/products');
  };

  return (
    <>
      <div className={`react-checkout-layer ${isCheckoutOpen && !createdOrder ? 'is-open' : ''}`} aria-hidden={!isCheckoutOpen || Boolean(createdOrder)}>
        <div className="react-checkout-backdrop" onClick={closeCheckout} />
        <form className="react-checkout-panel" onSubmit={submit} aria-labelledby="react-checkout-title">
          <header className="react-checkout-heading">
            <div>
              <span>THANH TOÁN AN TOÀN · 100% CHÍNH HÃNG</span>
              <h2 id="react-checkout-title">Xác Nhận Đơn Hàng</h2>
              <p>Vui lòng kiểm tra địa chỉ và chọn phương thức thanh toán phù hợp.</p>
            </div>
            <button ref={closeButtonRef} type="button" onClick={closeCheckout} disabled={isSubmitting} aria-label="Đóng thanh toán">×</button>
          </header>

          <div className="react-checkout-steps">
            <span className="done">1. Giỏ hàng ✓</span>
            <span>→</span>
            <span className="current">2. Nhận hàng & Thanh toán</span>
            <span>→</span>
            <span>3. Hoàn tất</span>
          </div>

          <div className="react-checkout-content-grid">
            {/* Cột trái: Form thông tin & Phương thức thanh toán */}
            <div className="react-checkout-form-col">
              <section>
                <h3 className="react-checkout-section-title">
                  <span>1</span> Thông tin nhận hàng
                </h3>
                <div className="react-checkout-grid">
                  <label>
                    <span>Họ và tên *</span>
                    <input required value={form.name} onChange={update('name')} autoComplete="name" placeholder="Nguyễn Văn A" />
                  </label>
                  <label>
                    <span>Số điện thoại *</span>
                    <input required type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" placeholder="0912 345 678" />
                  </label>
                  <label>
                    <span>Tỉnh / Thành phố *</span>
                    <select
                      required
                      value={form.provinceCode}
                      onChange={(e) => {
                        const nextProvince = e.target.value;
                        setForm((c) => ({ ...c, provinceCode: nextProvince, wardCode: '' }));
                      }}
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {vietnamProvinces.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Phường / Xã *</span>
                    <select
                      required
                      value={form.wardCode}
                      disabled={!form.provinceCode || isLoadingWards}
                      onChange={update('wardCode')}
                    >
                      <option value="">{isLoadingWards ? 'Đang tải phường/xã…' : 'Chọn Phường / Xã'}</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="react-checkout-full-field">
                  <span>Địa chỉ chi tiết (Số nhà, tên đường…) *</span>
                  <input required value={form.line1} onChange={update('line1')} autoComplete="street-address" placeholder="Ví dụ: 123 Lê Lợi, Phường Bến Nghé" />
                </label>
                <label className="react-checkout-full-field">
                  <span>Ghi chú đơn hàng (Tùy chọn)</span>
                  <textarea rows={2} value={form.note} onChange={update('note')} placeholder="Lời dặn cho shipper (giờ giao hàng, chỉ dẫn…)" />
                </label>
              </section>

              <fieldset className="react-checkout-payment-section">
                <legend className="react-checkout-section-title">
                  <span>2</span> Phương thức thanh toán
                </legend>
                <div className="react-checkout-payment-options">
                  <label className={`react-checkout-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="react-checkout-payment-icon">💵</div>
                    <div className="react-checkout-payment-info">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <small>Thanh toán tiền mặt cho shipper khi nhận và kiểm tra hàng.</small>
                    </div>
                  </label>

                  <label className={`react-checkout-payment-option ${paymentMethod === 'vietqr' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vietqr"
                      checked={paymentMethod === 'vietqr'}
                      onChange={() => setPaymentMethod('vietqr')}
                    />
                    <div className="react-checkout-payment-icon">📱</div>
                    <div className="react-checkout-payment-info">
                      <strong>Chuyển khoản VietQR tức thì</strong>
                      <small>Quét mã QR qua app ngân hàng hoặc MoMo. Tự động xác nhận.</small>
                    </div>
                    <span className="react-checkout-badge-fast">
                      Khuyên dùng
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng & Nút Submit */}
            <div className="react-checkout-summary-col">
              <div className="react-checkout-summary-box">
                <div className="react-checkout-summary-title">
                  <span>Mặt hàng trong đơn ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <small className="text-gray-400 font-normal">{items.length} món</small>
                </div>

                <div className="react-checkout-summary-items">
                  {items.map((item) => {
                    const product = getProductById(item.productId);
                    const itemPrice = Number(product?.price) || 0;
                    const bundleItems = Array.isArray(product?.bundleItems) ? product.bundleItems : [];
                    return (
                      <div className="react-checkout-mini-item" key={item.productId}>
                        <img
                          src={assetUrl(product?.image || '/images/products/placeholder.jpg', product?.brandSlug)}
                          alt={product?.name || 'Sản phẩm'}
                          className="react-checkout-mini-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f8f9fa" width="100" height="100"/><text fill="%23ced4da" font-size="12" font-family="sans-serif" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">SkinID</text></svg>';
                          }}
                        />
                        <div className="react-checkout-mini-info">
                          <p title={product?.name}>{product?.name || item.productId}</p>
                          <small>SL: {item.quantity} × {formatPrice(itemPrice)}</small>
                          {bundleItems.length > 0 && (
                            <div className="react-checkout-bundle-breakdown">
                              <span className="react-checkout-bundle-title">🎁 Gồm các món 0₫:</span>
                              {bundleItems.map((bItem, idx) => (
                                <div key={idx} className="react-checkout-bundle-subitem">
                                  <span className="react-checkout-bundle-subname">↳ {bItem.name} {bItem.volume ? '(' + bItem.volume + ')' : ''}</span>
                                  <span className="react-checkout-bundle-subprice">0₫</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="react-checkout-mini-price">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Khối Mã Giảm Giá trong Checkout */}
                <div className="react-checkout-coupon">
                  <div className="react-checkout-coupon-title">
                    <span>Mã giảm giá / Voucher</span>
                  </div>
                  {!appliedCoupon ? (
                    <>
                      <div className="react-checkout-coupon-input-group">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Nhập mã ưu đãi…"
                          className="react-checkout-coupon-input"
                          aria-label="Mã giảm giá"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="react-checkout-coupon-btn"
                          disabled={!couponInput.trim()}
                        >
                          Áp dụng
                        </button>
                      </div>

                      {/* Gợi ý mã 1 chạm */}
                      <div className="react-checkout-coupon-suggestions">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            className="react-checkout-coupon-chip"
                            onClick={() => handleApplyCoupon(c.code)}
                            title={c.description}
                          >
                            <strong>{c.code}</strong>: {c.description}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="react-checkout-coupon-applied">
                      <div className="react-checkout-coupon-badge">
                        <span className="react-checkout-coupon-tag">✓ {appliedCoupon.code}</span>
                        <small className="react-checkout-coupon-desc">{appliedCoupon.description}</small>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="react-checkout-coupon-remove"
                        title="Bỏ mã giảm giá"
                        aria-label="Bỏ mã giảm giá"
                      >
                        Bỏ mã ✕
                      </button>
                    </div>
                  )}
                  {couponError && <p className="react-checkout-coupon-error">⚠️ {couponError}</p>}
                </div>

                {/* Bảng kê chi phí thanh toán */}
                <div className="react-checkout-fee-rows">
                  <div className="react-checkout-fee-row">
                    <span>Tạm tính</span>
                    <b>{formatPrice(subtotal)}</b>
                  </div>
                  {appliedCoupon && (
                    <div className="react-checkout-fee-row discount">
                      <span>Mã giảm giá ({appliedCoupon.code})</span>
                      <b className="text-emerald-700 font-bold">
                        {isCouponFreeship ? 'Miễn phí ship' : `−${formatPrice(couponDiscount)}`}
                      </b>
                    </div>
                  )}
                  <div className="react-checkout-fee-row">
                    <span>Phí vận chuyển</span>
                    <b>
                      {effectiveShippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {isCouponFreeship ? 'Miễn phí (Voucher)' : 'Miễn phí (Freeship)'}
                        </span>
                      ) : (
                        formatPrice(effectiveShippingFee)
                      )}
                    </b>
                  </div>
                  {isComboInCart ? (
                    <small className="text-[11px] text-amber-700 font-medium">
                      ℹ️ Gói Combo ưu đãi đặc biệt áp dụng phí ship chuẩn 30.000₫.
                    </small>
                  ) : subtotal < FREE_SHIPPING_THRESHOLD && !isCouponFreeship ? (
                    <small className="text-[11px] text-amber-700">
                      Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được Freeship.
                    </small>
                  ) : null}
                  <div className="react-checkout-fee-row total">
                    <span>Tổng thanh toán</span>
                    <strong>{formatPrice(calculatedTotal)}</strong>
                  </div>
                </div>

                {error && <div className="react-checkout-error" role="alert">{error}</div>}

                <button
                  className="react-checkout-submit"
                  type="submit"
                  disabled={isSubmitting || !items.length}
                >
                  {isSubmitting ? 'Đang tạo đơn…' : `Xác nhận đặt hàng · ${formatPrice(calculatedTotal)} →`}
                </button>

                <div className="react-checkout-guarantees">
                  <span>✓ 100% Sản phẩm chính hãng & hóa đơn đầy đủ</span>
                  <span>✓ Đổi trả miễn phí trong 7 ngày nếu lỗi</span>
                  <span>✓ Kiểm tra hàng trước khi thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {createdOrder && (
        <OrderSuccessModal
          isOpen={Boolean(createdOrder)}
          order={createdOrder}
          onClose={handleFinish}
          onContinueShopping={handleContinueShopping}
          onViewOrders={handleFinish}
        />
      )}

      {showQrModal && createdOrder && (
        <VietQrPaymentModal
          isOpen={showQrModal}
          orderId={createdOrder.orderId}
          amount={createdOrder.total}
          onClose={() => setShowQrModal(false)}
          onFinish={handleFinish}
        />
      )}
    </>
  );
}
