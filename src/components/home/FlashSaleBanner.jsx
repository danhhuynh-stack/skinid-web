import { useEffect, useState } from 'react';
import { useCatalog, formatPrice } from '../../features/catalog/index.js';
import { useCart } from '../../features/cart/index.js';
import { fetchAdminPromotions } from '../../features/admin/index.js';
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from '../../data/promotions.js';
import { assetUrl } from '../../assets/index.js';

function FlameIcon() {
  return <svg aria-hidden="true" className="w-5 h-5 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 9.03 3 14c0 4.97 4.03 9 9 9z" /></svg>;
}

function SparklesIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
}

function HeartIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-rose-400 fill-rose-400 inline" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
}

function GiftIcon() {
  return <svg aria-hidden="true" className="w-4 h-4 text-rose-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></svg>;
}

function readDynamicCampaign() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('skinid_admin_campaign');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return {
    title: 'TWON - D\'VAH · LIKE & SHARE SĂN DEAL GIẢM 50%',
    subtitle: 'Yêu thương bản thân — Đẹp hơn mỗi ngày cùng SkinID. 3 Combo quà tặng đặc quyền và sản phẩm bán lẻ chính hãng giảm nửa giá.',
    active: true
  };
}

function readDynamicVouchers() {
  const fallback = [
    { code: 'SKINID10', label: 'Giảm 10%', sub: 'Đơn từ 200k' },
    { code: 'WELCOME50', label: 'Giảm 50K', sub: 'Đơn từ 300k' },
    { code: 'FREESHIP', label: 'Freeship', sub: 'Toàn sàn' }
  ];
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('skinid_admin_vouchers');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list.filter(v => v.active !== false).slice(0, 3).map(v => ({
            code: v.code,
            label: v.type === 'percent' ? `Giảm ${v.discountValue}%` : v.type === 'shipping' ? 'Freeship' : `Giảm ${Math.round(v.discountValue / 1000)}K`,
            sub: v.description || (v.minOrderValue ? `Đơn từ ${Math.round(v.minOrderValue / 1000)}k` : 'Toàn sàn')
          }));
        }
      }
    }
  } catch {}
  return fallback;
}

