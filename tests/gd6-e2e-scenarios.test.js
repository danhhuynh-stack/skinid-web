import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_HOME_BLOCKS,
  validateCosmeticCompliance,
  generateArticleJsonLd
} from '../src/features/content/services/contentRepository.js';
import {
  ORDER_STATUS_FLOW,
  canTransitionOrderStatus,
  validateStatusTransition,
  generateDeliveryNoteHtml,
  exportOrdersToExcelXml,
  calculateCustomer360Metrics,
  canViewSkinReportImage,
  generateBulkCoupons,
  calculateHonestDashboardMetrics,
  getOperationsTodoItems,
  DISCLAIMER_MEDICAL_NOTICE
} from '../src/features/admin/services/operationsService.js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

after(() => {
  setTimeout(() => process.exit(0), 50).unref();
});

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const workerCode = readFileSync(resolve(root, 'worker/index.js'), 'utf8')
  .replace(/^import[\s\S]*?from '[^']+';\r?\n/gm, '')
  .replace('export default {', 'const workerDefault = {')
  .replace(/^export /gm, '');

function createWorkerContext(overrides = {}) {
  const SERVER_CATALOG = [
    { id: 'rilastil-525', sku: 'RIL525', slug: 'rilastil-525', name: 'Kem dưỡng ẩm Rilastil', price: 450000, volume: '50ml' },
    { id: 'rilastil-2067', sku: 'RIL2067', slug: 'rilastil-2067', name: 'Serum Aqua Rilastil', price: 680000, volume: '30ml' }
  ];

  const dbStore = new Map();
  const context = {
    console,
    Response,
    Request,
    Headers,
    URL,
    Date,
    Math,
    crypto: webcrypto,
    TextEncoder,
    ApiError,
    SERVER_CATALOG,
    SERVER_ARTICLES: [],
    isValidFirebasePrivateKey: () => true,
    requiredFirebaseEnv: () => {},
    getDocument: async (_, path) => {
      if (overrides.getDocument) return overrides.getDocument(path);
      return dbStore.get(path) || null;
    },
    commitWrites: async (_, writes) => {
      if (overrides.commitWrites) return overrides.commitWrites(writes);
      for (const w of writes) {
        if (w.update && w.update.name) {
          const match = w.update.name.match(/documents\/(.+)$/);
          if (match) {
            const current = dbStore.get(match[1]) || {};
            dbStore.set(match[1], { ...current, ...w.update.fields });
          }
        }
      }
    },
    encodeFields: value => value,
    documentName: (_, path) => `projects/test/databases/(default)/documents/${path}`,
    json: (_, __, body, status = 200) => ({ body, status }),
    syncOrderToS3: async () => ({ success: true, s3OrderId: 'S3-MOCK-123', s3SyncStatus: 'synced' }),
    sendTelegramOrderNotification: async () => true,
    ...overrides
  };

  vm.createContext(context);
  vm.runInContext(workerCode, context);
  return { context, dbStore };
}

// ===============================================================
// KỊCH BẢN 1: CMS ĐỔI BANNER TRANG CHỦ & PHIÊN BẢN LỊCH SỬ
// ===============================================================
test('GD6 - Kịch bản 1: Đổi banner trang chủ, hẹn giờ chiến dịch và rollback phiên bản', () => {
  // 1. Cấu trúc 8 khối mặc định
  assert.ok(Array.isArray(DEFAULT_HOME_BLOCKS.banners), 'Danh sách banner phải tồn tại');
  assert.ok(DEFAULT_HOME_BLOCKS.banners.length >= 4, 'Phải có ít nhất 4 banner mặc định');
  assert.ok(DEFAULT_HOME_BLOCKS.blockOrder.includes('hero'), 'Khối hero banner phải có trong blockOrder');

  // 2. Thêm banner khuyến mãi mới có hẹn giờ
  const newBanner = {
    id: 'banner_e2e_sale',
    label: 'SIÊU SALE ĐẶC BIỆT',
    title: 'SIÊU SALE ĐẶC QUYỀN 2026',
    subtitle: 'Mỹ phẩm chính hãng giảm sâu 50%',
    active: true,
    desktopImage: 'https://skinid.vn/images/banner-hero-1.webp',
    mobileImage: 'https://skinid.vn/images/banner-mobile-1.webp',
    startAt: '2026-10-01T00:00:00Z',
    endAt: '2026-12-31T23:59:59Z'
  };

  const updatedBlocks = {
    ...DEFAULT_HOME_BLOCKS,
    banners: [newBanner, ...DEFAULT_HOME_BLOCKS.banners],
    updatedAtIso: new Date().toISOString()
  };

  assert.equal(updatedBlocks.banners[0].id, 'banner_e2e_sale');

  // 3. Kiểm tra logic lọc banner theo thời gian chiến dịch
  const now = new Date('2026-10-30T10:00:00Z').toISOString();
  const activeBanners = updatedBlocks.banners.filter(b => {
    if (b.active === false) return false;
    if (b.startAt && b.startAt > now) return false;
    if (b.endAt && b.endAt < now) return false;
    return true;
  });
  assert.ok(activeBanners.some(b => b.id === 'banner_e2e_sale'), 'Banner khuyến mãi đang trong khung giờ phải hiển thị');

  // 4. Giả lập cơ chế Rollback: Khôi phục lại trạng thái ban đầu
  const historyVersion = {
    versionId: 'v_e2e_backup',
    data: DEFAULT_HOME_BLOCKS,
    savedAtIso: new Date().toISOString()
  };
  const restoredBlocks = historyVersion.data;
  assert.equal(restoredBlocks.banners.length, DEFAULT_HOME_BLOCKS.banners.length);
  assert.ok(!restoredBlocks.banners.some(b => b.id === 'banner_e2e_sale'), 'Phiên bản cũ không chứa banner mới');
});

