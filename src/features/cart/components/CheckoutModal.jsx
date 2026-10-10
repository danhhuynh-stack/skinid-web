import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import {
  createShippingAddress,
  fetchVietnamWards,
  vietnamProvinces
} from '../../../shared/services/vietnamAddressService.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../context/CartContext.jsx';
import { calculateShippingFee, createOrder } from '../services/checkoutService.js';
import { BANK_CONFIG } from '../../../config/bankConfig.js';
import VietQrPaymentModal from './VietQrPaymentModal.jsx';
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

      if (paymentMethod === 'bank_transfer') {
        setCreatedOrder({
          orderId: result.orderId,
          shortId,
          total: finalTotal
        });
      } else {
        globalThis.location.assign(`/profile?tab=orders&placed=${encodeURIComponent(shortId)}`);
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể tạo đơn hàng. Vui lòng thử lại; hệ thống sẽ không tạo đơn trùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishBankTransfer = () => {
    if (!createdOrder) return;
    const shortId = createdOrder.shortId;
    setCreatedOrder(null);
    closeCheckout();
    globalThis.location.assign(`/profile?tab=orders&placed=${encodeURIComponent(shortId)}`);
  };

  return (
    <>
      <div className={`react-checkout-layer ${isCheckoutOpen && !createdOrder ? 'is-open' : ''}`} aria-hidden={!isCheckoutOpen || Boolean(createdOrder)}>
        <div className="react-checkout-backdrop" />
        <form className="react-checkout-panel" onSubmit={submit} aria-labelledby="react-checkout-title">
          <header className="react-checkout-heading">
            <div>
              <span>THANH TOÁN AN TOÀN</span>
              <h2 id="react-checkout-title">Thông tin nhận hàng</h2>
              <p>Kiểm tra thông tin trước khi xác nhận đơn.</p>
            </div>
            <button ref={closeButtonRef} type="button" onClick={closeCheckout} disabled={isSubmitting} aria-label="Đóng thanh toán">×</button>
          </header>

          <div className="react-checkout-grid">
            <label><span>Họ và tên *</span><input required value={form.name} onChange={update('name')} autoComplete="name" /></label>
            <label><span>Số điện thoại *</span><input required type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" /></label>
            <label><span>Tỉnh / Thành phố *</span><select required value={form.provinceCode} onChange={(event) => { setError(''); setForm((current) => ({ ...current, provinceCode: event.target.value, wardCode: '' })); }}><option value="">Chọn tỉnh/thành</option>{vietnamProvinces.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}</select></label>
            <label><span>Phường / Xã *</span><select required value={form.wardCode} onChange={update('wardCode')} disabled={!form.provinceCode || isLoadingWards}><option value="">{isLoadingWards ? 'Đang tải phường/xã…' : form.provinceCode ? 'Chọn phường/xã' : 'Chọn tỉnh/thành trước'}</option>{wards.map((ward) => <option key={ward.code} value={ward.code}>{ward.name}</option>)}</select></label>
            <label className="react-checkout-wide"><span>Địa chỉ chi tiết *</span><input required value={form.line1} onChange={update('line1')} autoComplete="street-address" placeholder="Số nhà, tên đường, tòa nhà…" /></label>
            <p className="react-checkout-address-note">Địa chỉ được lưu an toàn trong tài khoản để tự động điền cho lần mua sau.</p>
            <label className="react-checkout-wide"><span>Ghi chú</span><textarea rows="2" maxLength="1000" value={form.note} onChange={update('note')} /></label>
          </div>

          <fieldset className="react-checkout-payment">
            <legend>Phương thức thanh toán</legend>
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
                  <small>Chỉ thanh toán sau khi nhận và kiểm tra kiện hàng.</small>
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
                    Chuyển khoản VietQR (MB Bank)
                    <span className="react-checkout-payment-badge">Xử lý nhanh</span>
                  </b>
                  <small>Quét mã VietQR 24/7 bằng mọi ứng dụng ngân hàng hoặc ví điện tử.</small>
                </span>
              </label>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="react-checkout-bank-preview">
                <div className="flex items-center justify-between">
                  <strong>MB Bank – {BANK_CONFIG.accountName}</strong>
                  <span className="font-mono font-bold text-brand-primary">{BANK_CONFIG.accountNumber}</span>
                </div>
                <p>Mã VietQR tự động điền số tiền và nội dung sẽ xuất hiện ngay sau khi bạn bấm xác nhận đặt hàng.</p>
              </div>
            )}
          </fieldset>

          <div className="react-checkout-summary">
            <div><span>Tạm tính</span><b>{formatPrice(subtotal)}</b></div>
            <div><span>Phí giao hàng</span><b>{shippingFee ? formatPrice(shippingFee) : 'Miễn phí'}</b></div>
            <div><span>Tổng thanh toán</span><strong>{formatPrice(subtotal + shippingFee)}</strong></div>
          </div>
          {error && <div className="react-checkout-error" role="alert">{error}</div>}
          <button className="react-checkout-submit" type="submit" disabled={isSubmitting || !items.length}>
            {isSubmitting ? 'Đang tạo đơn…' : paymentMethod === 'bank_transfer' ? 'Tiếp tục thanh toán VietQR' : 'Xác nhận đặt hàng'}
          </button>
        </form>
      </div>

      {createdOrder && (
        <VietQrPaymentModal
          isOpen={Boolean(createdOrder)}
          orderId={createdOrder.orderId}
          amount={createdOrder.total}
          onClose={handleFinishBankTransfer}
          onFinish={handleFinishBankTransfer}
        />
      )}
    </>
  );
}
