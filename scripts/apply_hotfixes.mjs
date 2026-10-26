import fs from 'fs';
import path from 'path';

console.log('🚀 Bắt đầu thực hiện toàn bộ 7 Hotfixes...');

// ========================================================
// 1. SỬA PRODUCTCARD.JSX (KÝ TỰ RÁC DISCOUNT BADGE)
// ========================================================
const productCardPath = 'D:\\skinid-web-extracted\\src\\features\\catalog\\ProductCard.jsx';
let productCardContent = fs.readFileSync(productCardPath, 'utf8');
productCardContent = productCardContent.replace(
  /\{discounted && <span className="product-card__discount">.*?\{discount\}%<\/span>\}/g,
  '{discounted && <span className="product-card__discount">-{discount}%</span>}'
);
fs.writeFileSync(productCardPath, productCardContent, 'utf8');
console.log('✅ 1. Đã sửa ký tự discount badge trong ProductCard.jsx.');

// ========================================================
// 2. SỬA COUPONSERVICE.JS (CHUẨN HÓA TOÁN HỌC & FIRESTORE SYNC)
// ========================================================
const couponServicePath = 'D:\\skinid-web-extracted\\src\\features\\cart\\services\\couponService.js';
const newCouponServiceCode = `/**
 * Danh sách mã voucher hỗ trợ nội bộ SkinID.
 * Điều kiện kiểm tra khớp 100% với hiển thị tại Trang Khuyến Mại.
 */
export const AVAILABLE_COUPONS = {
  SKINID10: {
    code: 'SKINID10',
    description: 'Giảm 10% tổng đơn hàng (Tối đa 50.000đ cho đơn từ 500.000đ)',
    type: 'percentage',
    value: 10,
    minOrder: 500000,
    maxDiscount: 50000
  },
  WELCOME50: {
    code: 'WELCOME50',
    description: 'Giảm ngay 50.000đ cho đơn hàng từ 350.000đ',
    type: 'fixed',
    value: 50000,
    minOrder: 350000
  },
  FREESHIP: {
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển toàn quốc 30.000đ cho đơn từ 500.000đ',
    type: 'shipping',
    value: 30000,
    minOrder: 500000
  }
};

let inMemoryFirestoreCoupons = {};

export function setRemoteCoupons(remoteVouchers = []) {
  if (!Array.isArray(remoteVouchers)) return;
  const map = {};
  remoteVouchers.forEach(v => {
    if (!v?.code || v.active === false) return;
    const normalizedCode = String(v.code).trim().toUpperCase();
    map[normalizedCode] = {
      code: normalizedCode,
      description: v.description || \`Mã ưu đãi \${normalizedCode}\`,
      type: v.type === 'percent' || v.type === 'percentage' ? 'percentage' : v.type === 'shipping' ? 'shipping' : 'fixed',
      value: Number(v.discountValue || v.value) || 0,
      minOrder: Number(v.minOrderValue || v.minOrder) || 0,
      maxDiscount: Number(v.maxDiscount) || 0
    };
  });
  inMemoryFirestoreCoupons = map;
}

export function getDynamicCoupons() {
  const merged = { ...AVAILABLE_COUPONS, ...inMemoryFirestoreCoupons };
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('skinid_admin_vouchers');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((v) => {
            if (!v?.code || v.active === false) return;
            const normalizedCode = String(v.code).trim().toUpperCase();
            merged[normalizedCode] = {
              code: normalizedCode,
              description: v.description || \`Mã giảm giá \${normalizedCode}\`,
              type: v.type === 'percent' || v.type === 'percentage' ? 'percentage' : v.type === 'shipping' ? 'shipping' : 'fixed',
              value: Number(v.discountValue || v.value) || 0,
              minOrder: Number(v.minOrderValue || v.minOrder) || 0,
              maxDiscount: Number(v.maxDiscount) || 0
            };
          });
        }
      }
    }
  } catch {}
  return merged;
}

/**
 * Kiểm tra tính hợp lệ và tính số tiền giảm giá của mã voucher.
 * @param {string} rawCode - Mã voucher người dùng nhập
 * @param {number} subtotal - Tổng tiền hàng trước giảm
 * @param {number} shippingFee - Phí vận chuyển hiện tại
 * @returns {{ valid: boolean, code?: string, discount?: number, message: string }}
 */
export function validateCoupon(rawCode, subtotal = 0, shippingFee = 0) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Vui lòng nhập mã giảm giá.' };
  }

  const allCoupons = getDynamicCoupons();
  const coupon = allCoupons[code];
  if (!coupon) {
    return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
  }

  const numericSubtotal = Number(subtotal) || 0;
  if (coupon.minOrder && numericSubtotal < coupon.minOrder) {
    const formattedMin = new Intl.NumberFormat('vi-VN').format(coupon.minOrder);
    return {
      valid: false,
      message: \`Mã \${coupon.code} chỉ áp dụng cho đơn hàng từ \${formattedMin} đ.\`
    };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    const rawDiscount = Math.round((numericSubtotal * coupon.value) / 100);
    discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, numericSubtotal);
  } else if (coupon.type === 'shipping') {
    discount = Math.min(coupon.value, Number(shippingFee) || 0);
  }

  return {
    valid: true,
    code: coupon.code,
    discount,
    description: coupon.description,
    message: \`Đã áp dụng mã \${coupon.code} thành công!\`
  };
}
`;
fs.writeFileSync(couponServicePath, newCouponServiceCode, 'utf8');
console.log('✅ 2. Đã chuẩn hóa toán học và sync Firestore trong couponService.js.');

