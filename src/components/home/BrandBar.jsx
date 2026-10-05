import { assetUrl } from '../../assets/index.js';

export default function BrandBar() {
  return (
    <section id="brand-bar" className="brand-tabs" aria-label="Thương hiệu đồng hành">
      <div className="container brand-tabs-grid">
        <button className="brand-tab brand-tab--ai is-active" type="button" data-brand-tab="AI" data-active-slide="0" aria-pressed="true">
          <strong className="brand-tab-wordmark brand-tab-wordmark--ai">AI SKINID</strong>
          <span><b>Soi da thông minh</b><small>Phân tích cá nhân hóa</small></span>
        </button>
        <button className="brand-tab" type="button" data-brand-tab="RILASTIL" data-active-slide="1" aria-pressed="false">
          <strong className="brand-tab-wordmark">RILASTIL</strong>
          <span><b>Dược mỹ phẩm từ Ý</b><small>46 sản phẩm</small></span>
        </button>
        <button className="brand-tab" type="button" data-brand-tab="TWON" data-active-slide="2" aria-pressed="false">
          <img src={assetUrl('/images/brands/twon.png')} alt="TWON" />
          <span><b>Chăm sóc cơ thể</b><small>3 sản phẩm</small></span>
        </button>
        <button className="brand-tab" type="button" data-brand-tab="DVAH" data-active-slide="3" aria-pressed="false">
          <strong className="brand-tab-wordmark brand-tab-wordmark--dvah">D'VAH</strong>
          <span><b>Nước hoa cá nhân</b><small>5 sản phẩm</small></span>
        </button>
      </div>
    </section>
  );
}
