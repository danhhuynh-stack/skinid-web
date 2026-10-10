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
  useBodyScrollLock(isOpen, 'order-success');

  if (!isOpen || !order) return null;

  const shortId = getOrderShortCode(order.orderId || order.id);
  const transferDesc = getTransferDescription(order.orderId || order.id);
  const qrUrl = getVietQrUrl({ amount: order.total, orderId: order.orderId || order.id });
  const isBankTransfer = order.paymentMethod === 'bank_transfer';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? '' : c)), 2400);
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

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) showToast(`Đã sao chép ${label}!`);
    else showToast('Không thể sao chép tự động.');
  };

  const handleDownloadQr = async () => {
    try {
      showToast('Đang tải ảnh mã QR...');
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `vietqr-skinid-${shortId || 'order'}.png`;
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
            <button type="button" className="order-success-copy-code" onClick={() => handleCopy(shortId, 'mã đơn')}>
              Sao chép
            </button>
          </div>
        </header>

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

        {isBankTransfer && (
          <div className="mb-5 p-4 rounded-2xl bg-brand-blush/30 border border-brand-primary/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-primary/10">
              <span className="text-xs font-black text-brand-primary uppercase tracking-wider">Thanh toán VietQR (Vietcombank)</span>
              <span className="text-[11px] font-bold text-gray-500">Chờ chuyển khoản</span>
            </div>

            {/* Nút 1-Tap Mobile App Pay */}
            <button
              type="button"
              onClick={() => handle1TapPay()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-left">
                  <span className="block font-black">Mở App Ngân Hàng Thanh Toán (1 Chạm)</span>
                  <span className="block text-[11px] font-normal opacity-90">Tự động nạp STK VCB, số tiền & nội dung đơn</span>
                </span>
              </span>
              <span className="text-sm font-black">→</span>
            </button>

            <div className="grid sm:grid-cols-2 gap-4 items-center pt-1">
              <div className="flex flex-col items-center gap-2">
                <img src={qrUrl} alt="Mã VietQR" className="w-44 h-44 rounded-xl bg-white p-1 border border-gray-200 shadow-sm object-contain" />
                <button type="button" onClick={handleDownloadQr} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                  ↓ Lưu mã QR về máy
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                  <div><span className="text-[11px] text-gray-400 block">Số tiền cần chuyển</span><b className="text-sm font-black text-brand-primary">{formatPrice(order.total)}</b></div>
                  <button type="button" onClick={() => handleCopy(Math.round(order.total), 'số tiền')} className="text-[11px] font-bold text-brand-primary px-2 py-1 rounded bg-brand-blush/50">Chép</button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                  <div><span className="text-[11px] text-gray-400 block">Vietcombank (STK)</span><b className="font-mono">{BANK_CONFIG.accountNumber}</b></div>
                  <button type="button" onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'STK')} className="text-[11px] font-bold text-brand-primary px-2 py-1 rounded bg-brand-blush/50">Chép</button>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                  <div><span className="text-[11px] text-gray-400 block">Nội dung CK</span><b className="font-mono text-brand-primary">{transferDesc}</b></div>
                  <button type="button" onClick={() => handleCopy(transferDesc, 'nội dung')} className="text-[11px] font-bold text-brand-primary px-2 py-1 rounded bg-brand-blush/50">Chép</button>
                </div>
                <p className="text-[10px] text-amber-700 leading-tight">Giữ nguyên nội dung chuyển khoản để đơn hàng được xác nhận tự động.</p>
              </div>
            </div>
          </div>
        )}

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
