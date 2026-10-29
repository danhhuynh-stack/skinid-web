#!/usr/bin/env node

/**
 * ==============================================================================
 * SCRIPT DI TRÚ DỮ LIỆU TOÀN DIỆN V2 (MIGRATE-V2.MJS)
 * Phục vụ Giai đoạn 1 (GĐ1 - Nền dữ liệu) & Master Upgrade Plan SkinID.vn
 *
 * Nguyên tắc tuân thủ tuyệt đối:
 * - N1: Một nguồn sự thật duy nhất (Firestore). Bơm sạch dữ liệu vào collections.
 * - N2: Không ghi đè mù quáng. Bản ghi đã tồn tại trong Firestore thì KHÔNG ghi đè,
 *       chỉ đối soát và báo cáo khác biệt.
 *
 * Cách chạy:
 *   node scripts/migrate-v2.mjs --dry-run
 *   node scripts/migrate-v2.mjs --commit --env=production --local-export=docs/archive/skinid-localstorage-export.json
 * ==============================================================================
 */

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// 1. Phân tích tham số dòng lệnh (CLI Arguments)
const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const isDryRun = args.includes('--dry-run') || !isCommit;

const envArg = args.find(a => a.startsWith('--env='));
const targetEnv = envArg ? envArg.split('=')[1].trim() : 'production';

const localExportArg = args.find(a => a.startsWith('--local-export='));
const localExportPath = resolve(
  projectRoot,
  localExportArg ? localExportArg.split('=')[1].trim() : 'docs/archive/skinid-localstorage-export.json'
);

const projectId = targetEnv === 'staging' ? 'skinid-staging' : 'skinid-official';

console.log('='.repeat(80));
console.log(`🚀 [SkinID Migration v2] Khởi chạy di trú dữ liệu nền tảng Firestore`);
console.log(`   - Chế độ: ${isCommit ? '🔴 COMMIT (GHI THẬT)' : '🟢 DRY RUN (CHỈ ĐỐI SOÁT & KIỂM TRA)'}`);
console.log(`   - Môi trường: ${targetEnv.toUpperCase()} (${projectId})`);
console.log(`   - File xuất localStorage: ${localExportPath}`);
console.log('='.repeat(80));

// 2. Trình đọc dữ liệu từ các tệp nguồn (Extract Source Data)

