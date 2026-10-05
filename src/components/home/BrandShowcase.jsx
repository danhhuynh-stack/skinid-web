import { useRef } from 'react';
import { assetUrl } from '../../assets/index.js';
import useMotionAwareVisibility from '../../hooks/useMotionAwareVisibility.js';

export default function BrandShowcase() {
  const sectionRef = useRef(null);
  const isVisible = useMotionAwareVisibility(sectionRef, { threshold: 0.14 });

  return (
    <>
<section id="brands" ref={sectionRef} className={`section home-anchor-scene brand-shop ${isVisible ? 'is-visible' : ''}`}>
  <div className="container">
    <div className="section-heading brand-reveal brand-reveal--heading">
      <div>
        <span className="section-kicker skinid-editorial-kicker">TUYỂN CHỌN BỞI SKINID</span>
        <h2 className="skinid-editorial-title skinid-editorial-title--brands">Ba thế giới. <em>Một chuẩn chăm sóc.</em></h2>
        <p>Từ dược mỹ phẩm đến hương thơm cá nhân — mỗi thương hiệu mang một cảm xúc riêng.</p>
      </div>
    </div>

    <div className="brand-cards">
      <button className="brand-card brand-card--rilastil brand-reveal" type="button" data-brand="Rilastil" aria-label="Khám phá sản phẩm Rilastil">
        <span className="brand-card-media">
          <img src={assetUrl('/images/products/rilastil/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif')} alt="Tinh chất chăm sóc da Rilastil" loading="lazy" />
        </span>
        <span className="brand-card-copy">
          <small>DƯỢC MỸ PHẨM TỪ Ý</small>
          <span className="brand-card-mark"><span className="brand-card-wordmark brand-card-wordmark--rilastil" aria-label="Rilastil">RILASTIL</span></span>
          <p>Chăm sóc da chuyên sâu, từ làm sạch đến chống nắng.</p>
          <b>Khám phá bộ sưu tập <i data-feather="arrow-right"></i></b>
        </span>
      </button>

      <button className="brand-card brand-card--twon brand-reveal" type="button" data-brand="TWON" aria-label="Khám phá sản phẩm TWON">
        <span className="brand-card-media">
          <img src={assetUrl('/images/products/twon/twon-body-lotion-cutout.png')} alt="Kem dưỡng thể TWON" loading="lazy" />
        </span>
        <span className="brand-card-copy">
          <small>CHĂM SÓC CƠ THỂ</small>
          <span className="brand-card-mark"><img className="brand-card-logo brand-card-logo--twon" src={assetUrl('/images/brands/twon.png')} alt="TWON" loading="lazy" /></span>
          <p>Chăm sóc cơ thể mềm mịn cùng trải nghiệm hương thơm dễ chịu.</p>
          <b>Khám phá bộ sưu tập <i data-feather="arrow-right"></i></b>
        </span>
      </button>

      <button className="brand-card brand-card--dvah brand-reveal" type="button" data-brand="DVAH" aria-label="Khám phá sản phẩm D'VAH">
        <span className="brand-card-media">
          <img src={assetUrl('/images/products/dvah/dvah-kamal-cutout.png')} alt="Nước hoa D'VAH Kamal" loading="lazy" />
        </span>
        <span className="brand-card-copy">
          <small>NƯỚC HOA CÁ NHÂN</small>
          <span className="brand-card-mark"><img className="brand-card-logo brand-card-logo--dvah" src={assetUrl('/images/brands/dvah.png')} alt="D'VAH" loading="lazy" /></span>
          <p>Nước hoa nhỏ gọn, dễ mang theo và dễ chọn theo cá tính.</p>
          <b>Khám phá bộ sưu tập <i data-feather="arrow-right"></i></b>
        </span>
      </button>
    </div>
  </div>
</section>
    </>
  );
}
