import { useEffect, useState } from 'react';
import {
  BANK_CONFIG,
  POPULAR_BANK_APPS,
  copyToClipboard,
  getOrderShortCode,
  getTransferDescription,
  getVietQrUrl,
  isMobileBrowser,
  launch1TapPayment
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
  const [activeTab, setActiveTab] = useState(() => (isMobileBrowser() ? 'app' : 'qr'));
  const [copiedField, setCopiedField] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const shortId = getOrderShortCode(orderId);
  const transferDesc = getTransferDescription(orderId);
  const qrUrl = getVietQrUrl({ amount, orderId });

  useBodyScrollLock(isOpen, 'vietqr-modal');

  useEffect(() => {
    if (!isOpen) return undefined;
    setActiveTab(isMobileBrowser() ? 'app' : 'qr');
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
    }, 2400);
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
    showToast('Đang sao chép thông tin & chuyển sang app ngân hàng…');
    try {
      await launch1TapPayment({
        amount,
        orderId,
        targetScheme: customScheme
      });
    } catch {
      showToast('Không thể mở app. Vui lòng quét mã QR hoặc chép STK.');
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

  if (!isOpen) return null;

  return (
    <div className={`vietqr-modal-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} role="dialog" aria-modal="true" aria-labelledby="vietqr-title">
      <div className="vietqr-modal-backdrop" onClick={onClose} />
      <div className="vietqr-modal-panel">
        <header className="vietqr-modal-header">
          <div>
            <span className="vietqr-modal-tag">Thanh Toán An Toàn · Vietcombank</span>
            <h2 id="vietqr-title" className="vietqr-modal-title">Chuyển Khoản Đơn Hàng</h2>
            <p className="vietqr-modal-subtitle">Đơn #{shortId} · Vietcombank Nam Sài Gòn</p>
          </div>
          <button type="button" className="vietqr-modal-close" onClick={onClose} aria-label="Đóng bảng mã QR">×</button>
        </header>

        {/* Hero Amount Display */}
        <div className="vietqr-hero-card">
          <div className="vietqr-hero-amount-block">
            <span className="vietqr-hero-label">Số tiền cần thanh toán</span>
            <strong className="vietqr-hero-value">{formatPrice(amount)}</strong>
          </div>
          <button
            type="button"
            className="vietqr-hero-copy-amount"
            onClick={() => handleCopy(Math.round(amount), 'amount', 'số tiền')}
          >
            {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
          </button>
        </div>

        {/* Segmented Control / Tab Switcher */}
        <div className="vietqr-segmented-control" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'app'}
            className={`vietqr-segment-btn ${activeTab === 'app' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('app')}
          >
            <span className="vietqr-tab-icon">⚡</span>
            <span>Mở App Ngân Hàng</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'qr'}
            className={`vietqr-segment-btn ${activeTab === 'qr' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <span className="vietqr-tab-icon">📷</span>
            <span>Mã QR Vietcombank</span>
          </button>
        </div>

        {/* Tab 1: Mở App Ngân Hàng 1-Chạm */}
        {activeTab === 'app' && (
          <div className="vietqr-tab-content">
            <div className="vietqr-1tap-section">
              <button
                type="button"
                className="vietqr-1tap-main-btn"
                onClick={() => handle1TapPay()}
                title="Mở ứng dụng ngân hàng tự động điền sẵn STK, số tiền và nội dung"
              >
                <div className="vietqr-1tap-text-group">
                  <span className="vietqr-1tap-badge">Tự Động Nạp Dữ Liệu</span>
                  <strong>Mở App Ngân Hàng Thanh Toán</strong>
                  <small>Tự điền STK Vietcombank, đúng số tiền & nội dung</small>
                </div>
                <span className="vietqr-1tap-arrow">→</span>
              </button>

              <div className="vietqr-app-selector">
                <span className="vietqr-app-selector-label">Hoặc chọn nhanh ứng dụng cài trên máy:</span>
                <div className="vietqr-app-badges">
                  {POPULAR_BANK_APPS.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className="vietqr-app-badge-btn"
                      onClick={() => handle1TapPay(app.appScheme)}
                      title={app.note}
                    >
                      <span className="vietqr-bank-code">{app.code}</span>
                      <span className="vietqr-bank-name">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mã QR Vietcombank */}
        {activeTab === 'qr' && (
          <div className="vietqr-tab-content">
            <div className="vietqr-code-box">
              <div className="vietqr-img-wrapper">
                <img
                  src={qrUrl}
                  alt={`Mã VietQR thanh toán cho đơn hàng ${shortId}`}
                  className="vietqr-img"
                  loading="eager"
                />
              </div>
              <button
                type="button"
                className="vietqr-btn-download"
                onClick={handleDownloadQr}
                title="Lưu ảnh để quét từ thư viện app ngân hàng"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Lưu mã QR vào máy
              </button>
            </div>
          </div>
        )}

        {/* Thông tin Chuyển Khoản Dạng Capsule Tinh Gọn */}
        <div className="vietqr-capsules-group">
          <div
            className="vietqr-capsule"
            onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'stk', 'STK')}
            role="button"
            tabIndex={0}
            title="Bấm để sao chép số tài khoản"
          >
            <div className="vietqr-capsule-meta">
              <span className="vietqr-capsule-label">Số tài khoản (Vietcombank)</span>
              <strong className="vietqr-capsule-value font-mono">{BANK_CONFIG.accountNumber}</strong>
              <small className="vietqr-capsule-holder">{BANK_CONFIG.accountName}</small>
            </div>
            <span className={`vietqr-capsule-btn ${copiedField === 'stk' ? 'is-copied' : ''}`}>
              {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
            </span>
          </div>

          <div
            className="vietqr-capsule highlight"
            onClick={() => handleCopy(transferDesc, 'desc', 'nội dung chuyển khoản')}
            role="button"
            tabIndex={0}
            title="Bấm để sao chép nội dung chuyển khoản"
          >
            <div className="vietqr-capsule-meta">
              <span className="vietqr-capsule-label">Nội dung chuyển khoản (bắt buộc)</span>
              <strong className="vietqr-capsule-value font-mono text-brand-primary">{transferDesc}</strong>
            </div>
            <span className={`vietqr-capsule-btn ${copiedField === 'desc' ? 'is-copied' : ''}`}>
              {copiedField === 'desc' ? '✓ Đã chép' : 'Sao chép'}
            </span>
          </div>
        </div>

        <p className="vietqr-subtle-hint">
          Đơn hàng được hệ thống kiểm tra và cập nhật tự động sau khi nhận được chuyển khoản.
        </p>

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
