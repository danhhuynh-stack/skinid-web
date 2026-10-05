import { assetUrl } from '../../assets/index.js';

export default function CategorySection() {
  return (
    <>
<section id="categories" className="section section--compact">
  <div className="container">
    <div className="section-heading">
      <div><span className="section-kicker">MUA SẮM NHANH</span><h2>Chọn theo danh mục</h2><p>Tìm đúng nhóm sản phẩm chỉ với một lần chọn.</p></div>
      <a href="#catalog">Xem tất cả <i data-feather="arrow-right"></i></a>
    </div>
    <div className="category-grid">
      <button type="button" className="category-item" data-step="cleanser"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-sua-rua-mat-duong-am-rilastil-aqua-face-cleanser-50ml.avif')} alt="" /></span><span className="category-copy"><small>01</small><b>Làm sạch</b><em>Sữa rửa mặt & Tẩy trang</em></span><i data-feather="arrow-up-right"></i></button>
      <button type="button" className="category-item" data-step="toner"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-nuoc-hoa-hong-danh-cho-moi-loai-da-200ml-rilastil-daily-care-rebalancing-soothing-toner-200ml.avif')} alt="" /></span><span className="category-copy"><small>02</small><b>Cân bằng</b><em>Toner & Lotion</em></span><i data-feather="arrow-up-right"></i></button>
      <button type="button" className="category-item" data-step="treatment"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif')} alt="" /></span><span className="category-copy"><small>03</small><b>Đặc trị</b><em>Serum & Tinh chất</em></span><i data-feather="arrow-up-right"></i></button>
      <button type="button" className="category-item" data-step="moisturizer"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-kem-duong-am-giup-can-bang-vi-sinh-ho-tro-phuc-hoi-da-mun-rilastil-acnestil-h-biome-cream.png')} alt="" /></span><span className="category-copy"><small>04</small><b>Dưỡng ẩm</b><em>Kem dưỡng & Mặt nạ</em></span><i data-feather="arrow-up-right"></i></button>
      <button type="button" className="category-item" data-step="sunscreen"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-kem-chong-nang-cap-am-water-touch-rilastil-sun-system-water-touch-moisturizing-fluid-spf-50-50ml.png')} alt="" /></span><span className="category-copy"><small>05</small><b>Chống nắng</b><em>SPF 50+ bảo vệ</em></span><i data-feather="arrow-up-right"></i></button>
      <button type="button" className="category-item category-item--body" data-step="special"><span className="category-art"><img src={assetUrl('/images/products/rilastil/rilastil-xit-co-the-danh-cho-da-mun-150ml-rilastil-acnestil-body-spray-150ml.avif')} alt="" /></span><span className="category-copy"><small>06</small><b>Cơ thể & nước hoa</b><em>Body care & Fragrance</em></span><i data-feather="arrow-up-right"></i></button>
    </div>
  </div>
</section>
    </>
  );
}
