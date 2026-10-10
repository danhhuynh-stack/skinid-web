import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import {
  createShippingAddress,
  fetchVietnamWards,
  vietnamProvinces
} from '../../../shared/services/vietnamAddressService.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../context/CartContext.jsx';
import { calculateShippingFee, createOrder, FREE_SHIPPING_THRESHOLD } from '../services/checkoutService.js';
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
    items, subtotal, isCheckoutOpen, closeCheckout, completeCheckout
  } = useCart();
  const [form, setForm] = useState(() => formFromUser(user));
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const attemptIdRef = useRef('');
  const isSubmittingRef = useRef(false);
  const closeButtonRef = useRef(null);
  const shippingFee = useMemo(() => calculateShippingFee(subtotal), [subtotal]);
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
      setIsSubmitting(true);
      const result = await createOrder({
        idempotencyKey: attemptIdRef.current,
        customer: { name, phone, shippingAddress },
        note: form.note,
        paymentMethod,
        items
      });
      completeCheckout();
      await refreshSession().catch(() => undefined);
      const shortId = String(result.orderId || '').slice(0, 8).toUpperCase();
      const finalTotal = Number(result.total) || (subtotal + shippingFee);

      setCreatedOrder({
        orderId: result.orderId,
        shortId,
        customer: { name, phone, address: shippingAddress.fullAddress, shippingAddress },
        total: finalTotal,
        paymentMethod,
        items
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
                      onChange={(event) => {
                        setError('');
                        setForm((current) => ({ ...current, provinceCode: event.target.value, wardCode: '' }));
                      }}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {vietnamProvinces.map((province) => (
                        <option key={province.code} value={province.code}>{province.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Phường / Xã *</span>
                    <select
                      required
                      value={form.wardCode}
                      onChange={update('wardCode')}
                      disabled={!form.provinceCode || isLoadingWards}
                    >
                      <option value="">
                        {isLoadingWards ? 'Đang tải phường/xã…' : form.provinceCode ? 'Chọn phường/xã' : 'Chọn tỉnh/thành trước'}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="react-checkout-wide">
                    <span>Địa chỉ chi tiết *</span>
                    <input
                      required
                      value={form.line1}
                      onChange={update('line1')}
                      autoComplete="street-address"
                      placeholder="Số nhà, tên tòa nhà, tên đường…"
                    />
                  </label>
                  <p className="react-checkout-address-note">Địa chỉ được lưu bảo mật trong tài khoản để tự động điền cho lần mua sau.</p>
                  <label className="react-checkout-wide">
                    <span>Ghi chú đơn hàng</span>
                    <textarea rows="2" maxLength="1000" value={form.note} onChange={update('note')} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao…" />
                  </label>
                </div>
              </section>

              <fieldset className="react-checkout-payment">
                <legend>
                  <span>2</span> Phương thức thanh toán
                </legend>
                <div className="react-checkout-payment-options">
                  <label className={`react-checkout-payment-option ${paymentMethod === 'cod' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span>
                      <b>Thanh toán khi nhận hàng (COD)</b>
                      <small>Thanh toán bằng tiền mặt sau khi nhận và kiểm tra kiện hàng.</small>
                    </span>
                  </label>

                  <label className={`react-checkout-payment-option ${paymentMethod === 'bank_transfer' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                    />
                    <span>
                      <b>
                        Chuyển khoản ngân hàng (VietQR)
                        <span className="react-checkout-payment-badge">Mã QR</span>
                      </b>
                      <small>Quét mã QR tiện lợi qua ứng dụng ngân hàng hoặc ví điện tử.</small>
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
                    return (
                      <div className="react-checkout-mini-item" key={item.productId}>
                        <img
                          src={assetUrl(product?.image || '/images/products/placeholder.jpg', product?.brandSlug)}
                          alt={product?.name || 'Sản phẩm'}
                          className="react-checkout-mini-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = assetUrl('/images/products/placeholder.jpg');
                          }}
                        />
                        <div className="react-checkout-mini-info">
                          <p title={product?.name}>{product?.name || item.productId}</p>
                          <small>SL: {item.quantity} × {formatPrice(itemPrice)}</small>
                        </div>
                        <span className="react-checkout-mini-price">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="react-checkout-fee-rows">
                  <div className="react-checkout-fee-row">
                    <span>Tạm tính</span>
                    <b>{formatPrice(subtotal)}</b>
                  </div>
                  <div className="react-checkout-fee-row">
                    <span>Phí vận chuyển</span>
                    <b>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold">Miễn phí (Freeship)</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </b>
                  </div>
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <small className="text-[11px] text-amber-700">
                      Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được Freeship.
                    </small>
                  )}
                  <div className="react-checkout-fee-row total">
                    <span>Tổng thanh toán</span>
                    <strong>{formatPrice(subtotal + shippingFee)}</strong>
                  </div>
                </div>

                {error && <div className="react-checkout-error" role="alert">{error}</div>}

                <button
                  className="react-checkout-submit"
                  type="submit"
                  disabled={isSubmitting || !items.length}
                >
                  {isSubmitting ? 'Đang tạo đơn…' : 'Xác nhận đặt hàng →'}
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