export default function FlashSaleBanner() {
  const { isReady } = useCatalog();
  const { addToCart } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);
  const [addedComboId, setAddedComboId] = useState(null);
  const [campaign, setCampaign] = useState(readDynamicCampaign);
  const [vouchers, setVouchers] = useState(readDynamicVouchers);

  // Tự động tải chiến dịch và voucher từ Firestore khi mount
  useEffect(() => {
    fetchAdminPromotions().then(res => {
      if (res?.campaign && res.campaign.active !== false) {
        setCampaign(prev => ({ ...prev, ...res.campaign }));
      }
      if (res?.vouchers && res.vouchers.length > 0) {
        const activeV = res.vouchers.filter(v => v.active !== false).slice(0, 3).map(v => ({
          code: v.code,
          label: v.type === 'percent' || v.type === 'percentage' ? `Giảm ${v.discountValue || v.value}%` : v.type === 'shipping' ? 'Freeship' : `Giảm ${Math.round((v.discountValue || v.value) / 1000)}K`,
          sub: v.description || (v.minOrderValue ? `Đơn từ ${Math.round(v.minOrderValue / 1000)}k` : 'Toàn sàn')
        }));
        if (activeV.length > 0) setVouchers(activeV);
      }
    }).catch(() => {});
  }, []);

  // Lắng nghe cập nhật từ Admin Panel theo thời gian thực
  useEffect(() => {
    const handleCampaignSync = () => setCampaign(readDynamicCampaign());
    const handleVouchersSync = () => setVouchers(readDynamicVouchers());

    window.addEventListener('storage', handleCampaignSync);
    window.addEventListener('skinid:campaign-updated', handleCampaignSync);
    window.addEventListener('skinid:vouchers-updated', handleVouchersSync);

    return () => {
      window.removeEventListener('storage', handleCampaignSync);
      window.removeEventListener('skinid:campaign-updated', handleCampaignSync);
      window.removeEventListener('skinid:vouchers-updated', handleVouchersSync);
    };
  }, []);

  // Realtime Countdown to 23:59:59 tonight
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((midnight - now) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      setTimeLeft(Math.max(0, Math.floor((midnight - now) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openProduct = (productId) => {
    document.dispatchEvent(new CustomEvent('skinid:open-product-detail', {
      detail: { productId }
    }));
  };

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

  // Banner khuyến mãi chính luôn hiển thị để phục vụ khách hàng
  // if (campaign && campaign.active === false) return null;

  return (
    <section className="container my-8 md:my-12" aria-label="Khuyến mãi & Combo Ngày Đôi">
      <div className="bg-gradient-to-br from-[#3b0813] via-[#5c1322] to-[#20050b] rounded-3xl p-5 md:p-8 text-white shadow-2xl relative overflow-hidden border border-rose-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header line: Title + Brand info + Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-800/40 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-800/60 border border-rose-700/50 text-[11px] font-extrabold uppercase tracking-widest text-rose-200 mb-2">
              <FlameIcon /> <span>TWON — D'VAH · DEAL GIẢM ĐẾN 50%</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
              {campaign?.title || 'TWON - D\'VAH · LIKE & SHARE SĂN DEAL GIẢM 50%'}
            </h2>
            <p className="text-xs md:text-sm text-rose-200/90 mt-1">
              {campaign?.subtitle || 'Yêu thương bản thân — Đẹp hơn mỗi ngày cùng SkinID. 3 Combo quà tặng đặc quyền và sản phẩm chính hãng giảm nửa giá.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 self-start md:self-auto flex-shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-rose-300 font-bold">Hết hạn trong</span>
            <div className="flex items-center gap-1.5 font-mono text-base font-black">
              <span className="bg-rose-600 text-white px-2 py-1 rounded-lg text-xs">{hours}</span>
              <span className="text-rose-400">:</span>
              <span className="bg-rose-600 text-white px-2 py-1 rounded-lg text-xs">{minutes}</span>
              <span className="text-rose-400">:</span>
              <span className="bg-rose-600 text-white px-2 py-1 rounded-lg text-xs">{seconds}</span>
            </div>
          </div>
        </div>

        {/* Voucher Fast Strip */}
        <div className="py-4 border-b border-rose-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {vouchers.map(v => {
            const isCopied = copiedCode === v.code;
            return (
              <div
                key={v.code}
                className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{v.label}</span>
                    <span className="text-[10px] text-rose-300 font-mono font-extrabold bg-rose-500/20 px-1.5 py-0.5 rounded">
                      {v.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 block mt-0.5">{v.sub}</span>
                </div>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-rose-900 hover:bg-rose-100 shadow-sm'
                  }`}
                  onClick={() => handleCopy(v.code)}
                >
                  {isCopied ? <><CheckIcon /> Đã chép</> : 'Sao chép'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 3 Curated Combos Section with clear individual products */}
        <div className="pt-6 pb-6 border-b border-rose-800/40 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SparklesIcon />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-200">
                3 Combo Đặc Quyền: Nàng Xinh ♡ — Nàng Quyến Rũ ♡ — Nàng Thơm ♡
              </h3>
            </div>
            <a
              href="/khuyen-mai"
              className="text-xs font-bold text-rose-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              Xem trang khuyến mãi <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {CURATED_COMBOS.map((combo) => {
              const isAdded = addedComboId === combo.id;
              return (
                <div
                  key={combo.id}
                  className="bg-gradient-to-b from-[#FFF7F9] via-white to-white text-gray-900 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-rose-200/90 relative group overflow-hidden"
                >
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Header: Combo tag + Savings Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider text-white bg-rose-600 shadow-xs">
                          {combo.code}
                        </span>
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          {combo.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <HeartIcon /> SkinID Chính Hãng
                      </span>
                    </div>

                    {/* Title + Subtitle */}
                    <h4 className="text-2xl font-black text-rose-900 tracking-tight font-serif">
                      {combo.title}
                    </h4>
                    <p className="text-xs font-extrabold text-rose-600 tracking-wide uppercase mt-0.5">
                      {combo.subtitle}
                    </p>
                    <p className="text-xs text-stone-500 italic mt-0.5">
                      {combo.slogan}
                    </p>

                    {/* HERO VISUAL MOCKUP ẢNH CHỤP COMBO SANG TRỌNG */}
                    <div className="relative aspect-[4/3] rounded-2xl bg-white my-3 overflow-hidden border border-rose-100 shadow-sm flex items-center justify-center group/hero">
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

                    {/* GALLERY ROW: HIỂN THỊ CÁC SẢN PHẨM RÕ RÀNG */}
                    <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 my-4">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 mb-2 text-center">
                        Bộ sản phẩm bao gồm ({combo.products.length} món):
                      </div>
                      <div className="flex items-center justify-around gap-2">
                        {combo.products.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex-1 flex flex-col items-center text-center group/item cursor-pointer"
                            onClick={() => openProduct(item.id)}
                            title={`Xem chi tiết ${item.name}`}
                          >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-xs border border-rose-200/80 group-hover/item:scale-105 group-hover/item:border-rose-400 transition-all">
                              <img
                                src={assetUrl(item.image, item.brandSlug)}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-800 line-clamp-1 mt-1 leading-tight">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-rose-600 font-extrabold bg-white/90 px-1.5 py-0.2 rounded border border-rose-100 mt-0.5">
                              {item.capacity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Gift Bag Tagline */}
                      <div className="mt-3 pt-2 border-t border-dashed border-rose-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-100/70 py-1.5 px-3 rounded-xl">
                        <GiftIcon />
                        <span>Tặng kèm Túi quà tặng SkinID sang trọng</span>
                      </div>
                    </div>

                    {/* 4 Feature Bullets */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {combo.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing bar & Action Button */}
                  <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-stone-400">
                        Tổng giá trị: <span className="line-through">{formatPrice(combo.originalPrice)}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-rose-700">
                          {formatPrice(combo.price)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
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
        </div>

        {/* SẢN PHẨM BÁN LẺ FLASH SALE GIẢM 50% */}
        <div className="pt-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300 block">
                SẢN PHẨM BÁN LẺ · SĂN DEAL GIẢM ĐẾN 50%
              </span>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Áp dụng cho dòng chăm sóc body TWON và tuyển tập nước hoa Mini 10ml D'VAH chính hãng
              </p>
            </div>
            <a
              href="/khuyen-mai"
              className="text-xs font-bold text-rose-400 hover:text-white transition-colors inline-flex items-center gap-1 flex-shrink-0"
            >
              Xem tất cả deal <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {RETAIL_50_DEALS.slice(0, 8).map(p => (
              <div
                key={p.id}
                className="bg-white/95 text-gray-900 rounded-2xl p-3.5 flex gap-3 items-center hover:bg-white transition-all shadow-md group cursor-pointer border border-rose-100/50"
                onClick={() => openProduct(p.id)}
              >
                <div className="w-16 h-16 bg-rose-50/50 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden border border-rose-100">
                  <img
                    src={assetUrl(p.image, p.brandSlug)}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] font-black text-white bg-rose-600 px-1.5 py-0.2 rounded">
                      -50%
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 uppercase truncate">
                      {p.brand}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-black text-rose-700">{formatPrice(p.price)}</span>
                    <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                    onClick={(e) => handleAddToCart(e, p.id)}
                  >
                    + Giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 3 BƯỚC THAM GIA SĂN DEAL */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-xs font-black uppercase tracking-wider text-rose-200 mb-2.5 text-center sm:text-left">
              CÁCH THAM GIA NHẬN ƯU ĐÃI GIẢM 50% (ÁP DỤNG SẢN PHẨM BÁN LẺ):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CAMPAIGN_STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white block">{s.title}</span>
                    <span className="text-[11px] text-rose-200/80">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
