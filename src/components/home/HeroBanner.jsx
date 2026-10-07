import { assetUrl } from '../../assets/index.js';
import { openConsultationDialog } from '../../shared/events/storefrontDialogs.js';

export default function HeroBanner() {
  return (
    <section className="hero-carousel-section">
      <div id="hero-carousel" className="hero-carousel" aria-roledescription="carousel" aria-label="Ưu đãi và tiện ích nổi bật">
        <article className="hero-slide hero-slide--scan is-active" data-slide="0">
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">TIỆN ÍCH SOI DA AI</span>
              <h2 className="leading-[1.05]">Hiểu <span className="hero-copy-accent">làn da</span> trước khi chọn sản phẩm</h2>
              <p>Chụp ảnh khuôn mặt theo hướng dẫn để tham khảo tình trạng da và tìm nhanh nhóm sản phẩm phù hợp.</p>
              <div className="hero-actions">
                <a className="btn btn--ai-primary" href="/skin-analysis"><i data-feather="camera"></i> Bắt đầu soi da</a>
                <button className="btn btn--secondary" type="button" onClick={openConsultationDialog}>Tư vấn nhanh</button>
              </div>
              <small>Kết quả mang tính tham khảo, không thay thế chẩn đoán y khoa.</small>
            </div>
            <div className="scan-banner-media"><img src={assetUrl('/images/banners/hero-scan-ai.jpg')} alt="Minh họa tính năng soi da AI SkinID" /></div>
          </div>
        </article>

        <article className="hero-slide hero-slide--products" data-slide="1" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">RILASTIL · DƯỢC MỸ PHẨM TỪ Ý</span>
              <h1 className="leading-[1.05]">Dịu dàng<br />với da.<br /><span className="hero-copy-accent">Yêu thương<br />chính mình.</span></h1>
              <p>Sản phẩm rõ nguồn gốc, thông tin đầy đủ và phân loại dễ tìm theo từng nhu cầu.</p>
              <div className="hero-actions">
                <a className="btn btn--primary" href="/products">Mua sắm ngay</a>
                <a className="btn btn--secondary" href="/products">Xem danh mục</a>
              </div>
            </div>
            <div className="hero-brand-banner">
              <img src={assetUrl('/images/banners/Rilastil_banner.png')} alt="Bộ sản phẩm Rilastil trên bục kính giữa nền xanh dịu" />
              <div className="hero-banner-caption"><b>Routine được yêu thích</b><strong>Giảm 10%</strong></div>
            </div>
          </div>
        </article>

        <article className="hero-slide hero-slide--body" data-slide="2" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">TWON · BODY RITUAL</span>
              <h2 className="leading-[1.05]">Chăm sóc<br />cơ thể.<br /><span className="hero-copy-accent">Nâng niu mỗi<br />ngày</span></h2>
              <p>Routine dưỡng thể mềm mịn và lưu hương nhẹ nhàng cho trải nghiệm chăm sóc trọn vẹn.</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="TWON">Mua TWON <span aria-hidden="true">→</span></button>
              </div>
            </div>
            <div className="hero-brand-banner">
              <img src={assetUrl('/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png')} alt="Bộ sản phẩm TWON giữa hoa anh đào và nền hồng" />
              <div className="hero-banner-caption"><small>BODY RITUAL</small><b>Chăm sóc dịu dàng mỗi ngày</b></div>
            </div>
          </div>
        </article>

        <article className="hero-slide hero-slide--fragrance" data-slide="3" data-brand-banner>
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">D'VAH · SIGNATURE SCENT</span>
              <h2 className="leading-[1.05]">Chạm vào<br />hương.<br /><span className="hero-copy-accent">Lưu lại dấu ấn</span></h2>
              <p>Năm cá tính hương thơm nhỏ gọn, dễ mang theo và đủ khác biệt để kể câu chuyện riêng.</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="DVAH">Khám phá D'VAH</button>
              </div>
            </div>
            <div className="hero-brand-banner">
              <img src={assetUrl('/images/banners/Dvah_banner.png')} alt="Bộ nước hoa D’VAH cùng hoa hồng, hoa sen và hoa anh đào" />
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
