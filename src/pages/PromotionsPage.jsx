import { useEffect, useMemo, useState } from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import ProductCard from '../features/catalog/ProductCard.jsx';
import { useCatalog } from '../features/catalog/index.js';
import { AVAILABLE_COUPONS } from '../features/cart/services/couponService.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

function TagIcon() {
  return <svg aria-hidden="true" className="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>;
}

function FlameIcon() {
  return <svg aria-hidden="true" className="w-5 h-5 text-amber-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 9.03 3 14c0 4.97 4.03 9 9 9z" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-emerald-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
}

function CopyIcon() {
  return <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
}

export default function PromotionsPage() {
  usePageMetadata({
    title: 'Khuyến Mãi & Voucher Ưu Đãi Độc Quyền — SkinID.vn',
    description: 'Tổng hợp mã giảm giá độc quyền, voucher freeship và ưu đãi flash-sale mỹ phẩm chăm sóc da chính hãng tại SkinID.vn.'
  });

  const { products, isReady } = useCatalog();
  const [copiedCode, setCopiedCode] = useState(null);

  // Countdown timer logic to midnight today
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((midnight - now) / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, Math.floor((midnight - now) / 1000));
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const openProduct = productId => document.dispatchEvent(new CustomEvent('skinid:open-product-detail', { detail: { productId } }));

  // Filter products with highest discount percentage
  const flashSaleProducts = useMemo(() => {
    if (!products || !products.length) return [];
    return [...products]
      .filter(p => p.originalPrice && p.originalPrice > p.price)
      .map(p => ({
        ...p,
        discountPercent: Math.round((1 - p.price / p.originalPrice) * 100)
      }))
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 12);
  }, [products]);

  const coupons = [
    {
      code: 'SKINID10',
      title: 'Giảm 10% đơn hàng',
      desc: 'Áp dụng cho đơn từ 500.000₫. Giảm tối đa 50.000₫.',
      badge: 'Phổ biến nhất',
      color: 'from-rose-500 to-pink-600'
    },
    {
      code: 'WELCOME50',
      title: 'Giảm ngay 50.000₫',
      desc: 'Dành riêng cho khách hàng mới với đơn từ 350.000₫.',
      badge: 'Khách mới',
      color: 'from-amber-500 to-orange-600'
    },
    {
      code: 'FREESHIP',
      title: 'Miễn phí vận chuyển',
      desc: 'Tiết kiệm 30.000₫ phí ship toàn quốc cho đơn từ 500.000₫.',
      badge: 'Freeship Extra',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <>
      <OfferBar />
      <Header />
      <main className="promotions-page min-h-screen bg-stone-50 pb-20">
        <div className="container py-6">
          <nav className="catalog-breadcrumb mb-6 text-xs text-gray-500 flex items-center gap-2" aria-label="Đường dẫn">
            <a href="/" className="hover:text-rose-600">Trang chủ</a>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-semibold">Khuyến mãi &amp; Ưu đãi</span>
          </nav>

          {/* Flash Sale Banner */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-700 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden mb-12">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                  <FlameIcon /> <span>Ưu đãi chớp nhoáng hôm nay</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Săn Voucher &amp; Mỹ Phẩm Chính Hãng Giảm Đến 30%
                </h1>
                <p className="text-sm md:text-base text-rose-100 font-normal leading-relaxed">
                  Cam kết 100% chính hãng từ Ý &amp; Việt Nam. Đầy đủ tem nhãn phụ và Phiếu công bố sản phẩm hợp lệ.
                </p>
              </div>

              {/* Countdown box */}
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5 flex flex-col items-center min-w-[240px]">
                <span className="text-xs uppercase tracking-wider text-rose-200 font-bold mb-2">Kết thúc trong</span>
                <div className="flex items-center gap-2 text-2xl md:text-3xl font-mono font-black">
                  <span className="bg-white text-rose-700 px-3 py-1.5 rounded-lg shadow-sm">{hours}</span>
                  <span>:</span>
                  <span className="bg-white text-rose-700 px-3 py-1.5 rounded-lg shadow-sm">{minutes}</span>
                  <span>:</span>
                  <span className="bg-white text-rose-700 px-3 py-1.5 rounded-lg shadow-sm">{seconds}</span>
                </div>
                <span className="text-[11px] text-rose-200 mt-2 font-medium">Đổi mã ngay trước khi hết lượt</span>
              </div>
            </div>
          </div>

          {/* Voucher Hub */}
          <section className="mb-14" aria-label="Trung tâm mã giảm giá">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TagIcon /> Trung tâm Mã Giảm Giá
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Sao chép mã và dán tại bước thanh toán để nhận ngay chiết khấu.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coupons.map((c) => {
                const isCopied = copiedCode === c.code;
                return (
                  <div
                    key={c.code}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${c.color}`}>
                        {c.badge}
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-400">HSD: 31/12</span>
                    </div>

                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between gap-2">
                      <div className="font-mono font-extrabold text-sm text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                        {c.code}
                      </div>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-gray-900 text-white hover:bg-rose-600'
                        }`}
                        onClick={() => handleCopy(c.code)}
                      >
                        {isCopied ? <><CheckIcon /> Đã chép</> : <><CopyIcon /> Sao chép</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Flash Deals Catalog */}
          <section aria-label="Sản phẩm giảm giá sâu nhất">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FlameIcon /> Đang Giảm Giá Sâu Nhất
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Tuyển chọn các dòng sản phẩm chăm sóc da bán chạy đang áp dụng ưu đãi tốt nhất.
                </p>
              </div>
              <a
                href="/products"
                className="text-xs md:text-sm font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                Xem tất cả 54 sản phẩm <span>→</span>
              </a>
            </div>

            <div id="product-grid" aria-live="polite" aria-busy={!isReady}>
              {isReady && flashSaleProducts.map(product => (
                <ProductCard key={product.id} product={product} onOpen={openProduct} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
