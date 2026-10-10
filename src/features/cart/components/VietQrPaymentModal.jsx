import { useEffect, useState } from 'react';
import {
  BANK_CONFIG,
  copyToClipboard,
  getOrderShortCode,
  getTransferDescription,
  getVietQrUrl
} from '../../../config/bankConfig.js';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock.js';
import './VietQrPaymentModal.css';

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function VietQrPaymentModal({
  isOpen = false,
  onClose,
  orderId = '',
  amount = 0,
  onFinish
}) {
  const [toastMessage, setToastMessage] = useState('');
  const shortId = getOrderShortCode(orderId);
  const transferDesc = getTransferDescription(orderId);
  const qrUrl = getVietQrUrl({ amount, orderId });

  useBodyScrollLock(isOpen, 'vietqr-modal');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? '' : current));
    }, 2200);
  };

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast(`Đã sao chép ${label}!`);
    } else {
      showToast('Không thể sao chép tự động. Vui lòng chọn và chép thủ công.');
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
      link.download = `vietqr-skinid-${shortId || 'order'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast('Đã lưu mã QR vào máy!');
    } catch {
      // Fallback: Open in new tab so user can long-press save
      window.open(qrUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`vietqr-modal-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} role="dialog" aria-modal="true" aria-labelledby="vietqr-title">
      <div className="vietqr-modal-backdrop" onClick={onClose} />
      <div className="vietqr-modal-panel">
        <header className="vietqr-modal-header">
          <div>
            <span className="vietqr-modal-tag">Thanh Toán An Toàn · MB Bank</span>
            <h2 id="vietqr-title" className="vietqr-modal-title">Quét Mã VietQR</h2>
            <p className="vietqr-modal-subtitle">Sử dụng App ngân hàng hoặc ví điện tử bất kỳ để quét mã.</p>
          </div>
          <button type="button" className="vietqr-modal-close" onClick={onClose} aria-label="Đóng bảng mã QR">×</button>
        </header>

        <div className="vietqr-modal-body">
          <div className="vietqr-code-box">
            <div className="vietqr-img-wrapper">
              <img src={qrUrl} alt={`Mã VietQR thanh toán cho đơn hàng ${shortId}`} className="vietqr-img" loading="eager" />
            </div>
            <button type="button" className="vietqr-btn-download" onClick={handleDownloadQr} title="Lưu ảnh để quét từ thư viện app ngân hàng">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Lưu mã QR vào máy
            </button>
          </div>

          <div className="vietqr-info-box">
            <div className="vietqr-field-group">
              <div className="vietqr-field-row highlight">
                <div>
                  <span className="vietqr-field-label">Số tiền cần thanh toán</span>
                  <div className="vietqr-field-value amount">{formatPrice(amount)}</div>
                </div>
                <button type="button" className="vietqr-copy-btn" onClick={() => handleCopy(Math.round(amount), 'số tiền')}>
                  Sao chép
                </button>
              </div>

              <div className="vietqr-field-row">
                <div>
                  <span className="vietqr-field-label">Ngân hàng</span>
                  <div className="vietqr-field-value">{BANK_CONFIG.bankName}</div>
                </div>
              </div>

              <div className="vietqr-field-row">
                <div>
                  <span className="vietqr-field-label">Số tài khoản</span>
                  <div className="vietqr-field-value font-mono font-bold">{BANK_CONFIG.accountNumber}</div>
                </div>
                <button type="button" className="vietqr-copy-btn" onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'STK')}>
                  Sao chép
                </button>
              </div>

              <div className="vietqr-field-row">
                <div>
                  <span className="vietqr-field-label">Chủ tài khoản</span>
                  <div className="vietqr-field-value">{BANK_CONFIG.accountName}</div>
                </div>
                <button type="button" className="vietqr-copy-btn" onClick={() => handleCopy(BANK_CONFIG.accountName, 'tên chủ tài khoản')}>
                  Sao chép
                </button>
              </div>

              <div className="vietqr-field-row highlight">
                <div>
                  <span className="vietqr-field-label">Nội dung chuyển khoản</span>
                  <div className="vietqr-field-value font-mono font-bold text-brand-primary">{transferDesc}</div>
                </div>
                <button type="button" className="vietqr-copy-btn" onClick={() => handleCopy(transferDesc, 'nội dung chuyển khoản')}>
                  Sao chép
                </button>
              </div>
            </div>

            <div className="vietqr-warning-note">
              <strong>Lưu ý quan trọng:</strong> Giữ nguyên nội dung chuyển khoản <b>{transferDesc}</b> để hệ thống đối soát và xác nhận đơn hàng nhanh nhất.
            </div>
          </div>
        </div>

        <div className="vietqr-actions">
          <button
            type="button"
            className="vietqr-btn-primary"
            onClick={() => {
              if (onFinish) onFinish();
              else onClose?.();
            }}
          >
            Tôi đã chuyển khoản xong →
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