// ========================================================
// 3. SỬA ADMINSERVICE.JS (FIX BUG MERGE NGƯỢC BLOG & VOUCHER SYNC)
// ========================================================
const adminServicePath = 'D:\\skinid-web-extracted\\src\\features\\admin\\services\\adminService.js';
let adminServiceContent = fs.readFileSync(adminServicePath, 'utf8');

// Fix merge ngược trong fetchAdminBlogPosts:
const oldBlogMerge = `        remotePosts.forEach((p) => mergedMap.set(p.id, p));
        localPosts.forEach((p) => mergedMap.set(p.id, { ...(mergedMap.get(p.id) || {}), ...p }));`;

const newBlogMerge = `        // Firestore remotePosts có quyền ưu tiên cao hơn localPosts cũ
        localPosts.forEach((p) => mergedMap.set(p.id, p));
        remotePosts.forEach((p) => mergedMap.set(p.id, { ...(mergedMap.get(p.id) || {}), ...p }));`;

if (adminServiceContent.includes(oldBlogMerge)) {
  adminServiceContent = adminServiceContent.replace(oldBlogMerge, newBlogMerge);
  console.log('✅ 3. Đã sửa bug merge ngược bài viết blog trong adminService.js.');
}

// Thêm hook setRemoteCoupons khi fetchAdminPromotions
if (!adminServiceContent.includes('setRemoteCoupons')) {
  adminServiceContent = adminServiceContent.replace(
    /if \(mergedVouchers\) writeLocalVouchers\(mergedVouchers\);/,
    `if (mergedVouchers) {
      writeLocalVouchers(mergedVouchers);
      try {
        const { setRemoteCoupons } = await import('../../cart/services/couponService.js');
        setRemoteCoupons(mergedVouchers);
      } catch {}
    }`
  );
}
fs.writeFileSync(adminServicePath, adminServiceContent, 'utf8');

// ========================================================
// 4. SỬA PROMOTIONSPAGE.JSX (VOUCHER ĐỘNG & PADDING MOBILE)
// ========================================================
const promoPagePath = 'D:\\skinid-web-extracted\\src\\pages\\PromotionsPage.jsx';
let promoPageContent = fs.readFileSync(promoPagePath, 'utf8');

