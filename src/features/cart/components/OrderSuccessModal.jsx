import { useState } from 'react';
import {
  BANK_CONFIG,
  copyToClipboard,
  getOrderShortCode,
  getTransferDescription,
  getVietQrUrl,
  launch1TapPayment
} from '../../../config/bankConfig.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import './OrderSuccessModal.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function OrderSuccessModal({
  isOpen = false,
  order = null,
  onClose,
  onContinueShopping,
  onViewOrders
}) {
  const [toastMessage, setToastMessage] = useState('');
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  useBodyScrollLock(isOpen, 'order-success');

  if (!isOpen || !order) return null;

  const shortId = getOrderShortCode(order.orderId || order.id);
  const transferDesc = getTransferDescription(order.orderId || order.id);
  const qrUrl = getVietQrUrl({ amount: order.total, orderId: order.orderId || order.id });
  const isBankTransfer = order.paymentMethod === 'bank_transfer';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? '' : c)), 2200);
  };

  const handleCopy = async (text, fieldName, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      showToast(`Đã sao chép ${label || fieldName}!`);
      setTimeout(() => setCopiedField(''), 2000);
    } else {
      showToast('Không thể sao chép tự động.');
    }
  };

  const handle1TapPay = async (customScheme = '') => {
    showToast('Đang sao chép thông tin & mở ứng dụng ngân hàng…');
    try {
      await launch1TapPayment({
        amount: order.total,
        orderId: order.orderId || order.id,
        targetScheme: customScheme
      });
    } catch {
      showToast('Không thể mở app trực tiếp.');
    }
  };

  const handleDownloadQr = async () => {
    try {
      showToast('Đang tải ảnh mã QR...');
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `vietqr-vietcombank-${shortId || 'order'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast('Đã lưu mã QR vào máy!');
    } catch {
      window.open(qrUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`order-success-layer ${isOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="order-success-title">
      <div className="order-success-backdrop" onClick={onClose} />
      <div className="order-success-panel">
        <header className="order-success-header">
          <div className="order-success-icon-wrap" aria-hidden="true">✓</div>
          <h2 id="order-success-title" className="order-success-title">Đặt Hàng Thành Công!</h2>
          <div className="order-success-code-row">
            <span>Mã đơn:</span>
            <strong>#{shortId}</strong>
            <button
              type="button"
              className="order-success-copy-code"
              onClick={() => handleCopy(shortId, 'code', 'mã đơn')}
            >
              {copiedField === 'code' ? '✓ Đã chép' : 'Sao chép'}
            </button>
          </div>
        </header>

        {/* Timeline tiến trình */}
        <div className="order-success-timeline" role="region" aria-label="Tiến trình giao hàng">
          <div className="order-success-timeline-track" aria-hidden="true">
            <div className="order-success-timeline-fill" />
          </div>
          <div className="order-success-step active">
            <span className="order-success-step-badge" aria-label="Bước 1: Đã tiếp nhận">✓</span>
            <div className="order-success-step-text">
              <strong>Đã tiếp nhận</strong>
              <small>Hệ thống ghi nhận</small>
            </div>
          </div>
          <div className="order-success-step next">
            <span className="order-success-step-badge" aria-label="Bước 2: Chuẩn bị hàng">2</span>
            <div className="order-success-step-text">
              <strong>Chuẩn bị hàng</strong>
              <small>Kiểm tra & đóng gói</small>
            </div>
          </div>
          <div className="order-success-step">
            <span className="order-success-step-badge" aria-label="Bước 3: Giao hàng">3</span>
            <div className="order-success-step-text">
              <strong>Giao hàng</strong>
              <small>2 – 3 ngày làm việc</small>
            </div>
          </div>
        </div>

        {/* Khối Thanh Toán Chuyển Khoản Sang Trọng */}
        {isBankTransfer && (
          <div className="order-success-bank-card">
            <div className="order-success-bank-card-header">
              <span className="order-success-bank-badge">Thanh toán VietQR (Vietcombank)</span>
              <span className="order-success-bank-status">Chờ thanh toán</span>
            </div>

            <div className="order-success-bank-amount-box">
              <span className="order-success-bank-amount-label">Số tiền cần chuyển</span>
              <strong className="order-success-bank-amount-value">{formatPrice(order.total)}</strong>
            </div>

            <div className="order-success-bank-fields">
              <div
                className="order-success-bank-field"
                onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk', 'STK')}
                role="button"
                tabIndex={0}
              >
                <div>
                  <small>Vietcombank (STK)</small>
                  <b className="font-mono">{BANK_CONFIG.accountNumber}</b>
                  <span className="order-success-holder-name">{BANK_CONFIG.accountName}</span>
                </div>
                <button type="button" className="order-success-copy-pill">
                  {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>

              <div
                className="order-success-bank-field highlight"
                onClick={() => handleCopy(transferDesc, 'desc', 'nội dung chuyển khoản')}
                role="button"
                tabIndex={0}
              >
                <div>
                  <small>Nội dung chuyển khoản (bắt buộc)</small>
                  <b className="font-mono text-brand-primary">{transferDesc}</b>
                </div>
                <button type="button" className="order-success-copy-pill">
                  {copiedField === 'desc' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="order-success-bank-ctas">
              <button
                type="button"
                onClick={() => handle1TapPay()}
                className="order-success-1tap-btn"
                title="Mở ứng dụng ngân hàng tự động điền sẵn thông tin"
              >
                <span>⚡</span>
                <span>Mở App Ngân Hàng Thanh Toán</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrPreview((v) => !v)}
                className="order-success-qr-toggle-btn"
              >
                {showQrPreview ? 'Ẩn mã QR ▲' : 'Xem mã VietQR ▼'}
              </button>
            </div>

            {showQrPreview && (
              <div className="order-success-qr-reveal">
                <img src={qrUrl} alt="Mã VietQR" className="order-success-qr-img" />
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="order-success-qr-download"
                >
                  ↓ Lưu mã QR về máy
                </button>
              </div>
            )}
          </div>
        )}

        {/* Thông tin biên nhận đơn hàng */}
        <div className="order-success-receipt">
          <div className="order-success-receipt-row">
            <span>Người nhận</span>
            <strong>{order.customer?.name} ({order.customer?.phone})</strong>
          </div>
          <div className="order-success-receipt-row">
            <span>Địa chỉ giao hàng</span>
            <strong>{order.customer?.address || order.customer?.shippingAddress?.fullAddress}</strong>
          </div>
          <div className="order-success-receipt-row">
            <span>Phương thức thanh toán</span>
            <strong>{isBankTransfer ? 'Chuyển khoản VietQR (Vietcombank)' : 'Thanh toán khi nhận hàng (COD)'}</strong>
          </div>
          <div className="order-success-receipt-row total">
            <span>Tổng thanh toán</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>

        <div className="order-success-actions">
          <button
            type="button"
            className="order-success-btn-primary"
            onClick={onViewOrders}
          >
            Theo dõi đơn trong Tài khoản →
          </button>
          <button
            type="button"
            className="order-success-btn-secondary"
            onClick={onContinueShopping}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="vietqr-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
