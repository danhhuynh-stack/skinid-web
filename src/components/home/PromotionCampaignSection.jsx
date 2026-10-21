import React, { useState, useEffect } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useCart } from '../../features/cart/index.js';
import '../../styles/promotion-campaign.css';

const COMBOS = [
  {
    id: 'combo-nang-xinh',
    name: 'Combo Nàng Xinh',
    headline: 'DƯỠNG TRẮNG TOÀN DIỆN',
    badge: 'BEST SELLER · TIẾT KIỆM 25%',
    isFeatured: true,
    desc: 'Giải pháp dưỡng trắng hoàn hảo từ bước làm sạch, tẩy tế bào chết chuyên sâu đến khóa ẩm trắng hồng ngậm nước.',
    items: [
      { name: '01 Kem body dưỡng trắng TWON', volume: '250ml', price: '279.000₫' },
      { name: '01 Kem ủ trắng thảo mộc TWON', volume: '250ml', price: '249.000₫' },
      { name: '01 Sữa tắm dưỡng da lưu hương TWON', volume: '450ml', price: '179.000₫' },
    ],
    originalPrice: 707000,
    price: 529000,
    savings: 178000,
    image: '/images/products/combos/combo-1-nang-xinh.jpg'
  },
  {
    id: 'combo-nang-quyen-ru',
    name: 'Combo Nàng Quyến Rũ',
    headline: 'HƯƠNG NƯỚC HOA SANG TRỌNG',
    badge: 'HOT TREND · TIẾT KIỆM 22%',
    isFeatured: false,
    desc: 'Bộ đôi dưỡng thể mềm mịn kết hợp nước hoa Kamal phương Đông ấm ngọt quyến rũ, lưu lại dấu ấn khó phai.',
    items: [
      { name: '01 Kem body dưỡng trắng TWON', volume: '250ml', price: '279.000₫' },
      { name: '01 Sữa tắm dưỡng da TWON', volume: '450ml', price: '179.000₫' },
      { name: '01 Nước hoa Mini D\'VAH KAMAL (Ấm ngọt, quyến rũ)', volume: '10ml', price: '179.000₫' },
    ],
    originalPrice: 637000,
    price: 499000,
    savings: 138000,
    image: '/images/products/combos/combo-2-nang-quyen-ru.jpg'
  },
  {
    id: 'combo-nang-thom',
    name: 'Combo Nàng Thơm',
    headline: 'THƠM MỀM QUYẾN RŨ',
    badge: 'ĐƯỢC YÊU THÍCH · TIẾT KIỆM 18%',
    isFeatured: false,
    desc: 'Làn da trắng hồng mượt mà hòa quyện cùng nốt hương gỗ tuyết tùng Tanmaya trầm ấm, thanh lịch suốt ngày dài.',
    items: [
      { name: '01 Kem ủ trắng thảo mộc TWON', volume: '250ml', price: '249.000₫' },
      { name: '01 Sữa tắm dưỡng da TWON', volume: '450ml', price: '179.000₫' },
      { name: '01 Nước hoa Mini D\'VAH TANMAYA (Trầm ấm, cuốn hút)', volume: '10ml', price: '179.000₫' },
    ],
    originalPrice: 607000,
    price: 499000,
    savings: 108000,
    image: '/images/products/combos/combo-3-nang-thom.jpg'
  }
];

const PERFUME_VARIANTS = [
  { id: 'deal50-dvah-kamal', name: 'Kamal', mood: 'Ấm ngọt, quyến rũ', image: '/images/products/dvah-kamal.png' },
  { id: 'deal50-dvah-malini', name: 'Malini', mood: 'Hoa sen thuần khiết', image: '/images/products/dvah-malini.png' },
  { id: 'deal50-dvah-sarika', name: 'Sarika', mood: 'Ngọt ngào, sang trọng', image: '/images/products/dvah-sarika.png' },
  { id: 'deal50-dvah-tanmaya', name: 'Tanmaya', mood: 'Gỗ trầm ấm, bí ẩn', image: '/images/products/dvah-tanmaya.png' },
];

