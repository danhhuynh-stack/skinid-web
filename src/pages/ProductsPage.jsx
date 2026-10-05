import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import ProductCatalog from '../features/catalog/ProductCatalog.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function ProductsPage() {
  usePageMetadata({ title: 'Tất cả sản phẩm — SkinID.vn', description: 'Khám phá mỹ phẩm chính hãng. Tìm sản phẩm theo thương hiệu, danh mục và nhu cầu làn da tại SkinID.' });
  return <><OfferBar /><Header /><main className="products-page"><div className="container catalog-intro"><nav className="catalog-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>Sản phẩm</span></nav><div className="catalog-intro__content"><h1>Chăm sóc theo <span>cách của bạn.</span></h1><p>Khám phá dược mỹ phẩm từ Rilastil, TWON và D'VAH dành riêng cho làn da của bạn.</p></div></div><ProductCatalog /></main><Footer /><MobileNav /><StorefrontModals /><ProductDetailModal /></>;
}
