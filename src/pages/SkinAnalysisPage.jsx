import { useEffect, useState } from 'react';
import SkincareRoutine from '../components/analysis/SkincareRoutine.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import { useAuth } from '../features/auth/index.js';

export default function SkinAnalysisPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [legacyReady, setLegacyReady] = useState(() => document.documentElement.classList.contains('components-ready'));
  const [pendingStart, setPendingStart] = useState(false);
  const [startMessage, setStartMessage] = useState('');

  usePageMetadata({
    title: 'Soi da AI 3 góc — SkinID.vn',
    description: 'Chụp hoặc tải ba ảnh khuôn mặt để nhận báo cáo tình trạng da và routine chăm sóc tham khảo từ SkinID.vn.',
    bodyClass: 'scan-page-body'
  });
  useLegacyApplication('analysis');

  useEffect(() => {
    const ready = () => setLegacyReady(true);
    document.addEventListener('skinid:ready', ready);
    if (document.documentElement.classList.contains('components-ready')) ready();
    return () => document.removeEventListener('skinid:ready', ready);
  }, []);

  const openPrivacyStep = () => {
    if (typeof window.openPrivacyModal === 'function') {
      window.openPrivacyModal();
      return true;
    }
    const modal = document.getElementById('privacy-modal');
    const content = document.getElementById('privacy-modal-content');
    if (!modal) return false;
    modal.classList.remove('hidden', 'opacity-0');
    modal.classList.add('flex', 'opacity-100');
    content?.classList.remove('scale-95');
    content?.classList.add('scale-100');
    return true;
  };

  const beginScan = () => {
    setPendingStart(true);
    setStartMessage('');
    if (legacyReady && openPrivacyStep()) {
      setPendingStart(false);
    } else {
      setStartMessage('Trình soi da đang khởi tạo, vui lòng thử lại sau giây lát.');
    }
  };

  useEffect(() => {
    if (!pendingStart || !legacyReady) return;
    if (openPrivacyStep()) {
      setPendingStart(false);
      setStartMessage('');
    }
  }, [legacyReady, pendingStart]);

  return (
    <>
      <OfferBar />
      <Header />
      <main className="scan-page-main">
        <section className="scan-page-welcome" id="scan-start">
          <div className="container scan-page-welcome__grid">
            <div className="scan-page-welcome__copy">
              <a className="scan-page-back" href="/"><i data-feather="arrow-left"></i> Quay lại mua sắm</a>
              <span className="section-kicker">TIỆN ÍCH HỖ TRỢ CHỌN SẢN PHẨM</span>
              <h1 className="scan-welcome-title"><span className="scan-welcome-title__line">Soi da theo</span>{' '}<span className="scan-welcome-title__line scan-welcome-title__accent">ba góc chụp</span></h1>
              <p>Chụp chính diện và hai góc nghiêng để nhận báo cáo tình trạng da cùng routine tham khảo. Bạn cũng có thể tải ảnh có sẵn nếu thiết bị không cấp quyền camera.</p>
              <div className="scan-page-actions">
                <button className="btn btn--primary" type="button" onClick={beginScan} disabled={!legacyReady}><i data-feather="camera"></i> {legacyReady ? 'Bắt đầu soi da' : 'Đang khởi tạo…'}</button>
                <a className="btn btn--outline" href="/products">Xem sản phẩm</a>
              </div>
              {startMessage && <p className="scan-start-message" role="status">{startMessage}</p>}
              <small>Kết quả mang tính tham khảo và không thay thế chẩn đoán của bác sĩ da liễu.</small>
            </div>
            <div className="scan-page-guide" aria-label="Quy trình soi da">
              <span><b>01</b><strong>Chính diện</strong><em>Giữ mặt thẳng, đủ sáng</em></span>
              <span><b>02</b><strong>Nghiêng trái 45°</strong><em>Giữ khuôn mặt trong khung</em></span>
              <span><b>03</b><strong>Nghiêng phải 45°</strong><em>Hoàn tất rồi tạo báo cáo</em></span>
            </div>
          </div>
        </section>
        <SkincareRoutine />
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
