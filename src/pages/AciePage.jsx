import { useRef } from 'react';
import { assetUrl } from '../assets/index.js';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import AcieFeatureGrid from '../components/acie/AcieFeatureGrid.jsx';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import useScrollReveal from '../hooks/useScrollReveal.js';

export default function AciePage() {
  const mainRef = useRef(null);
  useLegacyApplication('acie');
  useScrollReveal(mainRef);
  usePageMetadata({
    title: 'ACIE — Một chạm, hiểu làn da hơn | SkinID.vn',
    description: 'Gặp gỡ ACIE, thiết bị soi da nhỏ gọn sắp có mặt tại SkinID. Khám phá một cách mới để lắng nghe làn da.'
  });

  return (
    <>
      <Header />
      <main ref={mainRef} className="acie-page ambient-page-canvas acie-motion-page scroll-reveal-root" id="acie-landing">
        <section className="container acie-hero">
          <div className="acie-copy">
            <span className="section-kicker skinid-editorial-kicker" data-reveal data-reveal-delay="0">SKINID × ACIE · SẮP RA MẮT</span>
            <h1 className="skinid-editorial-title skinid-editorial-title--acie" data-reveal data-reveal-delay="90">Một chạm nhỏ. <em>Hiểu làn da hơn.</em></h1>
            <p data-reveal data-reveal-delay="180">Gặp gỡ ACIE — “con bọ” soi da nhỏ gọn, mở đầu cho hành trình chăm sóc dành riêng cho bạn.</p>
            <a className="soft-button" href="#acie-discover" data-reveal data-reveal-delay="270">
              <span>Gặp gỡ ACIE</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>
            <AcieFeatureGrid className="acie-page-feature-grid" />
            <small data-reveal data-reveal-delay="340">Một trải nghiệm mới đang đến với SkinID.</small>
          </div>
          <figure className="acie-device" data-reveal="soft-scale" data-reveal-delay="360">
            <span className="acie-orbit" aria-hidden="true" />
            <img src={assetUrl('/images/acie/acie-device-front.png')} alt="Thiết bị soi da ACIE nhỏ gọn" />
            <figcaption>ACIE / Người bạn nhỏ của làn da</figcaption>
          </figure>
        </section>

        <section id="acie-discover" className="acie-story section">
          <div className="container acie-story-grid">
            <div className="acie-lifestyle" data-reveal="soft-scale" data-reveal-delay="0">
              <img src={assetUrl('/images/acie/acie-lifestyle-scan.jpg')} alt="Trải nghiệm soi da với thiết bị ACIE" loading="lazy" />
            </div>
            <div className="acie-story-copy">
              <span className="section-kicker skinid-editorial-kicker" data-reveal data-reveal-delay="70">LẮNG NGHE LÀN DA</span>
              <h2 className="skinid-editorial-title skinid-editorial-title--story" data-reveal data-reveal-delay="140">Chăm da bắt đầu <em>từ sự thấu hiểu.</em></h2>
              <p data-reveal data-reveal-delay="210">ACIE kết hợp thiết bị cảm biến và ứng dụng để bạn khám phá làn da, rồi từng bước tìm cách chăm sóc phù hợp hơn.</p>
              <div className="acie-promises">
                <div data-reveal data-reveal-delay="290"><span>01</span><h3>Nhỏ gọn, gần gũi</h3><p>Một thiết bị vừa trong lòng bàn tay.</p></div>
                <div data-reveal data-reveal-delay="360"><span>02</span><h3>Hiểu thêm về da</h3><p>Khám phá thông tin qua trải nghiệm soi da.</p></div>
                <div data-reveal data-reveal-delay="430"><span>03</span><h3>Chăm sóc riêng mình</h3><p>Thêm cơ sở để lựa chọn cách chăm da.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="acie-invitation section">
          <div className="container">
            <span className="section-kicker skinid-editorial-kicker" data-reveal data-reveal-delay="0">HẸN BẠN MỘT NGÀY GẦN NHẤT</span>
            <h2 className="skinid-editorial-title skinid-editorial-title--invitation" data-reveal data-reveal-delay="90">Điều nhỏ xinh. <em>Dành riêng cho bạn.</em></h2>
            <p data-reveal data-reveal-delay="180">Muốn biết thêm về ACIE? Trò chuyện cùng SkinID để cập nhật thông tin trải nghiệm.</p>
            <a className="soft-button" href="https://zalo.me/0924093461" target="_blank" rel="noopener noreferrer" data-reveal data-reveal-delay="270">
              <span>Hỏi SkinID về ACIE</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
            <small data-reveal data-reveal-delay="340">Thông tin mang tính tham khảo, không thay thế chẩn đoán y khoa.</small>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
    </>
  );
}
