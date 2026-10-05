import { useEffect, useMemo, useState, useRef } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useCart } from '../../features/cart/index.js';
import { useCatalog } from '../../features/catalog/index.js';
import { FEATURED_PRODUCT_IDS } from '../../features/catalog/featuredProducts.js';
import { routineImageBounds } from '../../features/catalog/routineImageBounds.js';
import useMotionAwareVisibility from '../../hooks/useMotionAwareVisibility.js';

const ROUTINE_DATA = {
  'rilastil-525': {
    stepNum: '02',
    stepLabel: 'BƯỚC 02 · TINH CHẤT NGÔI SAO',
    headline: 'Tinh Chất Cấp Ẩm Chuyên Sâu Rilastil Aqua Intense Gel Serum',
    desc: 'Công thức chuẩn dược mỹ phẩm Ý với phức hợp Hyaluronic Acid đa tầng, kích hoạt khả năng ngậm nước tự nhiên và mang lại độ căng mọng 72 giờ.',
    roleTag: 'Star Product · Cấp Ẩm Đa Tầng',
    satelliteLabel: '02 · Điều trị',
  },
  'rilastil-1774': {
    stepNum: '01',
    stepLabel: 'BƯỚC 01 · LÀM SẠCH DỊU LÀNH',
    headline: 'Sữa Rửa Mặt Dưỡng Ẩm Rilastil Aqua Face Cleanser',
    desc: 'Làm sạch sâu từng lỗ chân lông mà vẫn bảo toàn lớp màng lipid sinh học, chuẩn bị nền da hoàn hảo đón nhận dưỡng chất.',
    roleTag: 'Khởi Đầu Dịu Nhẹ · Ceramide',
    satelliteLabel: '01 · Làm sạch',
  },
  'rilastil-2067': {
    stepNum: '03',
    stepLabel: 'BƯỚC 03 · KHÓA ẨM CHUYÊN SÂU',
    headline: 'Kem Cấp Ẩm Chuyên Sâu 72H Rilastil Aqua Intense Gel',
    desc: 'Màng ẩm nhung lụa tạo lớp khiên vô hình chống mất nước qua biểu bì, nuôi dưỡng tế bào da căng tràn sức sống.',
    roleTag: 'Khóa Ẩm 72H · Hydraboost',
    satelliteLabel: '03 · Khóa ẩm',
  },
  'rilastil-1857': {
    stepNum: '04',
    stepLabel: 'BƯỚC 04 · BẢO VỆ MỖI NGÀY',
    headline: 'Kem Chống Nắng Cấp Ẩm Rilastil Sun System Water Touch SPF 50+',
    desc: 'Kết cấu Water Touch mỏng nhẹ như làn sương, bảo vệ tối ưu trước tia UV và ánh sáng xanh, ngăn ngừa đốm nâu sớm.',
    roleTag: 'Phổ Rộng SPF 50+ · Kháng Tia Xanh',
    satelliteLabel: '04 · Bảo vệ',
  },
};

const ROUTINE_STEPS = [
  { id: 'cleanser', number: '01', shortLabel: 'Làm sạch', title: 'Làm sạch dịu lành' },
  { id: 'treatment', number: '02', shortLabel: 'Điều trị', title: 'Tinh chất & đặc trị' },
  { id: 'moisturizer', number: '03', shortLabel: 'Khóa ẩm', title: 'Dưỡng ẩm chuyên sâu' },
  { id: 'sunscreen', number: '04', shortLabel: 'Bảo vệ', title: 'Chống nắng mỗi ngày' },
];

