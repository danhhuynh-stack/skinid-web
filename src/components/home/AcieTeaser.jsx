import { useRef } from 'react';
import { assetUrl } from '../../assets/index.js';
import useMotionAwareVisibility from '../../hooks/useMotionAwareVisibility.js';
import { openConsultationDialog } from '../../shared/events/storefrontDialogs.js';
import AcieFeatureGrid from '../acie/AcieFeatureGrid.jsx';

export default function AcieTeaser() {
  const sectionRef = useRef(null);
  const isVisible = useMotionAwareVisibility(sectionRef, { threshold: 0.18 });

  return (
    <section
      id="acie-teaser"
      ref={sectionRef}
      className={`section home-anchor-scene acie-home borderless-acie-section ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="container acie-home-grid acie-home-panel">
        <span className="acie-panel-orb acie-panel-orb--one" aria-hidden="true"></span>
        <span className="acie-panel-orb acie-panel-orb--two" aria-hidden="true"></span>
        <div className="acie-home-copy">
          {/* Bước 1: Cụm chữ nhỏ mờ dần hiện lên (Fade-in) */}
          <span className="section-kicker skinid-editorial-kicker acie-anim-item acie-anim-tagline">
            SKINID • ACIE • SẮP RA MẮT
          </span>

          {/* Bước 2: Tiêu đề lớn từ từ trượt từ dưới lên 15px và rõ dần */}
          <h2 className="skinid-editorial-title skinid-editorial-title--acie acie-anim-item acie-anim-heading">
            Một người bạn nhỏ. <em>Thấu hiểu làn da.</em>
          </h2>

          {/* Bước 3: Đoạn văn bản mô tả tiếp tục trượt lên */}
          <p className="acie-anim-item acie-anim-desc">
            Gặp gỡ “con bọ” soi da ACIE — một cách mới để bắt đầu hành trình chăm sóc riêng mình với công nghệ thị giác vi điểm AI tiên tiến.
          </p>

          {/* Bước 4: Nút bấm xuất hiện & bừng sáng bóng đổ hồng sau khi hạ cánh */}
          <div className="acie-home-actions acie-anim-item acie-anim-actions">
            <a className="btn btn--primary btn--pill acie-cta-btn" href="/acie">
              <span>Khám phá ACIE</span>
              <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
            <button
              className="btn btn--outline btn--pill acie-secondary-btn"
              type="button"
              onClick={openConsultationDialog}
            >
              <span>Đăng ký tại Store</span>
            </button>
          </div>
          <AcieFeatureGrid className="acie-anim-item acie-anim-actions" />
        </div>

        {/* Bước 4: Thiết bị ACIE lơ lửng & Aura phát sáng bừng lên chậm hơn 0.2s */}
        <div className="acie-home-media acie-anim-item acie-anim-media">
          <div className="acie-glow-aura" aria-hidden="true"></div>
          <a href="/acie" aria-label="Khám phá thiết bị soi da ACIE" className="acie-home-media-wrap acie-float-device">
            <img src={assetUrl('/images/acie/acie-device-front.png')} alt="Thiết bị soi da ACIE" loading="lazy" />
          </a>
        </div>
      </div>
    </section>
  );
}
