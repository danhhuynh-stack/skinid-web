import { useEffect, useState } from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import { useCatalog, formatPrice } from '../features/catalog/index.js';
import { useCart } from '../features/cart/index.js';
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from '../data/promotions.js';
import { fetchAdminPromotions } from '../features/admin/index.js';
import { assetUrl } from '../assets/index.js';
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

function SparklesIcon() {
  return <svg aria-hidden="true" className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></svg>;
}

function HeartIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-rose-400 fill-rose-400 inline" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
}

function GiftIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-rose-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>;
}


function formatVoucherPrice(num) {
  return new Intl.NumberFormat('vi-VN').format(num) + '₫';
}

function readDynamicStorefrontCoupons() {
  return [
    {
      code: 'SKINID10',
      title: 'Giảm 10% đơn hàng',
      desc: 'Áp dụng cho đơn từ 200.000₫. Giảm tối đa 150.000₫.',
      badge: 'Phổ biến nhất',
      color: 'from-rose-500 to-pink-600'
    },
    {
      code: 'WELCOME50',
      title: 'Giảm ngay 50.000₫',
      desc: 'Dành riêng cho khách hàng mới với đơn từ 300.000₫.',
      badge: 'Khách mới',
      color: 'from-amber-500 to-orange-600'
    },
    {
      code: 'FREESHIP',
      title: 'Miễn phí vận chuyển',
      desc: 'Hỗ trợ 30.000₫ phí ship toàn quốc cho mọi đơn hàng.',
      badge: 'Freeship Extra',
      color: 'from-emerald-500 to-teal-600'
    }
  ];
}

