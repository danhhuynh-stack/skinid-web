import { useEffect, useMemo, useState } from 'react';
import { useCatalog, formatPrice } from '../../features/catalog/index.js';
import { useCart } from '../../features/cart/index.js';
import { assetUrl } from '../../assets/index.js';

function FlameIcon() {
  return <svg aria-hidden="true" className="w-5 h-5 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 9.03 3 14c0 4.97 4.03 9 9 9z" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
}

function readDynamicCampaign() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('skinid_admin_campaign');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return {
    title: 'SIÊU SALE NGÀY ĐÔI · ĐẶC QUYỀN SKINID',
    subtitle: 'Mỹ phẩm chăm sóc da nhập khẩu chính ngạch Ý & Việt Nam giảm đến 30%',
    active: true
  };
}

function readDynamicVouchers() {
  const fallback = [
    { code: 'SKINID10', label: 'Giảm 10%', sub: 'Đơn từ 500k' },
    { code: 'WELCOME50', label: 'Giảm 50K', sub: 'Khách mới' },
    { code: 'FREESHIP', label: 'Freeship', sub: 'Toàn quốc' }
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
  const { products, isReady } = useCatalog();
  const { addToCart } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);
  const [campaign, setCampaign] = useState(readDynamicCampaign);
  const [vouchers, setVouchers] = useState(readDynamicVouchers);

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

  // Top 3 best discount products
  const topDeals = useMemo(() => {
    if (!products || !products.length) return [];
    return [...products]
      .filter(p => p.originalPrice && p.originalPrice > p.price)
      .map(p => ({
        ...p,
        discountPercent: Math.round((1 - p.price / p.originalPrice) * 100)
      }))
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 3);
  }, [products]);

  // Nếu Admin tắt kích hoạt banner thì ẩn hoàn toàn khỏi Storefront
  if (campaign && campaign.active === false) {
    return null;
  }

  return (
    <section className="container my-8 md:my-12" aria-label="Khuyến mãi & Combo Ngày Đôi">
      <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-rose-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header line: Title + Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-800/40 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-800/60 border border-rose-700/50 text-[11px] font-extrabold uppercase tracking-widest text-rose-200 mb-2">
              <FlameIcon /> <span>ƯU ĐÃI NGÀY ĐÔI · FLASH DEALS</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
              {campaign?.title || 'Combo Chăm Sóc Da Chính Hãng Giảm Đến 30%'}
            </h2>
            <p className="text-xs md:text-sm text-rose-200/80 mt-1">
              {campaign?.subtitle || 'Nhập khẩu chính ngạch từ Ý & Việt Nam. Đầy đủ tem phụ và phiếu tiếp nhận công bố sản phẩm.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 self-start md:self-auto">
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

        {/* 3 Hot Deals Products */}
        <div className="pt-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
              Sản phẩm giảm sâu nhất hôm nay
            </span>
            <a
              href="/khuyen-mai"
              className="text-xs font-bold text-rose-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              Xem tất cả ưu đãi <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isReady && topDeals.map(p => (
              <div
                key={p.id}
                className="bg-white/95 text-gray-900 rounded-2xl p-4 flex gap-3.5 items-center hover:bg-white transition-all shadow-md group cursor-pointer"
                onClick={() => openProduct(p.id)}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={assetUrl(p.image, p.brandSlug)}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tight block">
                    {p.brand} · Tiết kiệm {p.discountPercent}%
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 truncate mt-0.5">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-black text-rose-700">{formatPrice(p.price)}</span>
                    <span className="text-[11px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                      onClick={(e) => handleAddToCart(e, p.id)}
                    >
                      + Giỏ hàng
                    </button>
                    <span className="text-[11px] font-semibold text-gray-500 hover:text-rose-600">
                      Chi tiết ↗
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
