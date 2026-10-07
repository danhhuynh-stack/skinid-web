import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../../../assets/index.js';
import { useCart } from '../../cart/index.js';
import { resolveScanRoutine } from '../services/routineResolver.js';
import { exportUserPdfReport } from '../services/profilePdfExport.js';
import { detailedMetricNames } from '../services/metricNames.js';

const adviceByMetric = {
  moisture: {
    name: 'Độ ẩm bề mặt',
    why: 'Hàng rào lipid lớp sừng suy yếu làm nước bốc hơi nhanh, khiến da thô ráp và giảm độ căng mọng.',
    shouldDo: 'Ưu tiên Hyaluronic Acid, Panthenol và kem dưỡng giàu Ceramide để cấp và khóa ẩm.',
    avoid: 'Tránh nước quá nóng và chất làm sạch sulfate mạnh làm mất màng acid bảo vệ da.'
  },
  sebum: {
    name: 'Mức bã nhờn',
    why: 'Tuyến bã nhờn có thể tăng hoạt động do thiếu nước bề mặt, hormone hoặc nhiệt độ môi trường.',
    shouldDo: 'Dùng Niacinamide 2–5%, BHA phù hợp và dưỡng ẩm dạng gel không gây bít tắc.',
    avoid: 'Tránh thấm dầu liên tục hoặc kem dưỡng quá nặng dễ gây phản ứng tiết dầu bù.'
  },
  pores: {
    name: 'Kích thước lỗ chân lông',
    why: 'Bã nhờn và tế bào chết làm giãn miệng nang lông; collagen nâng đỡ cũng suy giảm theo thời gian.',
    shouldDo: 'Làm sạch kép buổi tối, BHA định kỳ và Peptide hỗ trợ độ săn chắc.',
    avoid: 'Không tự cạy nặn hoặc dùng gel lột mạnh gây tổn thương thành nang lông.'
  },
  pigmentation: {
    name: 'Sắc tố & Sạm nám',
    why: 'Melanin tăng do tia UV hoặc tăng sắc tố sau viêm, làm màu da kém đồng đều.',
    shouldDo: 'Dùng chống nắng SPF 50+ và hoạt chất như Vitamin C, Tranexamic Acid hoặc Alpha Arbutin.',
    avoid: 'Tránh phơi nắng không che chắn và sản phẩm lột tẩy trắng cấp tốc.'
  },
  elasticity: {
    name: 'Độ đàn hồi & Săn chắc',
    why: 'Collagen và Elastin suy giảm do tuổi tác, stress oxy hóa và tác hại của gốc tự do.',
    shouldDo: 'Cân nhắc Retinoid phù hợp vào buổi tối và Peptide hỗ trợ nguyên bào sợi.',
    avoid: 'Hạn chế thức khuya và chế độ ăn nhiều đường gây đường hóa collagen.'
  }
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(Number(value) || 0);

function numberValue(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildMetrics(scan) {
  const raw = scan.metrics || {};
  const analysis = scan.fullAnalysis || {};
  const source = (key, fallback) => numberValue(raw[key] ?? analysis[key], fallback);
  const moistureRaw = source('moisture', 60);
  const sebumRaw = source('sebum', 60);
  const poresRaw = source('pores', 60);
  const pigmentationRaw = source('pigmentation', 50);
  const elasticityRaw = source('elasticity', 65);
  const healthScore = numberValue(scan.healthScore, 70);
  const moisture = moistureRaw;
  const sebum = Math.max(10, 100 - sebumRaw);
  const pores = Math.max(10, 100 - poresRaw);
  const pigmentation = Math.max(10, 100 - pigmentationRaw);
  const elasticity = elasticityRaw;

  return {
    health: [
      moisture,
      sebum,
      pores,
      pigmentation,
      source('melasma', Math.max(15, pigmentation - 10)),
      elasticity,
      source('eyeWrinkles', Math.round(elasticity * 0.95)),
      source('nasolabialFolds', Math.round(elasticity * 0.9)),
      source('redness', Math.round(moisture * 0.7 + 25)),
      source('acneBacteria', Math.round(sebum * 0.8 + 15)),
      source('texture', Math.round((moisture + pores) / 2)),
      source('darkCircles', Math.round((healthScore + pigmentation) / 2))
    ].map((value) => Math.min(100, Math.max(0, value))),
    core: [
      { id: 'moisture', rawScore: moistureRaw, healthScore: moisture },
      { id: 'sebum', rawScore: sebumRaw, healthScore: sebum },
      { id: 'pores', rawScore: poresRaw, healthScore: pores },
      { id: 'pigmentation', rawScore: pigmentationRaw, healthScore: pigmentation },
      { id: 'elasticity', rawScore: elasticityRaw, healthScore: elasticity }
    ]
  };
}

function metricTheme(score) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Tốt' };
  if (score >= 60) return { bar: 'bg-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', label: 'Khá' };
  if (score >= 40) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Cần chú ý' };
  return { bar: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', label: 'Cần cải thiện' };
}

function RadarChart({ values }) {
  const center = 150;
  const radius = 94;
  const point = (index, scale = 1) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / values.length);
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale];
  };
  const polygon = (scale) => values.map((_, index) => point(index, scale).join(',')).join(' ');
  const dataPolygon = values.map((value, index) => point(index, value / 100).join(',')).join(' ');

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full max-w-[340px] overflow-visible" role="img" aria-label="Biểu đồ radar mười hai chỉ số cấu trúc da">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E06D81" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E06D81" stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon key={scale} points={polygon(scale)} fill="none" stroke="#F0ECEE" strokeWidth="1" strokeDasharray="3 3" />
      ))}
      {values.map((_, index) => {
        const [x, y] = point(index);
        return <line key={detailedMetricNames[index]} x1={center} y1={center} x2={x} y2={y} stroke="#F0ECEE" strokeWidth="1" />;
      })}

      <polygon points={dataPolygon} fill="url(#radarFill)" stroke="#E06D81" strokeWidth="2.5" />

      {values.map((value, index) => {
        const [x, y] = point(index, value / 100);
        const [labelX, labelY] = point(index, 1.28);
        return (
          <g key={`metric-${detailedMetricNames[index]}`}>
            <circle cx={x} cy={y} r="3.5" fill="#E06D81" stroke="#FFFFFF" strokeWidth="2" />
            <text x={labelX} y={labelY + 3} textAnchor="middle" className="fill-[#6F686B] text-[8px] font-bold">
              {detailedMetricNames[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SkincareRoutineSection({ scan }) {
  const { addToCart, openCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [addedAll, setAddedAll] = useState(false);
  const routine = useMemo(() => resolveScanRoutine(scan), [scan]);
  const { products, morningSteps, eveningSteps } = routine;

  const buy = (product) => {
    if (!product?.id) return;
    addToCart(product.id, 1);
    openCart();
  };

  const buyAll = () => {
    products.forEach((p) => {
      if (p?.id) addToCart(p.id, 1);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
    openCart();
  };

  const totalPrice = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  return (
    <section className="profile-report-section profile-report-routine p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECEE]">
        <div>
          <span className="text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1">Cá nhân hóa phác đồ</span>
          <h4 className="font-extrabold text-[#282326] text-lg sm:text-xl flex flex-wrap items-center gap-2.5">
            <span>Chu Trình Chăm Sóc Đề Xuất</span>
            <span className="text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full bg-[#FFF0F4] text-[#E06D81]">Tham khảo từ AI</span>
          </h4>
          <p className="text-xs text-[#6F686B] mt-1">Sáu bước sáng & tối được chọn lọc từ 12 chỉ số cấu trúc thực tế của phiên này.</p>
        </div>

        <div className="profile-routine-tabs flex items-center gap-1.5 self-start sm:self-auto" role="tablist" aria-label="Lọc routine theo thời điểm">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-white text-[#282326] shadow-xs' : 'text-[#6F686B] hover:text-[#282326]'}`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('morning')}
            role="tab"
            aria-selected={activeTab === 'morning'}
            className={`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${activeTab === 'morning' ? 'bg-white text-[#C45E28] shadow-xs' : 'text-[#6F686B] hover:text-[#C45E28]'}`}
          >
            ☀ Sáng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evening')}
            role="tab"
            aria-selected={activeTab === 'evening'}
            className={`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${activeTab === 'evening' ? 'bg-white text-[#8B3D59] shadow-xs' : 'text-[#6F686B] hover:text-[#8B3D59]'}`}
          >
            ☾ Tối
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(activeTab === 'all' || activeTab === 'morning') && (
          <div className="rounded-3xl p-5 sm:p-6 space-y-4 bg-gradient-to-br from-[#FFF9F6] via-[#FFFAF7] to-white border-0 shadow-[0_12px_32px_rgba(196,94,40,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FFE2D1]/60">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#FFEADF] text-[#C45E28] flex items-center justify-center text-xs font-bold">☀️</span>
                <h5 className="font-extrabold text-[#C45E28] text-xs sm:text-sm uppercase tracking-wider">Buổi Sáng · Bảo Vệ & Cấp Ẩm</h5>
              </div>
              <span className="text-[11px] font-bold text-[#D17646] bg-[#FFF0E8] px-2.5 py-0.5 rounded-full">3 bước</span>
            </div>

            <div className="space-y-3.5">
              {morningSteps.map((s) => (
                <div key={`m-${s.step}`} className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(52,35,41,0.04)] hover:shadow-[0_8px_24px_rgba(196,94,40,0.08)] transition-all">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FFEAE0] text-[#C45E28] font-black text-[10px] flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <strong className="text-xs font-extrabold text-[#282326]">{s.title}</strong>
                  </div>
                  <p className="text-[11px] text-[#6F686B] mb-2.5 pl-7.5 leading-relaxed">{s.desc}</p>
                  {s.product && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF9F7] ml-7.5 border-0">
                      <img src={assetUrl(s.product.image || '/images/products/placeholder.jpg', s.product.brandSlug)} alt="" className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-2xs flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold text-[#C45E28] uppercase tracking-wider">{s.product.brand || 'Rilastil'}</span>
                        <h6 className="text-[11px] font-bold text-[#282326] truncate">{s.product.name}</h6>
                        <span className="text-xs font-black text-[#C45E28]">{formatPrice(s.product.price)}</span>
                      </div>
                      <button type="button" onClick={() => buy(s.product)} className="profile-action profile-action--mini profile-action--morning flex-shrink-0">Thêm</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'evening') && (
          <div className="rounded-3xl p-5 sm:p-6 space-y-4 bg-gradient-to-br from-[#FDF8FB] via-[#FCF5F8] to-white border-0 shadow-[0_12px_32px_rgba(139,61,89,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2D7E2]/60">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#F9E6EE] text-[#8B3D59] flex items-center justify-center text-xs font-bold">🌙</span>
                <h5 className="font-extrabold text-[#8B3D59] text-xs sm:text-sm uppercase tracking-wider">Buổi Tối · Phục Hồi & Tái Tạo</h5>
              </div>
              <span className="text-[11px] font-bold text-[#9D4D6B] bg-[#FAEDF3] px-2.5 py-0.5 rounded-full">3 bước</span>
            </div>

            <div className="space-y-3.5">
              {eveningSteps.map((s) => (
                <div key={`e-${s.step}`} className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(52,35,41,0.04)] hover:shadow-[0_8px_24px_rgba(139,61,89,0.08)] transition-all">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#FCE8F1] text-[#8B3D59] font-black text-[10px] flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <strong className="text-xs font-extrabold text-[#282326]">{s.title}</strong>
                  </div>
                  <p className="text-[11px] text-[#6F686B] mb-2.5 pl-7.5 leading-relaxed">{s.desc}</p>
                  {s.product && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FDF7FA] ml-7.5 border-0">
                      <img src={assetUrl(s.product.image || '/images/products/placeholder.jpg', s.product.brandSlug)} alt="" className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-2xs flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold text-[#8B3D59] uppercase tracking-wider">{s.product.brand || 'Rilastil'}</span>
                        <h6 className="text-[11px] font-bold text-[#282326] truncate">{s.product.name}</h6>
                        <span className="text-xs font-black text-[#8B3D59]">{formatPrice(s.product.price)}</span>
                      </div>
                      <button type="button" onClick={() => buy(s.product)} className="profile-action profile-action--mini profile-action--evening flex-shrink-0">Thêm</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Routine Footer Call to Action */}
      <div className="rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-br from-[#FFF1F4] via-[#FFF8F9] to-white shadow-[0_16px_40px_rgba(224,109,129,0.08)]">
        <div>
          <span className="text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1">Hiệu quả tái tạo rõ nét sau 28 ngày</span>
          <h5 className="font-extrabold text-base text-[#282326]">Trọn bộ {products.length} sản phẩm theo phác đồ</h5>
          <p className="text-xs text-[#6F686B] mt-0.5">Tổng phác đồ: <strong className="text-base font-black text-[#E06D81]">{formatPrice(totalPrice)}</strong></p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={buyAll}
            className="profile-action profile-action--primary profile-action--large w-full sm:w-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span>{addedAll ? 'Đã thêm trọn bộ vào giỏ!' : 'Thêm trọn bộ vào giỏ hàng'}</span>
          </button>
          <a
            href="https://zalo.me/0924093461"
            target="_blank"
            rel="noreferrer"
            className="profile-action profile-action--consult profile-action--large w-full sm:w-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></svg>
            <span>Nhờ dược sĩ tư vấn</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ProfileScanDetailModal({ history = [], user = {} }) {
  const [selected, setSelected] = useState(null);
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(null);
  const close = useCallback(() => {
    setSelected(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus?.());
  }, []);

  useEffect(() => {
    const open = (event) => {
      returnFocusRef.current = document.activeElement;
      setSelected(event.detail || null);
    };
    document.addEventListener('skinid:scan-detail-open', open);
    return () => document.removeEventListener('skinid:scan-detail-open', open);
  }, []);

  const selectedIndex = useMemo(() => {
    if (!selected) return -1;
    const byId = history.findIndex((scan) => scan.id != null && String(scan.id) === String(selected.scanId));
    return byId >= 0 ? byId : Number(selected.scanIndex);
  }, [history, selected]);
  const scan = selectedIndex >= 0 ? history[selectedIndex] : null;

  useEffect(() => {
    if (!scan) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close, scan]);

  if (!scan) return null;

  const healthScore = Math.min(100, Math.max(10, numberValue(scan.healthScore, 70)));
  const grade = String(scan.overallGrade || (healthScore >= 75 ? 'A' : healthScore >= 60 ? 'B' : 'C')).toUpperCase();
  const gradeComment = scan.overallGradeComment || (grade === 'A'
    ? 'Làn da khỏe mạnh, cấu trúc ổn định'
    : grade === 'B' ? 'Làn da ở mức ổn định, cần duy trì chu trình' : 'Cần phác đồ phục hồi hàng rào bảo vệ');
  const analysis = scan.fullAnalysis || {};
  const assessment = scan.analysis3Angles || analysis.analysis3Angles || `Phân tích AI cho thấy chỉ số sức khỏe da đạt ${healthScore}/100.`;
  const metrics = buildMetrics(scan);
  const ranked = detailedMetricNames.map((name, index) => ({ name, score: metrics.health[index] })).sort((left, right) => left.score - right.score);
  const concerns = Array.isArray(scan.primaryConcerns) && scan.primaryConcerns.length ? scan.primaryConcerns : ['Niacinamide', 'Hyaluronic Acid', 'Ceramide'];
  const ringColor = healthScore < 60 ? '#E06D81' : healthScore < 75 ? '#F59E0B' : '#10B981';

  return createPortal(
    <div
      className="profile-report-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-detail-title"
    >
      <div className="profile-report-modal bg-white max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col my-auto skinid-enter">
        {/* Modal Sticky Header */}
        <div className="profile-report-header sticky top-0 flex items-center justify-between z-20">
          <div>
            <span className="text-[10px] font-extrabold text-[#E06D81] uppercase tracking-wider block">Báo cáo soi da cá nhân</span>
            <h3 id="scan-detail-title" className="font-extrabold text-[#282326] text-base sm:text-lg">
              Phiên Soi Da #{history.length - selectedIndex}
            </h3>
            <p className="text-xs text-[#6F686B]">Thời gian: {scan.dateFormatted || 'Vừa xong'}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            className="profile-report-close"
            aria-label="Đóng"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-grow">
          {/* Top Skin ID Card */}
          <div className="profile-report-summary p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path strokeWidth="3" stroke="#F0ECEE" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeDasharray={`${healthScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke={ringColor} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#282326] tracking-tight">{healthScore}</span>
                <span className="text-[10px] text-[#6F686B] font-extrabold uppercase tracking-wider mt-0.5">Sức khỏe</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h4 className="text-2xl font-black text-[#282326] tracking-tight">{scan.skinType || 'Da chưa xác định'}</h4>
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#FFF0F4] text-[#E06D81]">
                  Tuổi da AI: {scan.skinAge || 25} tuổi
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-extrabold bg-[#F0FAF5] text-[#0D7A53]">
                <strong className="text-sm font-black">{grade}</strong>
                <span>{gradeComment}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6F686B] leading-relaxed pt-1">{assessment}</p>
            </div>
          </div>

          {/* 12 Indicators Section */}
          <section className="profile-report-section profile-report-metrics p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-[300px] flex items-center justify-center">
                <RadarChart values={metrics.health} />
              </div>
              <div className="w-full md:w-1/2 space-y-3.5">
                <span className="text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block">Sinh học tế bào da</span>
                <h4 className="font-extrabold text-[#282326] text-lg">Cấu Trúc Đa Tầng Của Làn Da</h4>
                <p className="text-xs text-[#6F686B] leading-relaxed">
                  Vùng co vào tâm biểu hiện rào cản cần được tập trung bù ẩm, củng cố hàng rào lipid và phục hồi mô đệm.
                </p>
                {ranked.slice(0, 2).map((metric, index) => (
                  <div key={metric.name} className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold ${index ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FFF0F4] text-[#BD3F5B]'}`}>
                    <strong>{metric.name}</strong> ({metric.score}/100) cần được theo dõi sát trong routine 28 ngày.
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  {concerns.map((concern) => (
                    <span key={concern} className="bg-[#FFF0F4] text-[#E06D81] text-xs font-extrabold px-3 py-1 rounded-full">
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#F0ECEE]">
              <h5 className="font-extrabold text-xs sm:text-sm text-[#282326] mb-4">Chi Tiết 12 Chỉ Số Cấu Trúc Đa Tầng</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {metrics.health.map((score, index) => {
                  const theme = metricTheme(score);
                  return (
                    <div key={detailedMetricNames[index]} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#282326]">{detailedMetricNames[index]}</span>
                        <strong className={theme.text}>{score}/100</strong>
                      </div>
                      <div className="w-full bg-[#F0ECEE] rounded-full h-2 overflow-hidden">
                        <div className={`${theme.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5 Core Metrics Accordion */}
          <section className="profile-report-section profile-report-core p-6 sm:p-8 space-y-4">
            <div className="mb-2">
              <span className="text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1">Đánh giá chuyên sâu</span>
              <h4 className="font-extrabold text-[#282326] text-lg">Đánh Giá Chi Tiết 5 Chỉ Số Cốt Lõi</h4>
            </div>

            <div className="space-y-3">
              {metrics.core.map((metric) => {
                const preset = adviceByMetric[metric.id];
                const custom = analysis.detailedAdvice?.[metric.id] || {};
                const theme = metricTheme(metric.healthScore);
                return (
                  <details key={metric.id} className="rounded-2xl overflow-hidden p-1 transition-all">
                    <summary className="p-4 cursor-pointer list-none flex items-center justify-between select-none">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${theme.bar}`}></span>
                        <div>
                          <p className="font-extrabold text-[#282326] text-sm">{preset.name}</p>
                          <p className={`${theme.text} text-xs font-bold`}>{metric.rawScore}% · {theme.label}</p>
                        </div>
                      </div>
                      <span className="text-[#6F686B] text-lg font-bold">⌄</span>
                    </summary>
                    <div className="p-4 pt-2 text-xs text-[#6F686B] space-y-2 border-t border-[#F0ECEE]/60">
                      <p><strong className="text-[#282326]">Vì sao? </strong>{custom.why || preset.why}</p>
                      <p><strong className="text-[#282326]">Nên làm: </strong>{custom.shouldDo || preset.shouldDo}</p>
                      <p><strong className="text-[#282326]">Cần tránh: </strong>{custom.avoid || preset.avoid}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          {/* Routine Section */}
          <SkincareRoutineSection scan={scan} />
        </div>

        {/* Modal Sticky Footer */}
        <div className="profile-report-footer sticky bottom-0 flex flex-wrap items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => exportUserPdfReport({ scan, user })}
              className="profile-action profile-action--quiet"
            >
              <svg className="w-4 h-4 text-[#FF7893]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Xuất Báo Cáo PDF</span>
            </button>
            <a href="/skin-analysis" className="profile-action profile-action--secondary">
              Soi da mới
            </a>
          </div>
          <button type="button" onClick={close} className="profile-action profile-action--ghost">
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