export default function PromotionsPage() {
  usePageMetadata({
    title: 'TWON - D\'VAH · Like & Share Săn Deal Giảm 50% & 3 Combo | SkinID.vn',
    description: 'Chương trình ưu đãi bùng nổ: 3 combo quà tặng sang trọng Nàng Xinh, Nàng Quyến Rũ, Nàng Thơm và sản phẩm bán lẻ TWON, nước hoa D\'VAH giảm đến 50% tại SkinID.vn.'
  });

  const { isReady } = useCatalog();
  const { addToCart } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);
  const [addedComboId, setAddedComboId] = useState(null);

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

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    await addToCart(productId);
  };

  const handleAddComboToCart = async (combo) => {
    setAddedComboId(combo.id);
    for (const pid of combo.productIds) {
      await addToCart(pid);
    }
    setTimeout(() => setAddedComboId(null), 2500);
  };

  const [coupons, setCoupons] = useState(readDynamicStorefrontCoupons);

  // Đồng bộ realtime với Admin khi xóa hoặc thêm voucher
  useEffect(() => {
    fetchAdminPromotions().then(res => {
      if (res?.vouchers && Array.isArray(res.vouchers)) {
        const colors = [
          'from-rose-500 to-pink-600',
          'from-amber-500 to-orange-600',
          'from-emerald-500 to-teal-600',
          'from-indigo-500 to-purple-600'
        ];
        const activeV = res.vouchers.filter(v => v && v.active !== false && v.code).map((v, i) => ({
          code: String(v.code).trim().toUpperCase(),
          title: v.type === 'percent' || v.type === 'percentage'
            ? `Giảm ${Number(v.discountValue || v.value) || 0}%`
            : v.type === 'shipping'
            ? 'Miễn phí vận chuyển'
            : `Giảm ngay ${formatVoucherPrice(Number(v.discountValue || v.value) || 0)}`,
          desc: v.description || (v.minOrderValue ? `Áp dụng cho đơn từ ${formatVoucherPrice(Number(v.minOrderValue) || 0)}.` : 'Áp dụng cho mọi đơn hàng.'),
          badge: v.badge || (i === 0 ? 'Phổ biến nhất' : v.type === 'shipping' ? 'Freeship Extra' : 'Ưu đãi hot'),
          color: colors[i % colors.length]
        }));
        setCoupons(activeV);
      }
    }).catch(() => {});

    const handleSync = (e) => {
      if (Array.isArray(e?.detail?.vouchers)) {
        const colors = [
          'from-rose-500 to-pink-600',
          'from-amber-500 to-orange-600',
          'from-emerald-500 to-teal-600',
          'from-indigo-500 to-purple-600'
        ];
        const activeV = e.detail.vouchers.filter(v => v && v.active !== false && v.code).map((v, i) => ({
          code: String(v.code).trim().toUpperCase(),
          title: v.type === 'percent' || v.type === 'percentage'
            ? `Giảm ${Number(v.discountValue || v.value) || 0}%`
            : v.type === 'shipping'
            ? 'Miễn phí vận chuyển'
            : `Giảm ngay ${formatVoucherPrice(Number(v.discountValue || v.value) || 0)}`,
          desc: v.description || (v.minOrderValue ? `Áp dụng cho đơn từ ${formatVoucherPrice(Number(v.minOrderValue) || 0)}.` : 'Áp dụng cho mọi đơn hàng.'),
          badge: v.badge || (i === 0 ? 'Phổ biến nhất' : v.type === 'shipping' ? 'Freeship Extra' : 'Ưu đãi hot'),
          color: colors[i % colors.length]
        }));
        setCoupons(activeV);
      } else {
        setCoupons(readDynamicStorefrontCoupons());
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('skinid:vouchers-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('skinid:vouchers-updated', handleSync);
    };
  }, []);

  return (
    <>
      <OfferBar />
      <Header />
      <main className="promotions-page min-h-screen bg-stone-50 pb-20">
        <div className="container py-6">
          <nav className="catalog-breadcrumb mb-6 text-xs text-gray-500 flex items-center gap-2" aria-label="Đường dẫn">
            <a href="/" className="hover:text-rose-600">Trang chủ</a>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-semibold">Khuyến mãi &amp; Combo Đặc Quyền</span>
          </nav>

          {/* Flash Sale Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-800 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden mb-12 border border-rose-700/40">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                  <FlameIcon /> <span>TWON — D'VAH · CHĂM SÓC CƠ THỂ &amp; NƯỚC HOA CAO CẤP</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  LIKE &amp; SHARE SĂN DEAL GIẢM 50% · 3 COMBO ĐẶC QUYỀN
                </h1>
                <p className="text-sm md:text-base text-rose-100 font-normal leading-relaxed">
                  Yêu thương bản thân — Đẹp hơn mỗi ngày cùng SkinID! Cam kết 100% mỹ phẩm chính hãng có đầy đủ phiếu công bố chất lượng hợp lệ.
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

          {/* SECTION 1: 3 COMBO ĐẶC QUYỀN TWON & D'VAH (HIỂN THỊ CÁC SẢN PHẨM RÕ RÀNG) */}
          <section className="mb-14" aria-label="3 Combo quà tặng đặc quyền">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">
                  <SparklesIcon /> ĐẶC QUYỀN SKINID
                </div>
                <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  3 Bộ Combo Quà Tặng Độc Quyền — Tiết Kiệm Đến 25%
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Mỗi combo được thiết kế tỉ mỉ kết hợp dưỡng da trắng sáng và hương thơm lưu luyến, tặng kèm túi quà SkinID cao cấp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CURATED_COMBOS.map((combo) => {
                const isAdded = addedComboId === combo.id;
                return (
                  <div
                    key={combo.id}
                    className="bg-gradient-to-b from-[#FFF7F9] via-white to-white text-gray-900 rounded-3xl p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-rose-200/90 relative group overflow-hidden"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider text-white bg-rose-600 shadow-xs">
                            {combo.code}
                          </span>
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            {combo.badge}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                          <HeartIcon /> Sản Phẩm Chính Hãng
                        </span>
                      </div>

                      {/* Title & Slogan */}
                      <h3 className="text-2xl font-black text-rose-900 tracking-tight font-serif">
                        {combo.title}
                      </h3>
                      <p className="text-xs font-extrabold text-rose-600 tracking-wider uppercase mt-1">
                        {combo.subtitle}
                      </p>
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {combo.slogan}
                      </p>

                      {/* HERO VISUAL MOCKUP ẢNH CHỤP COMBO SANG TRỌNG */}
                      <div className="relative aspect-[4/3] rounded-2xl bg-white my-3.5 overflow-hidden border border-rose-100 shadow-sm flex items-center justify-center group/hero">
                        <img
                          src={assetUrl(combo.image)}
                          alt={combo.title}
                          className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                          <GiftIcon /> Trọn bộ 3 món + Túi quà tặng cao cấp
                        </div>
                      </div>

                      {/* DẢI HIỂN THỊ CÁC SẢN PHẨM RÕ RÀNG TRONG COMBO */}
                      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 my-4">
                        <div className="text-[11px] font-black uppercase tracking-wider text-rose-800 mb-2.5 text-center">
                          Trọn bộ gồm {combo.products.length} sản phẩm:
                        </div>
                        <div className="flex items-center justify-around gap-2">
                          {combo.products.map((item) => (
                            <div
                              key={item.id}
                              className="flex-1 flex flex-col items-center text-center group/item cursor-pointer"
                              onClick={() => openProduct(item.id)}
                              title={`Xem chi tiết ${item.name}`}
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-2 flex items-center justify-center shadow-xs border border-rose-200/80 group-hover/item:scale-105 group-hover/item:border-rose-400 transition-all">
                                <img
                                  src={assetUrl(item.image, item.brandSlug)}
                                  alt={item.name}
                                  className="max-h-full max-w-full object-contain"
                                  loading="lazy"
                                />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1.5 leading-tight">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-rose-600 font-extrabold bg-white px-1.5 py-0.5 rounded border border-rose-100 mt-1">
                                {item.capacity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Gift Tagline */}
                        <div className="mt-3.5 pt-2.5 border-t border-dashed border-rose-200 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/70 py-1.5 px-3 rounded-xl">
                          <GiftIcon />
                          <span>Tặng kèm Túi quà tặng SkinID sang trọng</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-4">
                        {combo.description}
                      </p>

                      {/* 4 Feature Pills */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {combo.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Cart Action */}
                    <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-stone-400">
                          Tổng giá trị: <span className="line-through">{formatPrice(combo.originalPrice)}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-rose-700">
                            {formatPrice(combo.price)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Tiết kiệm {formatPrice(combo.savedPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200 hover:scale-[1.02]'
                        }`}
                        onClick={() => handleAddComboToCart(combo)}
                      >
                        {isAdded ? (
                          <><CheckIcon /> Đã thêm 3 món</>
                        ) : (
                          <span>+ Thêm Combo</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: VOUCHER HUB */}
          <section className="mb-14" aria-label="Trung tâm mã giảm giá">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TagIcon /> Trung tâm Mã Giảm Giá
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Sao chép mã và dán tại bước thanh toán để nhận ngay chiết khấu.</p>
              </div>
            </div>

            {coupons.length > 0 ? (
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
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                <p className="text-sm font-bold text-gray-700">Các mã giảm giá mới đang được cập nhật</p>
                <p className="text-xs text-gray-400 mt-1">Quý khách vẫn có thể chọn mua các bộ Combo tiết kiệm đến 25% hoặc Flash Sale 50% bên dưới!</p>
              </div>
            )}
          </section>

          {/* SECTION 3: SẢN PHẨM BÁN LẺ FLASH SALE GIẢM ĐẾN 50% */}
          <section className="mb-14" aria-label="Sản phẩm bán lẻ giảm giá 50%">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FlameIcon /> Sản Phẩm Bán Lẻ Flash Sale Giảm Đến 50%
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Áp dụng cho dòng chăm sóc cơ thể TWON và tuyển tập nước hoa Mini 10ml D'VAH chính hãng.
                </p>
              </div>
              <a
                href="/products"
                className="text-xs md:text-sm font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                Xem tất cả 54 sản phẩm <span>→</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RETAIL_50_DEALS.map(p => (
                <div
                  key={p.id}
                  className="bg-white text-gray-900 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-rose-100/80 relative"
                  onClick={() => openProduct(p.id)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full">
                        GIẢM 50%
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-400 uppercase">
                        {p.brand}
                      </span>
                    </div>

                    <div className="relative aspect-square rounded-2xl bg-rose-50/40 p-4 mb-3 flex items-center justify-center overflow-hidden border border-rose-100/50">
                      <img
                        src={assetUrl(p.image, p.brandSlug)}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    {p.scent && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 line-clamp-1">
                        {p.scent}
                      </p>
                    )}

                    <ul className="mt-3 space-y-1">
                      {p.features.slice(0, 3).map((f, idx) => (
                        <li key={idx} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-rose-700">{formatPrice(p.price)}</div>
                      <div className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                      onClick={(e) => handleAddToCart(e, p.id)}
                    >
                      + Giỏ hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner hướng dẫn 3 bước */}
            <div className="mt-8 bg-gradient-to-r from-rose-900 to-pink-900 text-white rounded-3xl p-6 shadow-md border border-rose-800">
              <div className="text-sm font-black uppercase tracking-wider text-rose-200 mb-3 text-center sm:text-left">
                CÁCH THAM GIA NHẬN ƯU ĐÃI GIẢM 50% (ÁP DỤNG SẢN PHẨM BÁN LẺ):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CAMPAIGN_STEPS.map((s) => (
                  <div key={s.step} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/15">
                    <span className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                      {s.step}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">{s.title}</span>
                      <span className="text-[11px] text-rose-200">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
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