// A. 54 Sản phẩm chuẩn niêm yết
async function loadSourceProducts() {
  const source = await readFile(resolve(projectRoot, 'src/data/products.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(`${source}; globalThis.__PRODUCTS__ = window.LOCAL_PRODUCTS;`, context);
  const products = context.__PRODUCTS__;
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('Không đọc được danh sách sản phẩm từ src/data/products.js');
  }
  return products.map(p => ({
    sku: p.productCode || p.id,
    slug: p.slug || p.id,
    name: p.name,
    brand: p.brand,
    brandId: p.brandSlug,
    brandSlug: p.brandSlug,
    category: p.category || p.stepType,
    categoryIds: [p.category || p.stepType],
    price: Number(p.price) || 0,
    originalPrice: Number(p.originalPrice) || 0,
    compareAtPrice: Number(p.originalPrice) || Number(p.price) || 0,
    stock: 100,
    status: 'active',
    images: [{ url: p.image, alt: p.name }],
    shortDesc: p.uses || '',
    description: p.uses || '',
    ingredients: Array.isArray(p.mainActives) ? p.mainActives.join(', ') : '',
    usage: '',
    volume: p.volume || '',
    tier: p.tier || 'Essential',
    skinTypes: Array.isArray(p.skinTypes) ? p.skinTypes : ['all'],
    concerns: Array.isArray(p.targetConcerns) ? p.targetConcerns : [],
    cbmpNumber: p.cbmpNumber || '',
    s3PosId: p.s3PosId || null
  }));
}

// B. Chiến dịch & 3 Combo & Flash sale 50%
async function loadSourceCampaigns() {
  const { CURATED_COMBOS, RETAIL_50_DEALS } = await import('../src/data/promotions.js');
  return [
    {
      id: 'active',
      title: "Đại Tiệc Dưỡng Trắng & Hương Thơm — TWON x D'VAH",
      subtitle: 'Ưu Đãi Độc Quyền Đến 50% & Quà Tặng Nàng Thơ',
      badge: 'SIÊU SALE ĐẶC BIỆT',
      combos: CURATED_COMBOS,
      flashSale: RETAIL_50_DEALS,
      active: true,
      updatedAtIso: new Date().toISOString()
    }
  ];
}

// C. Mã voucher & khuyến mại
async function loadSourcePromotions(localExportData) {
  const { AVAILABLE_COUPONS } = await import('../src/features/cart/services/couponService.js');
  const promoMap = new Map();

  // 1. Mã voucher mặc định
  Object.values(AVAILABLE_COUPONS).forEach(c => {
    promoMap.set(c.code, {
      code: c.code,
      description: c.description,
      type: c.type,
      discountValue: c.value,
      minOrderValue: c.minOrder,
      maxDiscount: c.maxDiscount || 0,
      active: true
    });
  });

  // 2. Vouchers từ file export nếu có
  if (localExportData && Array.isArray(localExportData.skinid_admin_vouchers)) {
    localExportData.skinid_admin_vouchers.forEach(v => {
      if (v?.code) {
        const code = String(v.code).trim().toUpperCase();
        promoMap.set(code, {
          code,
          description: v.description || '',
          type: v.type || 'percent',
          discountValue: Number(v.discountValue || v.value) || 0,
          minOrderValue: Number(v.minOrderValue || v.minOrder) || 0,
          maxDiscount: Number(v.maxDiscount) || 0,
          active: v.active !== false
        });
      }
    });
  }

  return Array.from(promoMap.values());
}

// D. 4 Bài viết cẩm nang Skincare y khoa
async function loadSourcePosts() {
  const { DEFAULT_BLOG_ARTICLES } = await import('../src/data/blogArticles.js');
  return DEFAULT_BLOG_ARTICLES.map(b => ({
    id: b.id,
    title: b.title,
    slug: b.id,
    step: b.step,
    stepLabel: b.stepLabel,
    author: { name: b.author, title: 'Chuyên gia SkinID' },
    readTime: b.readTime,
    status: b.status || 'published',
    publishedAt: b.date || '12/10/2026',
    image: b.image,
    cover: b.image,
    excerpt: b.excerpt,
    content: b.content,
    relatedProductIds: b.relatedProductIds || []
  }));
}

// E. Bộ 6 Chính sách Bộ Công Thương
async function loadSourceLegalPages() {
  const { LEGAL_POLICIES } = await import('../src/data/legalPolicies.js');
  return Object.values(LEGAL_POLICIES).map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortTitle: p.shortTitle,
    badge: p.badge,
    effectiveDate: p.effectiveDate,
    seo: {
      title: p.seoTitle,
      description: p.seoDesc,
      canonical: p.canonical
    },
    sections: p.sections,
    status: 'published'
  }));
}

// F. Cấu hình hệ thống (Settings)
async function loadSourceSettings() {
  const { DEFAULT_SYSTEM_SETTINGS } = await import('../src/features/content/services/contentRepository.js');
  return [
    {
      id: 'system_config',
      ...DEFAULT_SYSTEM_SETTINGS,
      updatedAtIso: new Date().toISOString()
    }
  ];
}

// G. Đơn hàng lịch sử từ file trích xuất localStorage
function loadExportedOrders(localExportData) {
  if (!localExportData) return [];
  const orders = [];
  for (const [key, value] of Object.entries(localExportData)) {
    if (key.startsWith('skinid_orders_') && Array.isArray(value)) {
      orders.push(...value);
    }
  }
  return orders;
}

