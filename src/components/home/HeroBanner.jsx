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
              <h2 className="leading-[1.05]">Hiểu làn da trước khi chọn sản phẩm</h2>
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

        <article className="hero-slide hero-slide--products" data-slide="1">
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">RILASTIL · DƯỢC MỸ PHẨM TỪ Ý</span>
              <h1 className="leading-[1.05]">Dịu dàng với da.<br />Yêu thương chính mình.</h1>
              <p>Sản phẩm rõ nguồn gốc, thông tin đầy đủ và phân loại dễ tìm theo từng nhu cầu.</p>
              <div className="hero-actions">
                <a className="btn btn--primary" href="/products">Mua sắm ngay</a>
                <a className="btn btn--secondary" href="/products">Xem danh mục</a>
              </div>
            </div>
            <div className="slide-product-stage">
              <div className="stage-copy"><b>Routine được yêu thích</b><span>Giảm đến 16%</span></div>
              <div className="stage-podium" aria-hidden="true"><span></span><span></span><span></span></div>
              <img className="stage-product stage-product--a" src={assetUrl('/images/products/rilastil/rilastil-kem-chong-nang-cap-am-water-touch-rilastil-sun-system-water-touch-moisturizing-fluid-spf-50-50ml.png')} alt="Kem chống nắng Rilastil" />
              <img className="stage-product stage-product--b" src={assetUrl('/images/products/rilastil/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif')} alt="Serum Rilastil" />
              <img className="stage-product stage-product--c" src={assetUrl('/images/products/rilastil/rilastil-kem-duong-am-giup-can-bang-vi-sinh-ho-tro-phuc-hoi-da-mun-rilastil-acnestil-h-biome-cream.png')} alt="Kem dưỡng Rilastil" />
            </div>
          </div>
        </article>

        <article className="hero-slide hero-slide--body" data-slide="2">
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">TWON · BODY RITUAL</span>
              <h2 className="leading-[1.05]">Chăm sóc cơ thể.<br />Nâng niu mỗi ngày</h2>
              <p>Routine dưỡng thể mềm mịn và lưu hương nhẹ nhàng cho trải nghiệm chăm sóc trọn vẹn.</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="TWON">Mua TWON</button>
              </div>
            </div>
            <div className="body-product-stage">
              <div className="editorial-orbit editorial-orbit--large" aria-hidden="true"></div>
              <div className="editorial-orbit editorial-orbit--small" aria-hidden="true"></div>
              <div className="body-stage-copy"><small>BODY RITUAL</small><b>Chăm sóc dịu dàng mỗi ngày</b></div>
              <div className="body-stage-podium" aria-hidden="true"><span></span><span></span><span></span></div>
              <div className="editorial-products">
                <img src={assetUrl('/images/products/twon/twon-body-lotion.png')} alt="Dưỡng thể TWON" />
                <img src={assetUrl('/images/products/twon/twon-sua-tam.png')} alt="Sữa tắm TWON" />
                <img src={assetUrl('/images/products/twon/twon-kem-u-trang.png')} alt="Kem ủ trắng TWON" />
              </div>
            </div>
          </div>
        </article>

        <article className="hero-slide hero-slide--fragrance" data-slide="3">
          <div className="hero-slide-inner">
            <div className="hero-slide-copy">
              <span className="hero-label">D'VAH · SIGNATURE SCENT</span>
              <h2 className="leading-[1.05]">Chạm vào hương.<br />Lưu lại dấu ấn</h2>
              <p>Năm cá tính hương thơm nhỏ gọn, dễ mang theo và đủ khác biệt để kể câu chuyện riêng.</p>
              <div className="hero-actions">
                <button className="btn btn--primary" type="button" data-hero-brand="DVAH">Khám phá D'VAH</button>
              </div>
            </div>
            <div className="fragrance-stage">
              <div className="fragrance-halo" aria-hidden="true"></div>
              <div className="fragrance-caption"><small>EAU DE PARFUM</small><b>Bộ sưu tập 10ml</b></div>
              <div className="fragrance-podium" aria-hidden="true"></div>
              <img className="fragrance-product fragrance-product--left" src={assetUrl('/images/products/dvah/dvah-rakta.png')} alt="Nước hoa D'VAH Rakta" />
              <img className="fragrance-product fragrance-product--main" src={assetUrl('/images/products/dvah/dvah-kamal.png')} alt="Nước hoa D'VAH Kamal" />
              <img className="fragrance-product fragrance-product--right" src={assetUrl('/images/products/dvah/dvah-sarika.png')} alt="Nước hoa D'VAH Sarika" />
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
