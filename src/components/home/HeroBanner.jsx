import { useEffect, useState } from 'react';
import { assetUrl } from '../../assets/index.js';
import { openConsultationDialog } from '../../shared/events/storefrontDialogs.js';
import { fetchHomePageBlocks } from '../../features/content/index.js';

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchHomePageBlocks().then(data => {
      if (mounted && Array.isArray(data?.banners)) {
        const now = new Date().toISOString();
        const activeBanners = data.banners.filter(b => {
          if (b.active === false) return false;
          if (b.startAt && b.startAt > now) return false;
          if (b.endAt && b.endAt < now) return false;
          return true;
        });
        if (activeBanners.length > 0) setBanners(activeBanners);
      }
    });

    const onUpdate = (e) => {
      if (Array.isArray(e.detail?.blocks?.banners)) {
        setBanners(e.detail.blocks.banners.filter(b => b.active !== false));
      }
    };
    window.addEventListener('skinid:home-blocks-updated', onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('skinid:home-blocks-updated', onUpdate);
    };
  }, []);

  const b0 = banners[0] || {};
  const b1 = banners[1] || {};
  const b2 = banners[2] || {};
  const b3 = banners[3] || {};

  return (
    <section className="hero-carousel-section">
      <div id="hero-carousel" className="hero-carousel" aria-roledescription="carousel" aria-label="Ưu đãi và tiện ích nổi bật">
        {/* Slide 0: Soi da AI */}
        <article className="hero-slide hero-slide--scan is-active" data-slide="0">
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">{b0.label || 'TIỆN ÍCH SOI DA AI'}</span>
              <h2 className="leading-[1.05]">
                {b0.title || <>Hiểu <span className="hero-copy-accent">làn da</span> trước khi chọn sản phẩm</>}
              </h2>
              <p>{b0.subtitle || 'Chụp ảnh khuôn mặt theo hướng dẫn để tham khảo tình trạng da và tìm nhanh nhóm sản phẩm phù hợp.'}</p>
              <div className="hero-actions">
                <a className="btn btn--ai-primary" href={b0.ctaLink || '/skin-analysis'}>
                  <i data-feather="camera"></i> {b0.ctaText || 'Bắt đầu soi da'}
                </a>
                <button className="btn btn--secondary" type="button" onClick={openConsultationDialog}>Tư vấn nhanh</button>
              </div>
              <small>Kết quả mang tính tham khảo, không thay thế chẩn đoán y khoa.</small>
            </div>
            <div className="scan-banner-media">
              <picture>
                {b0.mobileImage && <source media="(max-width: 768px)" srcSet={assetUrl(b0.mobileImage)} />}
                <img src={assetUrl(b0.desktopImage || '/images/banners/hero-scan-ai.jpg')} alt={b0.alt || 'Minh họa tính năng soi da AI SkinID'} />
              </picture>
            </div>
          </div>
        </article>

        {/* Slide 1: Rilastil */}
        <article className="hero-slide hero-slide--products" data-slide="1" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">{b1.label || 'RILASTIL · DƯỢC MỸ PHẨM TỪ Ý'}</span>
              <h1 className="leading-[1.05]">
                {b1.title || <>Dịu dàng<br />với da.<br /><span className="hero-copy-accent">Yêu thương<br />chính mình.</span></>}
              </h1>
              <p>{b1.subtitle || 'Sản phẩm rõ nguồn gốc, thông tin đầy đủ và phân loại dễ tìm theo từng nhu cầu.'}</p>
              <div className="hero-actions">
                <a className="btn btn--primary" href={b1.ctaLink || '/products'}>{b1.ctaText || 'Mua sắm ngay'}</a>
                <a className="btn btn--secondary" href="/products">Xem danh mục</a>
              </div>
            </div>
            <div className="hero-brand-banner">
              <picture>
                {b1.mobileImage && <source media="(max-width: 768px)" srcSet={assetUrl(b1.mobileImage)} />}
                <img src={assetUrl(b1.desktopImage || '/images/banners/Rilastil_banner.png')} alt={b1.alt || 'Bộ sản phẩm Rilastil trên bục kính giữa nền xanh dịu'} />
              </picture>
              <div className="hero-banner-caption"><b>Routine được yêu thích</b><strong>Giảm 10%</strong></div>
            </div>
          </div>
        </article>

        {/* Slide 2: TWON */}
        <article className="hero-slide hero-slide--body" data-slide="2" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">{b2.label || 'TWON · BODY RITUAL'}</span>
              <h2 className="leading-[1.05]">
                {b2.title || <>Chăm sóc<br />cơ thể.<br /><span className="hero-copy-accent">Nâng niu mỗi<br />ngày</span></>}
              </h2>
              <p>{b2.subtitle || 'Routine dưỡng thể mềm mịn và lưu hương nhẹ nhàng cho trải nghiệm chăm sóc trọn vẹn.'}</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="TWON">
                  {b2.ctaText || 'Mua TWON'} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <div className="hero-brand-banner">
              <picture>
                {b2.mobileImage && <source media="(max-width: 768px)" srcSet={assetUrl(b2.mobileImage)} />}
                <img src={assetUrl(b2.desktopImage || '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png')} alt={b2.alt || 'Bộ sản phẩm TWON giữa hoa anh đào và nền hồng'} />
              </picture>
              <div className="hero-banner-caption"><small>BODY RITUAL</small><b>Chăm sóc dịu dàng mỗi ngày</b></div>
            </div>
          </div>
        </article>

        {/* Slide 3: D'VAH */}
        <article className="hero-slide hero-slide--fragrance" data-slide="3" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">{b3.label || "D'VAH · SIGNATURE SCENT"}</span>
              <h2 className="leading-[1.05]">
                {b3.title || <>Chạm vào<br />hương.<br /><span className="hero-copy-accent">Lưu lại dấu ấn</span></>}
              </h2>
              <p>{b3.subtitle || 'Năm cá tính hương thơm nhỏ gọn, dễ mang theo và đủ khác biệt để kể câu chuyện riêng.'}</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="DVAH">{b3.ctaText || "Khám phá D'VAH"}</button>
              </div>
            </div>
            <div className="hero-brand-banner">
              <picture>
                {b3.mobileImage && <source media="(max-width: 768px)" srcSet={assetUrl(b3.mobileImage)} />}
                <img src={assetUrl(b3.desktopImage || '/images/banners/Dvah_banner.png')} alt={b3.alt || 'Bộ nước hoa D’VAH cùng hoa hồng, hoa sen và hoa anh đào'} />
              </picture>
              <div className="hero-banner-caption"><small>EAU DE PARFUM</small><b>Bộ sưu tập 10ml</b></div>
            </div>
          </div>
        </article>

        <div className="hero-carousel-controls">
          <button className="carousel-arrow carousel-arrow--prev" type="button" data-carousel-prev aria-label="Banner trước"><i data-feather="chevron-left"></i></button>
          <button className="carousel-arrow carousel-arrow--next" type="button" data-carousel-next aria-label="Banner tiếp theo"><i data-feather="chevron-right"></i></button>
          <div className="carousel-dots" role="tablist" aria-label="Chọn banner">
            <button className="is-active" type="button" data-carousel-dot="0" aria-label="Banner 1"></button>
            <button type="button" data-carousel-dot="1" aria-label="Banner 2"></button>
            <button type="button" data-carousel-dot="2" aria-label="Banner 3"></button>
            <button type="button" data-carousel-dot="3" aria-label="Banner 4"></button>
          </div>
        </div>
      </div>
    </section>
  );
}