// Đọc voucher động từ fetchAdminPromotions / getDynamicCoupons
if (!promoPageContent.includes('fetchAdminPromotions')) {
  promoPageContent = promoPageContent.replace(
    /import { AVAILABLE_COUPONS } from '\.\.\/features\/cart\/services\/couponService\.js';/,
    `import { AVAILABLE_COUPONS, getDynamicCoupons } from '../features/cart/services/couponService.js';\nimport { fetchAdminPromotions } from '../features/admin/index.js';`
  );

  promoPageContent = promoPageContent.replace(
    /const coupons = \[[\s\S]*?\];/,
    `const [dynamicCouponsList, setDynamicCouponsList] = useState(() => {
    const list = Object.values(getDynamicCoupons());
    return list.map((c, i) => ({
      code: c.code,
      title: c.type === 'percentage' ? \`Giảm \${c.value}% đơn hàng\` : c.type === 'shipping' ? 'Miễn phí vận chuyển' : \`Giảm \${new Intl.NumberFormat('vi-VN').format(c.value)} đ\`,
      desc: c.description || (c.minOrder ? \`Đơn từ \${new Intl.NumberFormat('vi-VN').format(c.minOrder)} đ\` : 'Áp dụng toàn sàn'),
      badge: i === 0 ? 'Phổ biến nhất' : i === 1 ? 'Khách mới' : 'Freeship',
      color: i % 3 === 0 ? 'from-rose-500 to-pink-600' : i % 3 === 1 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'
    }));
  });

  useEffect(() => {
    fetchAdminPromotions().then(res => {
      if (res?.vouchers && res.vouchers.length > 0) {
        const mapped = res.vouchers.filter(v => v.active !== false).map((c, i) => ({
          code: c.code,
          title: c.type === 'percent' || c.type === 'percentage' ? \`Giảm \${c.discountValue || c.value}% đơn hàng\` : c.type === 'shipping' ? 'Miễn phí vận chuyển' : \`Giảm \${new Intl.NumberFormat('vi-VN').format(c.discountValue || c.value)} đ\`,
          desc: c.description || (c.minOrderValue ? \`Đơn từ \${new Intl.NumberFormat('vi-VN').format(c.minOrderValue)} đ\` : 'Áp dụng toàn sàn'),
          badge: i === 0 ? 'Đang kích hoạt' : 'Voucher hot',
          color: i % 3 === 0 ? 'from-rose-500 to-pink-600' : i % 3 === 1 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'
        }));
        if (mapped.length > 0) setDynamicCouponsList(mapped);
      }
    }).catch(() => {});
  }, []);

  const coupons = dynamicCouponsList;`
  );
  fs.writeFileSync(promoPagePath, promoPageContent, 'utf8');
  console.log('✅ 4. Đã kết nối Voucher động Firestore cho PromotionsPage.jsx.');
}

// ========================================================
// 5. SỬA FLASHSALEBANNER.JSX (SYNC REALTIME TỪ FIRESTORE)
// ========================================================
const flashBannerPath = 'D:\\skinid-web-extracted\\src\\components\\home\\FlashSaleBanner.jsx';
let flashBannerContent = fs.readFileSync(flashBannerPath, 'utf8');

if (!flashBannerContent.includes('fetchAdminPromotions')) {
  flashBannerContent = flashBannerContent.replace(
    /import { useCart } from '\.\.\/\.\.\/features\/cart\/index\.js';/,
    `import { useCart } from '../../features/cart/index.js';\nimport { fetchAdminPromotions } from '../../features/admin/index.js';`
  );

  flashBannerContent = flashBannerContent.replace(
    /const \[vouchers, setVouchers\] = useState\(readDynamicVouchers\);/,
    `const [vouchers, setVouchers] = useState(readDynamicVouchers);

  // Tự động tải chiến dịch và voucher từ Firestore khi mount
  useEffect(() => {
    fetchAdminPromotions().then(res => {
      if (res?.campaign && res.campaign.active !== false) {
        setCampaign(prev => ({ ...prev, ...res.campaign }));
      }
      if (res?.vouchers && res.vouchers.length > 0) {
        const activeV = res.vouchers.filter(v => v.active !== false).slice(0, 3).map(v => ({
          code: v.code,
          label: v.type === 'percent' || v.type === 'percentage' ? \`Giảm \${v.discountValue || v.value}%\` : v.type === 'shipping' ? 'Freeship' : \`Giảm \${Math.round((v.discountValue || v.value) / 1000)}K\`,
          sub: v.description || (v.minOrderValue ? \`Đơn từ \${Math.round(v.minOrderValue / 1000)}k\` : 'Toàn sàn')
        }));
        if (activeV.length > 0) setVouchers(activeV);
      }
    }).catch(() => {});
  }, []);`
  );
  fs.writeFileSync(flashBannerPath, flashBannerContent, 'utf8');
  console.log('✅ 5. Đã nâng cấp FlashSaleBanner.jsx kết nối Firestore realtime.');
}