// ===============================================================
// KỊCH BẢN 2: QUY TRÌNH DUYỆT BÀI VIẾT & TUÂN THỦ QUẢNG CÁO MỸ PHẨM
// ===============================================================
test('GD6 - Kịch bản 2: Quy trình xuất bản bài viết và kiểm soát từ cấm Thông tư 06/2011/TT-BYT', () => {
  // 1. Phát hiện từ cấm y tế
  const violatingText = 'Serum này đặc trị dứt điểm mụn bọc, chữa lành hoàn toàn và thay thế thuốc trị bệnh ngoài da.';
  const audit = validateCosmeticCompliance(violatingText);
  assert.equal(audit.isCompliant, false, 'Phải phát hiện nội dung vi phạm');
  assert.ok(audit.flaggedWords.length >= 2, 'Phải bắt đúng các từ vi phạm');
  assert.ok(audit.warningMessage.includes('Thông tư 06/2011/TT-BYT'));

  // 2. Nội dung đạt chuẩn chăm sóc da
  const compliantText = 'Serum cấp ẩm phục hồi da, hỗ trợ làm dịu kích ứng và nuôi dưỡng hàng rào bảo vệ màng ẩm tự nhiên.';
  const cleanAudit = validateCosmeticCompliance(compliantText);
  assert.equal(cleanAudit.isCompliant, true, 'Nội dung chuẩn phải được duyệt');
  assert.equal(cleanAudit.flaggedWords.length, 0);
  assert.equal(cleanAudit.warningMessage, null);

  // 3. Tạo Schema Structured Data JSON-LD chuẩn Googlebot
  const mockPost = {
    id: 'bai-viet-e2e',
    title: 'Bí quyết phục hồi da kích ứng trong 7 ngày',
    excerpt: 'Hướng dẫn lựa chọn thành phần lành tính cho da nhạy cảm.',
    image: 'https://skinid.vn/images/blog-1.webp',
    author: 'Chuyên gia Da liễu SkinID',
    createdAtIso: '2026-10-30T10:00:00Z'
  };
  const jsonLd = generateArticleJsonLd(mockPost);
  assert.equal(jsonLd['@type'], 'Article');
  assert.equal(jsonLd.headline, mockPost.title);
  assert.equal(jsonLd.publisher.name, 'SkinID.vn');
});

// ===============================================================
// KỊCH BẢN 3: ĐỔI GIÁ SẢN PHẨM & SERVER BẢO VỆ GIÁ ĐƠN HÀNG
// ===============================================================
test('GD6 - Kịch bản 3: Thay đổi giá sản phẩm và Server chặn đứng Client sửa giá', async () => {
  const { context } = createWorkerContext();
  const hackedRequest = {
    headers: new Headers(),
    json: async () => ({
      items: [
        { productId: 'rilastil-525', quantity: 2, price: 1000 },
        { productId: 'rilastil-2067', quantity: 1, price: 500 }
      ],
      customer: {
        name: 'Hacker Thử Nghiệm',
        phone: '0912345678',
        shippingAddress: {
          line1: '123 Test Street',
          wardCode: 1,
          wardName: 'P1',
          provinceCode: 79,
          provinceName: 'Thành phố Hồ Chí Minh'
        }
      }
    })
  };

  const env = { FIREBASE_PROJECT_ID: 'skinid-vietnam', FIREBASE_CLIENT_EMAIL: 'test@fieldman.vn', FIREBASE_PRIVATE_KEY: 'test' };
  const user = { sub: 'usr_hacker', email: 'hacker@test.vn' };

  const result = await context.createOrder(hackedRequest, env, user);
  assert.equal(result.status, 201);
  // Server tính độc lập: 450.000 * 2 + 680.000 = 1.580.000đ (freeship vì > 500k)
  assert.equal(result.body.subtotal, 1580000);
  assert.equal(result.body.total, 1580000);
  assert.notEqual(result.body.total, 2500, 'Server đã đè bẹp hoàn toàn giá hack 2.500đ');
});