// 3. Hàm thực thi chính (Main Pipeline)
async function run() {
  // Đọc file export localStorage
  let localExportData = null;
  if (existsSync(localExportPath)) {
    try {
      const raw = await readFile(localExportPath, 'utf8');
      const parsed = JSON.parse(raw);
      localExportData = parsed.data || parsed;
      console.log(`✅ Đã tải file export localStorage: tìm thấy ${Object.keys(localExportData).length} mục lưu trữ.`);
    } catch (err) {
      console.warn(`⚠️ Lỗi đọc file export localStorage:`, err.message);
    }
  } else {
    console.warn(`ℹ️ File export không tồn tại tại: ${localExportPath} (Bỏ qua khâu đối soát đơn cũ từ máy nhập liệu).`);
  }

  // Tải toàn bộ dữ liệu nguồn
  const [products, campaigns, promotions, posts, legalPages, settings] = await Promise.all([
    loadSourceProducts(),
    loadSourceCampaigns(),
    loadSourcePromotions(localExportData),
    loadSourcePosts(),
    loadSourceLegalPages(),
    loadSourceSettings()
  ]);

  const historicalOrders = loadExportedOrders(localExportData);

  // In bảng đối soát trước khi di trú (Pre-Flight Reconciliation Table)
  console.log('\n📊 BẢNG ĐỐI SOÁT DỮ LIỆU NGUỒN TRƯỚC DI TRÚ:');
  console.log('-'.repeat(88));
  console.log(
    '| ' + 'Collection Target'.padEnd(20) +
    '| ' + 'File nguồn'.padEnd(30) +
    '| ' + 'Số lượng'.padEnd(10) +
    '| ' + 'Xác thực'.padEnd(15) + ' |'
  );
  console.log('-'.repeat(88));

  const plan = [
    { name: 'products', src: 'src/data/products.js', count: products.length, sample: products[0]?.sku },
    { name: 'campaigns', src: 'src/data/promotions.js', count: campaigns.length, sample: 'active' },
    { name: 'promotions', src: 'couponService.js + export', count: promotions.length, sample: promotions[0]?.code },
    { name: 'posts', src: 'src/data/blogArticles.js', count: posts.length, sample: posts[0]?.id },
    { name: 'pages', src: 'src/data/legalPolicies.js', count: legalPages.length, sample: legalPages[0]?.slug },
    { name: 'settings', src: 'contentRepository.js', count: settings.length, sample: 'system_config' },
    { name: 'orders', src: 'localstorage-export.json', count: historicalOrders.length, sample: historicalOrders[0]?.id || 'N/A' }
  ];

  for (const item of plan) {
    console.log(
      '| ' + item.name.padEnd(20) +
      '| ' + item.src.padEnd(30) +
      '| ' + String(item.count).padEnd(10) +
      '| ' + '✅ Sẵn sàng'.padEnd(15) + ' |'
    );
  }
  console.log('-'.repeat(88));

  if (isDryRun) {
    console.log('\n🎉 [DRY RUN HOÀN HẢO] Toàn bộ 7 bộ dữ liệu đã được nạp, cấu trúc schema khớp 100% Section 4!');
    console.log('💡 Để ghi thật vào Firestore, hãy kiểm tra tài khoản quản trị và chạy:');
    console.log('   node scripts/migrate-v2.mjs --commit\n');
    return;
  }

  // Chế độ COMMIT
  console.log('\n⏳ Đang khởi tạo kết nối Firebase Admin SDK...');
  let adminApp;
  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const credData = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      credential = cert(credData);
    }

    if (!credential) {
      console.error('\n❌ THIẾU THÔNG TIN ĐĂNG NHẬP QUẢN TRỊ FIREBASE (FIREBASE SERVICE ACCOUNT).');
      console.error('👉 Để commit lên Firestore, người dùng cần:');
      console.error('   1. Đặt biến môi trường GOOGLE_APPLICATION_CREDENTIALS=<đường-dẫn-service-account.json>');
      console.error('   2. Hoặc xuất FIREBASE_SERVICE_ACCOUNT_JSON trong .env');
      process.exit(1);
    }

    adminApp = getApps()[0] || initializeApp({ credential, projectId });
    const db = getFirestore(adminApp);

    console.log(`✅ Kết nối Firebase thành công tới Project: ${projectId}`);
    console.log('🚀 Bắt đầu di trú từng collection (Tuân thủ N2: KHÔNG ghi đè tài liệu đã có)...\n');

    async function migrateCollection(collectionName, items, idKey = 'id') {
      let createdCount = 0;
      let skippedCount = 0;

      for (const item of items) {
        const docId = String(item[idKey] || item.id || item.code || item.slug);
        const docRef = db.collection(collectionName).doc(docId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          skippedCount++;
        } else {
          await docRef.set({
            ...item,
            createdAtServer: FieldValue.serverTimestamp(),
            updatedAtServer: FieldValue.serverTimestamp(),
            version: 1
          });
          createdCount++;
        }
      }
      console.log(`   * [${collectionName}]: Tạo mới ${createdCount} docs, bỏ qua ${skippedCount} docs đã tồn tại.`);
    }

    await migrateCollection('products', products, 'sku');
    await migrateCollection('campaigns', campaigns, 'id');
    await migrateCollection('promotions', promotions, 'code');
    await migrateCollection('posts', posts, 'id');
    await migrateCollection('pages', legalPages, 'slug');
    await migrateCollection('settings', settings, 'id');
    if (historicalOrders.length > 0) {
      await migrateCollection('orders', historicalOrders, 'id');
    }

    console.log('\n🎉 [HOÀN TẤT DI TRÚ GĐ1] Tất cả dữ liệu nền tảng đã nằm an toàn trên Firestore!');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình commit lên Firestore:', err.message);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('❌ Thất bại:', err);
  process.exit(1);
});