function formatProductHeadline(raw) {
  if (!raw || typeof raw !== 'string') return { title: raw || '', subtitle: null };

  const dashMatch = raw.split(/\s+[–—―-]\s+/);
  if (dashMatch.length === 2) {
    const [p1, p2] = dashMatch;
    const brandRegex = /\b(rilastil|twon|d'vah|dvah)\b/i;
    if (brandRegex.test(p2) && !brandRegex.test(p1)) {
      return { title: p2.trim(), subtitle: p1.trim() };
    }
    if (brandRegex.test(p1)) {
      return { title: p1.trim(), subtitle: p2.trim() };
    }
    return { title: p2.trim(), subtitle: p1.trim() };
  }

  const brandIndex = raw.search(/\b(Rilastil|TWON|D’VAH|D'VAH)\b/i);
  if (brandIndex > 0) {
    const funcPart = raw.slice(0, brandIndex).trim();
    const brandPart = raw.slice(brandIndex).trim();
    if (funcPart && brandPart) {
      return { title: brandPart, subtitle: funcPart };
    }
  }

  return { title: raw, subtitle: null };
}

const FEATURED_PRIORITY = new Map(FEATURED_PRODUCT_IDS.map((id, index) => [id, index]));

export default function FeaturedProducts() {
  const { products: catalog } = useCatalog();
  const [heroId, setHeroId] = useState('rilastil-1774');
  const [activeStepId, setActiveStepId] = useState('cleanser');
  const sectionRef = useRef(null);
  const isVisible = useMotionAwareVisibility(sectionRef);

  const productsByStep = useMemo(() => Object.fromEntries(ROUTINE_STEPS.map((step) => {
    const products = catalog
      .filter(product => product.brandSlug === 'rilastil' && product.stepType === step.id && product.image && product.price)
      .sort((a, b) => {
        const aPriority = FEATURED_PRIORITY.has(a.id) ? FEATURED_PRIORITY.get(a.id) : 99;
        const bPriority = FEATURED_PRIORITY.has(b.id) ? FEATURED_PRIORITY.get(b.id) : 99;
        return aPriority - bPriority;
      })
      .slice(0, 4);
    return [step.id, products];
  })), [catalog]);

  const featuredProducts = useMemo(
    () => ROUTINE_STEPS.flatMap(step => productsByStep[step.id] || []),
    [productsByStep]
  );
  const activeStep = ROUTINE_STEPS.find(step => step.id === activeStepId) || ROUTINE_STEPS[0];
  const activeStepProducts = productsByStep[activeStep.id] || [];

  useEffect(() => {
    featuredProducts.forEach((product) => {
      const image = new Image();
      image.src = assetUrl(product.image, product.brandSlug);
      image.decode?.().catch(() => {});
    });
  }, [featuredProducts]);

  const { addToCart } = useCart();

  // Ellipse orbital refs
  const stageRef = useRef(null);
  const svgEllipseRef = useRef(null);
  const itemsRef = useRef([]);
  const positionsRef = useRef([]);
  const rafIdRef = useRef(null);
  const requestRef = useRef(0);
  const activeIdxRef = useRef(0);
  const touchRef = useRef(null);

  const targetsFor = (selected) => {
    const count = activeStepProducts.length;
    const slots = count === 4 ? [0.52, 0.89, 0.09, 0.28]
      : count === 3 ? [0.5, 0.86, 0.14]
      : count === 2 ? [0.5, 0.85] : [0.5];
    return activeStepProducts.map((_, index) => ({
      x: slots[(index - selected + count) % count],
      scale: index === selected ? 1 : 0.5
    }));
  };

  const renderPositions = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const imageHeight = Math.min(mobile ? 250 : 350, width * 0.57);
    const bottom = height - (mobile ? 50 : 64);
    const rise = mobile ? 62 : 90;
    const curveY = (x) => bottom - rise * Math.pow((x - 0.52) / 0.45, 2);

    if (svgEllipseRef.current) {
      const svg = svgEllipseRef.current.ownerSVGElement;
      if (svg) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      let path = '';
      for (let j = 0; j <= 60; j++) {
        const x = 0.04 + j / 60 * 0.92;
        path += `${j ? ' L' : 'M'} ${(x * width).toFixed(2)} ${curveY(x).toFixed(2)}`;
      }
      svgEllipseRef.current.setAttribute('d', path);
    }

    positionsRef.current.forEach((position, index) => {
      const item = itemsRef.current[index];
      if (!item) return;
      const image = item.querySelector('img');
      const name = decodeURIComponent((image?.getAttribute('src') || '').split('/').pop().split('?')[0]);
      const bounds = routineImageBounds[name] || { x: 0, y: 0, w: 1, h: 1, ratio: 0.625 };
      const fullHeight = imageHeight / bounds.h;
      const fullWidth = fullHeight * bounds.ratio;
      const imageWidth = fullWidth * bounds.w;
      item.style.width = `${imageWidth}px`;
      item.style.height = `${imageHeight}px`;
      item.style.transform = `translate3d(${position.x * width - imageWidth / 2}px, ${curveY(position.x) - imageHeight}px, 0) scale(${position.scale})`;
      item.style.zIndex = String(Math.round(position.scale * 100));
      if (image) {
        image.style.width = `${fullWidth}px`;
        image.style.height = `${fullHeight}px`;
        image.style.left = `${-bounds.x * fullWidth}px`;
        image.style.top = `${-bounds.y * fullHeight}px`;
        image.style.clipPath = `inset(${bounds.y * 100}% ${(1 - bounds.x - bounds.w) * 100}% ${(1 - bounds.y - bounds.h) * 100}% ${bounds.x * 100}%)`;
      }
    });
  };

  useEffect(() => {
    requestRef.current++;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    const index = Math.max(0, activeStepProducts.findIndex(product => product.id === heroId));
    activeIdxRef.current = index;
    positionsRef.current = targetsFor(index);
    renderPositions();
    const observer = new ResizeObserver(renderPositions);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => {
      observer.disconnect();
      requestRef.current++;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [activeStep.id, activeStepProducts]);

  const handleProductSelect = async (clickedId, clickedIdx) => {
    const request = ++requestRef.current;
    if (clickedIdx === activeIdxRef.current) return;
    const image = itemsRef.current[clickedIdx]?.querySelector('img');
    if (image?.decode) {
      try { await image.decode(); } catch { /* Image decode fallback */ }
    }
    if (request !== requestRef.current) return;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    activeIdxRef.current = clickedIdx;
    setHeroId(clickedId);
    const start = positionsRef.current.map(position => ({ ...position }));
    const target = targetsFor(clickedIdx);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      positionsRef.current = target;
      renderPositions();
      return;
    }
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / 650);
      const eased = progress * progress * (3 - 2 * progress);
      positionsRef.current = target.map((position, index) => ({
        x: start[index].x + (position.x - start[index].x) * eased,
        scale: start[index].scale + (position.scale - start[index].scale) * eased
      }));
      renderPositions();
      rafIdRef.current = progress < 1 ? requestAnimationFrame(tick) : null;
    };
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const handleStepChange = (stepId) => {
    if (stepId === activeStepId) return;
    requestRef.current++;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = null;
    setActiveStepId(stepId);
    const first = productsByStep[stepId]?.[0];
    if (first) setHeroId(first.id);
  };

  const handleTouchStart = (event) => {
    touchRef.current = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  const handleTouchEnd = (event) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || !event.changedTouches.length || activeStepProducts.length < 2) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      const index = (activeIdxRef.current + (dx < 0 ? 1 : -1) + activeStepProducts.length) % activeStepProducts.length;
      handleProductSelect(activeStepProducts[index].id, index);
    }
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    addToCart(productId);
  };

  const handleOpenDetail = (productId) => {
    document.dispatchEvent(new CustomEvent('skinid:open-product-detail', {
      detail: { productId },
    }));
  };

  const heroProduct = featuredProducts.find(p => p.id === heroId) || featuredProducts[0];
  const heroStep = ROUTINE_STEPS.find(step => step.id === heroProduct?.stepType) || activeStep;
  const heroStory = heroProduct ? (ROUTINE_DATA[heroProduct.id] || {
    stepNum: heroStep.number,
    stepLabel: `BƯỚC ${heroStep.number} · ${heroStep.title.toUpperCase()}`,
    headline: window.productDisplayName?.(heroProduct) || heroProduct.name,
    desc: heroProduct.uses || 'Chăm sóc làn da dịu lành mỗi ngày.',
    roleTag: [heroProduct.line, heroProduct.tier].filter(Boolean).join(' · ') || 'Dược Mỹ Phẩm Ý',
    satelliteLabel: `${heroStep.number} · ${heroStep.shortLabel}`,
  }) : null;
  const formattedHeadline = formatProductHeadline(heroStory?.headline);

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className={`section home-anchor-scene borderless-hero-showcase ${isVisible ? 'is-visible' : ''}`}
      aria-label="Sản phẩm nổi bật"
    >
      <div className="container relative z-10 routine-home">
        <header className="routine-home__intro">
          <span className="hero-showcase-tagline skinid-editorial-kicker" data-reveal data-reveal-delay="0">ROUTINE ĐƯỢC TUYỂN CHỌN</span>
          <div className="routine-home__intro-row">
            <h2 className="skinid-editorial-title skinid-editorial-title--routine" data-reveal data-reveal-delay="90">Chăm da theo nhịp. <em>Nhẹ nhàng mà đúng.</em></h2>
            <p data-reveal data-reveal-delay="180">Một routine bốn bước rõ ràng, được sắp xếp để làn da nhận đúng điều mình cần vào đúng thời điểm.</p>
          </div>
        </header>

        {featuredProducts.length === 0 ? (
          <div className="borderless-loading">Đang chuẩn bị routine dành cho bạn…</div>
        ) : (
          <>
            <div className="routine-step-nav" role="tablist" aria-label="Chọn bước chăm sóc">
              {ROUTINE_STEPS.map((step) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={step.id === activeStep.id}
                  className={`routine-step-nav__item ${step.id === activeStep.id ? 'is-active' : ''}`}
                  key={step.id}
                  onMouseEnter={() => handleStepChange(step.id)}
                  onFocus={() => handleStepChange(step.id)}
                  onClick={() => handleStepChange(step.id)}
                >
                  <small>{step.number}</small>
                  <span><b>{step.shortLabel}</b><em>{step.title}</em></span>
                </button>
              ))}
            </div>

            <div className="routine-stage routine-stage--focused">
              <div className="routine-stage__copy" aria-live="polite">
                <span className="routine-stage__step" data-reveal data-reveal-delay="0">
                  <span key={`step-${heroProduct?.id}`} className="routine-swap-text">{heroStory?.stepLabel}</span>
                </span>
                <h3 data-reveal data-reveal-delay="80">
                  <span key={`headline-${heroProduct?.id}`} className="routine-swap-text">
                    {formattedHeadline.subtitle ? (
                      <span className="routine-headline-wrap">
                        <span className="routine-headline__title">{formattedHeadline.title}</span>
                        <span className="routine-headline__subtitle">{formattedHeadline.subtitle}</span>
                      </span>
                    ) : (
                      formattedHeadline.title
                    )}
                  </span>
                </h3>
                <p data-reveal data-reveal-delay="160">
                  <span key={`desc-${heroProduct?.id}`} className="routine-swap-text">{heroStory?.desc}</span>
                </p>
                <div className="hero-showcase-meta" data-reveal data-reveal-delay="240">
                  <span key={`meta-${heroProduct?.id}`} className="routine-swap-meta">
                    <span className="hero-meta-badge">{heroStory?.roleTag}</span>
                    <span className="routine-stage__volume">{heroProduct?.volume}</span>
                  </span>
                </div>
                <div className="hero-showcase-actions" data-reveal data-reveal-delay="320">
                  {heroProduct && (
                    <button
                      type="button"
                      className="hero-pill-btn hero-pill-btn--primary"
                      onClick={(e) => handleAddToCart(e, heroProduct.id)}
                      aria-label={`Thêm ${heroProduct.name} vào giỏ hàng`}
                    >
                      Thêm vào giỏ · {heroProduct.price?.toLocaleString('vi-VN')}₫
                    </button>
                  )}
                  {heroProduct && (
                    <button
                      type="button"
                      className="routine-text-link"
                      onClick={() => handleOpenDetail(heroProduct.id)}
                    >
                      Xem chi tiết <span aria-hidden="true">↗</span>
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={stageRef}
                className="routine-stage__product routine-ellipse-stage"
                data-reveal="soft-scale"
                data-reveal-delay="220"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => { touchRef.current = null; }}
                onKeyDown={(event) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !activeStepProducts.length) return;
                  event.preventDefault();
                  const index = event.key === 'Home' ? 0 : event.key === 'End' ? activeStepProducts.length - 1
                    : (activeIdxRef.current + (event.key === 'ArrowRight' ? 1 : -1) + activeStepProducts.length) % activeStepProducts.length;
                  handleProductSelect(activeStepProducts[index].id, index);
                  itemsRef.current[index]?.focus({ preventScroll: true });
                }}
              >
                <svg
                  className="routine-ellipse-svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="routine-ellipse-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e06d81" stopOpacity="0.04" />
                      <stop offset="20%" stopColor="#e06d81" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#e06d81" stopOpacity="0.85" />
                      <stop offset="80%" stopColor="#e06d81" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#e06d81" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>
                  <path
                    ref={svgEllipseRef}
                    fill="none"
                    stroke="url(#routine-ellipse-line)"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                    opacity="0.75"
                  />
                </svg>

                {activeStepProducts.map((product, index) => {
                  const isActive = product.id === heroId;
                  return (
                    <button
                      key={product.id}
                      ref={(el) => { itemsRef.current[index] = el; }}
                      type="button"
                      className={`routine-ellipse-item${isActive ? ' is-active' : ''}`}
                      onClick={() => handleProductSelect(product.id, index)}
                      aria-label={`${product.name} (Bước ${activeStep.number})`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <img
                        className="routine-ellipse-img"
                        src={assetUrl(product.image, product.brandSlug)}
                        alt={product.name}
                        loading="eager"
                        decoding="async"
                      />
                    </button>
                  );
                })}

                <div className="routine-arc-caption">
                  Chạm hoặc chọn sản phẩm để xoay về tâm điểm
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