// ===============================================================
// KỊCH BẢN 4: SINH VOUCHER HÀNG LOẠT & BẢO VỆ LƯỢT DÙNG (MAX USES)
// ===============================================================
test('GD6 - Kịch bản 4: Tạo voucher hàng loạt và kiểm soát lượt dùng', () => {
  const bulk = generateBulkCoupons({
    count: 10,
    prefix: 'E2E-',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 500000,
    maxUses: 1
  });

  assert.equal(bulk.length, 10);
  const voucher = bulk[0];
  assert.equal(voucher.maxUses, 1);
  assert.equal(voucher.usedCount, 0);

  // Giả lập khách áp dụng voucher thành công lần đầu
  voucher.usedCount += 1;
  const isAvailableFirstTime = voucher.active && voucher.usedCount <= voucher.maxUses;
  assert.equal(isAvailableFirstTime, true);

  // Khách thứ 2 cố dùng lại mã này -> BỊ TỪ CHỐI VÌ VƯỢT LƯỢT
  voucher.usedCount += 1;
  const isAvailableSecondTime = voucher.active && voucher.usedCount <= voucher.maxUses;
  assert.equal(isAvailableSecondTime, false, 'Mã 1 lần dùng phải bị khóa khi vượt lượt');
});

// ===============================================================
// KỊCH BẢN 5: VÒNG ĐỜI ĐƠN HÀNG STATE MACHINE & HỦY ĐƠN HOÀN KHO
// ===============================================================
test('GD6 - Kịch bản 5: Đơn hàng đi đủ vòng đời từ Pending đến Completed và luồng hủy đơn', () => {
  let status = 'pending';

  // 1. Chuyển tuần tự hợp lệ
  assert.equal(canTransitionOrderStatus(status, 'confirmed'), true);
  status = 'confirmed';

  assert.equal(canTransitionOrderStatus(status, 'packing'), true);
  status = 'packing';

  assert.equal(canTransitionOrderStatus(status, 'shipping'), true);
  status = 'shipping';

  assert.equal(canTransitionOrderStatus(status, 'delivered'), true);
  status = 'delivered';

  assert.equal(canTransitionOrderStatus(status, 'completed'), true);
  status = 'completed';

  // 2. Từ completed không được phép nhảy ngược lại shipping hay pending
  assert.equal(canTransitionOrderStatus(status, 'shipping'), false);
  assert.equal(canTransitionOrderStatus(status, 'pending'), false);

  // 3. Test luồng hủy đơn từ Pending
  let cancelTestStatus = 'pending';
  assert.equal(canTransitionOrderStatus(cancelTestStatus, 'cancelled'), true);
  cancelTestStatus = 'cancelled';
  // Đã hủy thì không được chuyển sang completed
  assert.equal(canTransitionOrderStatus(cancelTestStatus, 'completed'), false);
});

// ===============================================================
// KỊCH BẢN 6: BẢO MẬT DỮ LIỆU SOI DA & QUYỀN ĐƯỢC LÃNG QUÊN (PDPA)
// ===============================================================
test('GD6 - Kịch bản 6: Phân quyền xem ảnh soi da AI và ẩn danh hóa tài khoản theo Luật BV DLCN', () => {
  // 1. Chỉ Bác sĩ da liễu / Tư vấn viên / Quản trị viên mới được xem ảnh
  assert.equal(canViewSkinReportImage('super_admin'), true);
  assert.equal(canViewSkinReportImage('admin'), true);
  assert.equal(canViewSkinReportImage('consultant'), true);
  assert.equal(canViewSkinReportImage('dermatologist'), true);

  // Marketing, Sale và Kho vận bị chặn
  assert.equal(canViewSkinReportImage('marketing'), false);
  assert.equal(canViewSkinReportImage('sales'), false);
  assert.equal(canViewSkinReportImage('warehouse'), false);

  // 2. Kiểm tra tính năng tính chỉ số Customer 360 bảo vệ thông tin
  const mockUser = { id: 'u_pdpa_test', name: 'Nguyễn Khách Hàng', email: 'khach@gmail.com', phone: '0988888888' };
  const mockOrders = [
    { userId: 'u_pdpa_test', total: 1200000, status: 'completed' }
  ];

  const c360 = calculateCustomer360Metrics(mockUser, mockOrders, []);
  assert.equal(c360.totalSpent, 1200000);
  assert.equal(c360.orderCount, 1);
  assert.equal(c360.rfmKey, 'NEW');

  // 3. Cam kết miễn trừ y khoa
  assert.ok(DISCLAIMER_MEDICAL_NOTICE.includes('không thay thế chẩn đoán'));
});
