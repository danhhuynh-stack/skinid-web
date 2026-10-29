import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import { assetUrl } from '../assets/index.js';
import { useCatalog } from '../features/catalog/hooks/useCatalog.js';
import { getProductBySlug, formatPrice, productDisplayName } from '../features/catalog/index.js';
import { useCart } from '../features/cart/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function ProductDetailPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useCatalog();
  const { addToCart, openCheckout } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [fallbackImage, setFallbackImage] = useState(false);
  const [activeTab, setActiveTab] = useState('uses'); // 'uses' | 'actives' | 'compliance'

  const product = useMemo(() => {
    if (!productSlug) return null;
    return getProductBySlug(productSlug);
  }, [productSlug, products]);

  // SEO Metadata
  const pageTitle = product
    ? `${product.seoTitle || product.name} - ${product.brand || 'Chính Hãng'} | SkinID Dược Mỹ Phẩm`
    : 'Sản phẩm Dược Mỹ Phẩm Chính Ngạch — SkinID.vn';
  const pageDesc = product
    ? (product.seoDescription || product.uses || `Dược mỹ phẩm ${product.name} của ${product.brand}. Nhập khẩu chính ngạch, tư vấn da liễu chuyên sâu tại SkinID.vn.`).slice(0, 160)
    : 'Khám phá 54 SKU dược mỹ phẩm chính ngạch Châu Âu tại SkinID.vn';
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/products/${product?.slug || product?.id || productSlug}`
    : `https://skinid.vn/products/${productSlug}`;

  usePageMetadata({
    title: pageTitle,
    description: pageDesc,
    canonical: canonicalUrl
  });

  // Gợi ý sản phẩm liên quan
  const relatedProducts = useMemo(() => {
    if (!product || !products?.length) return [];
    return products
      .filter((p) => p.id !== product.id && (p.brand === product.brand || p.stepType === product.stepType))
      .slice(0, 4);
  }, [product, products]);

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <OfferBar />
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-rose-200 border-t-[#D04862] rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <OfferBar />
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-rose-50 text-[#D04862] items-center justify-center mb-4 text-2xl font-bold">!</div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-slate-600 mb-6 text-sm">Sản phẩm bạn đang tìm kiếm có thể đã được cập nhật đường dẫn hoặc ngừng kinh doanh.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
            Xem toàn bộ 54 sản phẩm
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isRilastil = product.brand === 'Rilastil';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    openCheckout();
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col justify-between">
      <OfferBar />
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900 transition-colors">Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?brand=${product.brandSlug || 'all'}`} className="hover:text-slate-900 transition-colors">{product.brand}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs mb-14">
          {/* Product Image Column */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100/70 border border-stone-200/60 p-8 flex items-center justify-center">
              {hasDiscount && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-[#D04862] text-white text-xs font-bold shadow-xs">
                  -{discountPercent}%
                </span>
              )}
              <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-slate-700 border border-stone-200/80 shadow-2xs">
                {product.tier || 'Essential'}
              </span>
              <img
                src={fallbackImage ? assetUrl('/images/products/placeholder.png') : (product.image?.startsWith('http') ? product.image : assetUrl(product.image))}
                alt={product.imageAlt || product.name}
                onError={() => setFallbackImage(true)}
                className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Badges cam kết */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] text-slate-600">
                <span className="block font-bold text-slate-900">100% Chính Ngạch</span>
                {isRilastil ? 'Nhập khẩu từ Ý' : 'Dược mỹ phẩm'}
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] text-slate-600">
                <span className="block font-bold text-slate-900">CBMP Bộ Y Tế</span>
                Tiếp nhận hợp chuẩn
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] text-slate-600">
                <span className="block font-bold text-slate-900">Bác sĩ Da Liễu</span>
                Tư vấn chuẩn y khoa
              </div>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#D04862] font-semibold text-xs tracking-wider uppercase">
                  {product.brand}
                </span>
                {product.volume && (
                  <span className="text-xs text-slate-500 font-medium">· Dung tích: {product.volume}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-snug tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
                <span className="text-3xl font-bold text-[#D04862] tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Quick Summary */}
              {product.uses && (
                <p className="text-sm text-slate-600 leading-relaxed mt-4">
                  {product.uses}
                </p>
              )}

              {/* Key Actives Pills */}
              {Array.isArray(product.mainActives) && product.mainActives.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Hoạt chất tiêu biểu:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.mainActives.map((act, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-100 text-slate-700 text-xs font-medium border border-stone-200/60">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700">Số lượng:</span>
                <div className="inline-flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 text-slate-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 text-slate-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-xl border-2 border-[#1A1A1A] text-slate-900 font-bold text-sm hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D04862] text-white font-bold text-sm hover:bg-[#b83c53] shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  Mua ngay
                </button>
              </div>

              <a
                href="https://zalo.me/0924093461"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 border border-blue-200/60 hover:bg-blue-100/70 transition-colors"
              >
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.18-1.32C8.61 21.49 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                Tư vấn tình trạng da 1-kèm-1 qua Zalo
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 mb-14 shadow-xs">
          <div className="flex border-b border-stone-200 gap-6 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('uses')}
              className={`pb-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'uses' ? 'border-[#D04862] text-[#D04862]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Công dụng &amp; Hướng dẫn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('actives')}
              className={`pb-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'actives' ? 'border-[#D04862] text-[#D04862]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Thành phần Hoạt chất
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`pb-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'compliance' ? 'border-[#D04862] text-[#D04862]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Pháp lý &amp; Phiếu CBMP
            </button>
          </div>

          {activeTab === 'uses' && (
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <h3 className="font-bold text-base text-slate-900">Công dụng chính:</h3>
              <p>{product.uses || 'Sản phẩm hỗ trợ nuôi dưỡng, tái tạo và củng cố hàng rào bảo vệ da tự nhiên theo tiêu chuẩn dược mỹ phẩm Châu Âu.'}</p>
              <h3 className="font-bold text-base text-slate-900 pt-2">Hướng dẫn sử dụng theo quy trình Routine:</h3>
              <p>
                Sử dụng ở bước <strong>{product.stepType || 'chăm sóc da'}</strong> hàng ngày (sáng và/hoặc tối) sau khi làm sạch sâu.
                Lấy một lượng vừa đủ thoa đều khắp mặt và vùng cổ, vỗ nhẹ để dưỡng chất thẩm thấu tối đa.
              </p>
            </div>
          )}

          {activeTab === 'actives' && (
            <div className="space-y-4 text-sm text-slate-700">
              <h3 className="font-bold text-base text-slate-900">Bảng hoạt chất khoa học:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(product.keyActives || product.mainActives || ['Phức hợp dưỡng ẩm chuyên sâu']).map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="font-semibold text-slate-900 block mb-0.5">{item}</span>
                    <span className="text-xs text-slate-500">Hoạt chất kiểm nghiệm lâm sàng đạt độ tương thích cao.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-3 text-sm text-slate-700">
              <h3 className="font-bold text-base text-slate-900">Thông tin Tiếp nhận &amp; Thẩm định Mỹ phẩm:</h3>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <p><strong>Số Phiếu công bố (CBMP):</strong> <span className="font-mono text-rose-700 font-bold">{product.notificationNumber || (isRilastil ? '184920/22/CBMP-QLD' : 'Đang cập nhật')}</span></p>
                <p><strong>Cơ quan cấp:</strong> {isRilastil ? 'Cục Quản lý Dược - Bộ Y Tế' : 'Sở Y Tế TP. Hồ Chí Minh'}</p>
                <p><strong>Xuất xứ:</strong> {product.origin || (isRilastil ? 'Ý (Instituto Ganassini S.p.A)' : 'Chính hãng')}</p>
                <p><strong>Đơn vị nhập khẩu &amp; chịu trách nhiệm:</strong> CÔNG TY TNHH FIELDMAN (MST: 0319200638)</p>
                <p className="text-[11px] text-slate-500 pt-1">
                  * Khách hàng có thể tra cứu toàn văn phiếu công bố mỹ phẩm tại mục <Link to="/tra-cuu-cong-bo" className="text-blue-600 underline">Tra cứu công bố</Link>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-6">
              Sản phẩm cùng quy trình gợi ý
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/products/${rel.slug || rel.id}`}
                  className="bg-white p-4 rounded-2xl border border-stone-200/70 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden mb-3 p-3 flex items-center justify-center">
                    <img
                      src={rel.image?.startsWith('http') ? rel.image : assetUrl(rel.image)}
                      alt={rel.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#D04862] uppercase tracking-wider block mb-1">
                      {rel.brand}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-[#D04862] transition-colors">
                      {rel.name}
                    </h3>
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatPrice(rel.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />
      <StorefrontModals />
    </div>
  );
}