export default function PromotionCampaignSection() {
  const { addToCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [activePerfume, setActivePerfume] = useState(PERFUME_VARIANTS[0]);

  // Flash Sale Live Timer - Đồng bộ thời gian thực tế đến hết ngày hôm nay (23:59:59)
  const calculateRealTimeLeft = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRealTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateRealTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (id) => {
    addToCart(id, 1, { openDrawer: true });
    setAddedId(id);
    setTimeout(() => {
      setAddedId((current) => (current === id ? null : current));
    }, 1800);
  };

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + '₫';

  return (
    <section id="khuyen-mai" className="promo-campaign-section">
      <div className="promo-campaign-container">
        
        {/* BANNER HEADER CHIẾN DỊCH */}
        <div className="promo-header">
          <div className="promo-badge-pill">
            <span className="promo-pulse-dot"></span>
            SIÊU DEAL ĐỘC QUYỀN SKINID · TIẾT KIỆM ĐẾN 50%
          </div>

          <h2 className="promo-title">
            LIKE &amp; SHARE <span className="promo-title-accent">SĂN DEAL GIẢM 50%</span>
          </h2>
          
          <p className="promo-subtitle">
            Yêu thương bản thân, đẹp hơn mỗi ngày cùng <strong>SkinID &amp; TWON - D'VAH</strong>! Thưởng trọn combo dưỡng trắng chuyên sâu &amp; hương nước hoa cao cấp với mức giá ưu đãi chưa từng có.
          </p>

          <div className="promo-action-bar">
            <div className="promo-countdown-wrap">
              <span className="promo-timer-label">Flash Sale Kết Thúc Sau:</span>
              <div className="promo-timer-boxes">
                <span className="promo-timer-box">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="promo-timer-sep">:</span>
                <span className="promo-timer-box">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="promo-timer-sep">:</span>
                <span className="promo-timer-box">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="promo-divider-vertical"></div>

            <div 
              className="promo-voucher-chip is-promo-info"
              title="Khám phá và áp dụng voucher trực tiếp tại giỏ hàng"
            >
              <span className="promo-voucher-text">Mã ưu đãi:</span>
              <span className="promo-voucher-code">Gợi ý tại Giỏ hàng</span>
              <span className="promo-copy-btn" aria-hidden="true">
                1-Chạm 🎟️
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            KHU VỰC 1: 3 GÓI COMBO KHUYẾN MÃI (ƯU TIÊN ĐẦU TIÊN)
           ======================================================== */}
        <div className="promo-block">
          <div className="promo-block-header">
            <span className="promo-block-badge">BỘ SƯU TẬP TRỌN VẸN</span>
            <h3 className="promo-block-title">3 Gói Combo Ưu Đãi Đặc Quyền</h3>
            <p className="promo-block-desc">
              Tiết kiệm đến <strong>178.000₫</strong> khi đặt mua trọn bộ combo chăm sóc da chuyên sâu hôm nay.
            </p>
          </div>

          <div className="promo-combo-grid">
            {COMBOS.map((combo) => (
              <article key={combo.id} className={`promo-combo-card ${combo.isFeatured ? 'is-featured' : ''}`}>
                <div className="promo-card-tag">{combo.badge}</div>

                <div className="promo-combo-visual">
                  <img 
                    src={assetUrl(combo.image)} 
                    alt={combo.name} 
                    className="promo-combo-hero-img"
                    loading="lazy"
                  />
                </div>

                <div className="promo-combo-meta">
                  <span className="promo-combo-category">{combo.headline}</span>
                  <h4 className="promo-combo-name">{combo.name}</h4>
                  <p className="promo-combo-subtitle">{combo.desc}</p>

                  <div className="promo-items-list">
                    {combo.items.map((it, i) => (
                      <div key={i} className="promo-item-row">
                        <span className="promo-item-check">✓</span>
                        <span>{it.name} <small className="text-gray-500 font-medium">({it.volume})</small></span>
                      </div>
                    ))}
                    <div className="promo-item-gift">
                      🎁 Kèm Túi Quà SkinID Phái Đẹp · 100% Chính Hãng
                    </div>
                  </div>

                  <div className="promo-price-box">
                    <div className="promo-price-row">
                      <span className="promo-price-main">{formatVND(combo.price)}</span>
                      <span className="promo-price-original">{formatVND(combo.originalPrice)}</span>
                    </div>
                    <span className="promo-savings-badge">
                      Tiết kiệm {formatVND(combo.savings)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`promo-btn-cta ${addedId === combo.id ? 'is-added' : ''}`}
                    onClick={() => handleAddToCart(combo.id)}
                    aria-label={`Đặt mua ${combo.name}`}
                  >
                    <span>{addedId === combo.id ? '✓ Đã Thêm Vào Giỏ!' : `Đặt Mua ${combo.name}`}</span>
                    <span aria-hidden="true">{addedId === combo.id ? '✨' : '→'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ========================================================
            KHU VỰC 2: 4 SẢN PHẨM BÁN LẺ FLASH SALE 50%
           ======================================================== */}
        <div className="promo-block">
          <div className="promo-block-header">
            <span className="promo-block-badge">FLASH SALE DEAL KHỦNG</span>
            <h3 className="promo-block-title">Sản Phẩm Bán Lẻ Giảm Giá 50%</h3>
            <p className="promo-block-desc">
              Chỉ áp dụng khi Like &amp; Share Fanpage · Số lượng giới hạn 50 suất mỗi ngày!
            </p>
          </div>

          <div className="promo-singles-grid">
            
            {/* SP 1: Sữa tắm TWON 450ml */}
            <article className="promo-single-card">
              <span className="promo-sale-discount-flag">-50%</span>
              <div className="promo-single-visual">
                <img src={assetUrl('/images/products/twon-sua-tam.png')} alt="Sữa Tắm Dưỡng Da TWON 450ml" loading="lazy" />
              </div>
              <span className="promo-single-brand">TWON BODY · 450ML</span>
              <h4 className="promo-single-name">Sữa Tắm Dưỡng Da TWON</h4>
              <p className="promo-single-desc">Làm sạch dịu nhẹ, lưu hương nước hoa thư giãn, cấp ẩm không nhờn rít.</p>
              
              <div className="promo-single-prices">
                <span className="promo-single-deal-price">89.500₫</span>
                <span className="promo-single-orig-price">179.000₫</span>
              </div>

              <button
                type="button"
                className={`promo-btn-single-cart ${addedId === 'deal50-twon-sua-tam' ? 'is-added' : ''}`}
                onClick={() => handleAddToCart('deal50-twon-sua-tam')}
                aria-label="Thêm Sữa Tắm TWON vào giỏ"
              >
                <span>{addedId === 'deal50-twon-sua-tam' ? '✓ Đã Thêm Vào Giỏ' : '🛒 + Thêm Vào Giỏ'}</span>
              </button>
            </article>

            {/* SP 2: Kem body TWON 250ml */}
            <article className="promo-single-card">
              <span className="promo-sale-discount-flag">-50%</span>
              <div className="promo-single-visual">
                <img src={assetUrl('/images/products/twon-body-lotion.png')} alt="Kem Body Dưỡng Trắng TWON 250ml" loading="lazy" />
              </div>
              <span className="promo-single-brand">TWON BODY · 250ML</span>
              <h4 className="promo-single-name">Kem Body Dưỡng Trắng TWON</h4>
              <p className="promo-single-desc">Thấm nhanh 3 giây, bật tone tự nhiên, chống nắng bảo vệ và không lộ vân kem.</p>
              
              <div className="promo-single-prices">
                <span className="promo-single-deal-price">139.500₫</span>
                <span className="promo-single-orig-price">279.000₫</span>
              </div>

              <button
                type="button"
                className={`promo-btn-single-cart ${addedId === 'deal50-twon-body' ? 'is-added' : ''}`}
                onClick={() => handleAddToCart('deal50-twon-body')}
                aria-label="Thêm Kem Body TWON vào giỏ"
              >
                <span>{addedId === 'deal50-twon-body' ? '✓ Đã Thêm Vào Giỏ' : '🛒 + Thêm Vào Giỏ'}</span>
              </button>
            </article>

            {/* SP 3: Kem ủ trắng TWON 250ml */}
            <article className="promo-single-card">
              <span className="promo-sale-discount-flag">-50%</span>
              <div className="promo-single-visual">
                <img src={assetUrl('/images/products/twon-kem-u-trang.png')} alt="Ủ Trắng Thảo Mộc TWON 250ml" loading="lazy" />
              </div>
              <span className="promo-single-brand">TWON BODY · 250ML</span>
              <h4 className="promo-single-name">Kem Ủ Trắng Thảo Mộc TWON</h4>
              <p className="promo-single-desc">Bạt sừng dịu nhẹ, tái tạo da cháy nắng, giúp da trắng hồng rạng rỡ.</p>
              
              <div className="promo-single-prices">
                <span className="promo-single-deal-price">124.500₫</span>
                <span className="promo-single-orig-price">249.000₫</span>
              </div>

              <button
                type="button"
                className={`promo-btn-single-cart ${addedId === 'deal50-twon-u-trang' ? 'is-added' : ''}`}
                onClick={() => handleAddToCart('deal50-twon-u-trang')}
                aria-label="Thêm Kem Ủ Trắng TWON vào giỏ"
              >
                <span>{addedId === 'deal50-twon-u-trang' ? '✓ Đã Thêm Vào Giỏ' : '🛒 + Thêm Vào Giỏ'}</span>
              </button>
            </article>

            {/* SP 4: Nước hoa Mini D'VAH 10ml (4 Mùi Hương) */}
            <article className="promo-single-card">
              <span className="promo-sale-discount-flag">-50%</span>
              <div className="promo-single-visual">
                <img src={assetUrl(activePerfume.image)} alt={`Nước hoa D'VAH ${activePerfume.name}`} loading="lazy" />
              </div>
              <span className="promo-single-brand">D'VAH PERFUME · 10ML EDP</span>
              <h4 className="promo-single-name">Nước Hoa Mini 10ml D'VAH</h4>
              
              <div className="promo-scent-tabs" role="tablist" aria-label="Chọn mùi nước hoa">
                {PERFUME_VARIANTS.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`promo-scent-pill ${activePerfume.id === variant.id ? 'is-active' : ''}`}
                    onClick={() => setActivePerfume(variant)}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>

              <p className="promo-single-desc">
                Hương thơm đã chọn: <strong>{activePerfume.name}</strong> — {activePerfume.mood}. Lưu hương 8-12 tiếng.
              </p>
              
              <div className="promo-single-prices">
                <span className="promo-single-deal-price">89.500₫</span>
                <span className="promo-single-orig-price">179.000₫</span>
              </div>

              <button
                type="button"
                className={`promo-btn-single-cart ${addedId === activePerfume.id ? 'is-added' : ''}`}
                onClick={() => handleAddToCart(activePerfume.id)}
                aria-label={`Thêm Nước Hoa D'VAH ${activePerfume.name} vào giỏ`}
              >
                <span>{addedId === activePerfume.id ? '✓ Đã Thêm Vào Giỏ' : `🛒 + Chọn ${activePerfume.name}`}</span>
              </button>
            </article>

          </div>
        </div>

        {/* ========================================================
            KHU VỰC 3: THỂ LỆ SĂN DEAL & CAM KẾT CHÍNH HÃNG
           ======================================================== */}
        <div className="promo-rules-card">
          <div>
            <h3 className="promo-rules-title">3 Bước Đơn Giản Nhận Deal 50%</h3>
            <div className="promo-rules-steps">
              <div className="promo-step-item">
                <div className="promo-step-num">1</div>
                <div className="promo-step-text">
                  <strong>Like &amp; Follow</strong> Fanpage chính thức <em>SkinID — Chăm Sóc Da &amp; Nước Hoa Cao Cấp</em>.
                </div>
              </div>
              <div className="promo-step-item">
                <div className="promo-step-num">2</div>
                <div className="promo-step-text">
                  <strong>Chia sẻ công khai</strong> bài viết chiến dịch trên trang cá nhân kèm hashtag <code>#SkinID #TWON #DVAH</code>.
                </div>
              </div>
              <div className="promo-step-item">
                <div className="promo-step-num">3</div>
                <div className="promo-step-text">
                  Nhập mã <strong>SKINID50</strong> khi đặt hàng trực tiếp trên website hoặc để lại thông tin để tư vấn viên áp deal tự động!
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="promo-benefits-grid">
              <div className="promo-benefit-item">
                <div className="promo-benefit-icon">🛡️</div>
                <div className="promo-benefit-title">100% Chính Hãng</div>
                <div className="promo-benefit-sub">Có tem niêm phong chống giả và phiếu bảo hành chính hãng.</div>
              </div>
              <div className="promo-benefit-item">
                <div className="promo-benefit-icon">🚚</div>
                <div className="promo-benefit-title">Giao Hàng Toàn Quốc</div>
                <div className="promo-benefit-sub">Đóng gói chống sốc an toàn, giao hàng nhanh 2-3 ngày toàn quốc.</div>
              </div>
              <div className="promo-benefit-item">
                <div className="promo-benefit-icon">📦</div>
                <div className="promo-benefit-title">Đồng Kiểm Khi Nhận</div>
                <div className="promo-benefit-sub">Kiểm tra đúng sản phẩm và quy cách đóng gói trước khi thanh toán.</div>
              </div>
              <div className="promo-benefit-item">
                <div className="promo-benefit-icon">📞</div>
                <div className="promo-benefit-title">Hỗ Trợ 24/7</div>
                <div className="promo-benefit-sub">Hotline / Zalo tư vấn miễn phí: <strong>0924.093.461</strong>.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