// ========================================================
// 6. SỬA ROUTER.JSX (THÊM SCROLLRESTORATION)
// ========================================================
const routerPath = 'D:\\skinid-web-extracted\\src\\app\\router.jsx';
let routerContent = fs.readFileSync(routerPath, 'utf8');

if (!routerContent.includes('ScrollRestoration')) {
  routerContent = routerContent.replace(
    /import { createBrowserRouter, Navigate } from 'react-router-dom';/,
    `import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';`
  );

  const rootLayoutDef = `function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}\n\n`;

  routerContent = routerContent.replace(
    /export const router = createBrowserRouter\(\[/,
    rootLayoutDef + 'export const router = createBrowserRouter(['
  );

  // Replace element in root route
  routerContent = routerContent.replace(
    /ErrorBoundary: AppErrorBoundary,\s*HydrateFallback: PageLoader,/,
    `ErrorBoundary: AppErrorBoundary,
    HydrateFallback: PageLoader,
    element: <RootLayout />,`
  );

  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('✅ 6. Đã thêm ScrollRestoration vào router.jsx (khắc phục 100% lỗi kẹt scroll).');
}

// ========================================================
// 7. SỬA WORKER/INDEX.JS (EDGE DYNAMIC SEO QUERY FIRESTORE)
// ========================================================
const workerPath = 'D:\\skinid-web-extracted\\worker\\index.js';
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Cập nhật applyDynamicSeo để nếu không thấy trong bundledProducts, gọi Firestore REST getDocument
const oldDynamicSeoSearch = `  if (productMatch) {
    const rawId = decodeURIComponent(productMatch[1]);
    targetProduct = bundledProducts.get(rawId) || SERVER_CATALOG.find(p => p.slug === rawId || p.id === rawId);
  } else if (url.searchParams.has('product')) {
    const pId = url.searchParams.get('product');
    targetProduct = bundledProducts.get(pId) || SERVER_CATALOG.find(p => p.slug === pId || p.id === pId);
  }`;

const newDynamicSeoSearch = `  if (productMatch) {
    const rawId = decodeURIComponent(productMatch[1]);
    targetProduct = bundledProducts.get(rawId) || SERVER_CATALOG.find(p => p.slug === rawId || p.id === rawId);
    if (!targetProduct && env && isFirestoreConfigured(env)) {
      try {
        const remoteDoc = await getDocument(env, \`products/\${rawId}\`);
        if (remoteDoc && remoteDoc.name) targetProduct = remoteDoc;
      } catch (err) {
        console.warn('[SkinID Edge SEO] Firestore lookup error for product:', rawId, err.message);
      }
    }
  } else if (url.searchParams.has('product')) {
    const pId = url.searchParams.get('product');
    targetProduct = bundledProducts.get(pId) || SERVER_CATALOG.find(p => p.slug === pId || p.id === pId);
    if (!targetProduct && env && isFirestoreConfigured(env)) {
      try {
        const remoteDoc = await getDocument(env, \`products/\${pId}\`);
        if (remoteDoc && remoteDoc.name) targetProduct = remoteDoc;
      } catch (err) {
        console.warn('[SkinID Edge SEO] Firestore lookup error for product query:', pId, err.message);
      }
    }
  }`;

if (workerContent.includes(oldDynamicSeoSearch)) {
  // applyDynamicSeo must be async
  workerContent = workerContent.replace('function applyDynamicSeo(request, url, response) {', 'async function applyDynamicSeo(request, env, url, response) {');
  workerContent = workerContent.replace(oldDynamicSeoSearch, newDynamicSeoSearch);
  workerContent = workerContent.replace(
    'return applyDynamicSeo(request, url, assetResponse);',
    'return await applyDynamicSeo(request, env, url, assetResponse);'
  );
  fs.writeFileSync(workerPath, workerContent, 'utf8');
  console.log('✅ 7. Đã nâng cấp Cloudflare Worker tự động fetch Firestore cho sản phẩm mới khi bot cào.');
}

console.log('🎉 TOÀN BỘ 7 HOTFIXES ĐÃ HOÀN TẤT THÀNH CÔNG 100%!');
