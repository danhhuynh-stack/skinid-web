import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

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

function createTestContext(overrides = {}) {
  const SERVER_CATALOG = [
    { id: 'prod-1', sku: 'SKU01', slug: 'prod-1', name: 'Serum HA B5', price: 500000, volume: '30ml' },
    { id: 'prod-2', sku: 'SKU02', slug: 'prod-2', name: 'Kem dưỡng ẩm', price: 200000, volume: '50ml' }
  ];

  const dbStore = new Map();
  // Pre-seed promotion in store
  dbStore.set('promotions/SALE10', {
    code: 'SALE10',
    type: 'percent',
    discountValue: 10,
    minOrderValue: 300000,
    maxDiscount: 100000,
    active: true,
    usedCount: 0,
    usageLimit: 10
  });
  dbStore.set('promotions/EXPIRED', {
    code: 'EXPIRED',
    type: 'fixed',
    discountValue: 50000,
    minOrderValue: 100000,
    endAt: '2020-01-01T00:00:00Z',
    active: true
  });
  dbStore.set('promotions/INACTIVE', {
    code: 'INACTIVE',
    active: false
  });

  const context = {
    ApiError,
    SERVER_CATALOG,
    crypto: webcrypto,
    TextEncoder,
    console,
    isValidFirebasePrivateKey: () => true,
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

test('GD2: Server tính lại giá độc lập, đè bẹp giá 1đ do client hack gửi lên', async () => {
  const { context } = createTestContext();
  const request = {
    headers: new Headers(),
    json: async () => ({
      items: [
        { productId: 'prod-1', quantity: 2, price: 1 },
        { productId: 'prod-2', quantity: 1, price: 0 }
      ],
      customer: {
        name: 'Hacker',
        phone: '0912345678',
        shippingAddress: {
          line1: '123 Test',
          wardCode: 1,
          wardName: 'P1',
          provinceCode: 79,
          provinceName: 'Thành phố Hồ Chí Minh'
        }
      }
    })
  };
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  const user = { sub: 'user_123', email: 'test@skinid.vn' };

  const result = await context.createOrder(request, env, user);
  assert.equal(result.status, 201);
  assert.equal(result.body.subtotal, 1200000);
  assert.equal(result.body.shippingFee, 0);
  assert.equal(result.body.total, 1200000);
});

test('GD2: Từ chối voucher khi chưa đạt minOrderValue hoặc hết hạn', async () => {
  const { context } = createTestContext();
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  const user = { sub: 'user_123' };

  const reqMinOrder = {
    headers: new Headers(),
    json: async () => ({
      items: [{ productId: 'prod-2', quantity: 1 }],
      couponCode: 'SALE10',
      customer: {
        name: 'Khách', phone: '0912345678',
        shippingAddress: { line1: '123', wardCode: 1, wardName: 'P1', provinceCode: 79, provinceName: 'TP.HCM' }
      }
    })
  };

  await assert.rejects(
    async () => context.createOrder(reqMinOrder, env, user),
    err => err.code === 'coupon_min_order'
  );

  const reqExpired = {
    headers: new Headers(),
    json: async () => ({
      items: [{ productId: 'prod-1', quantity: 1 }],
      couponCode: 'EXPIRED',
      customer: {
        name: 'Khách', phone: '0912345678',
        shippingAddress: { line1: '123', wardCode: 1, wardName: 'P1', provinceCode: 79, provinceName: 'TP.HCM' }
      }
    })
  };

  await assert.rejects(
    async () => context.createOrder(reqExpired, env, user),
    err => err.code === 'coupon_expired'
  );
});

test('GD2: Idempotency Key chặn đứng bấm đúp tạo đơn trùng lặp', async () => {
  const { context, dbStore } = createTestContext();
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  const user = { sub: 'user_idemp' };

  const idempHeaders = new Headers({ 'idempotency-key': 'test-idemp-key-unique-12345' });
  const req1 = {
    headers: idempHeaders,
    json: async () => ({
      items: [{ productId: 'prod-2', quantity: 1 }],
      customer: {
        name: 'Khách', phone: '0912345678',
        shippingAddress: { line1: '123', wardCode: 1, wardName: 'P1', provinceCode: 79, provinceName: 'TP.HCM' }
      }
    })
  };

  const res1 = await context.createOrder(req1, env, user);
  assert.equal(res1.status, 201);
  assert.equal(res1.body.duplicate, undefined);

  // In createTestContext, let's make sure dbStore has orders/res1.body.orderId
  const storedOrder = dbStore.get(`orders/${res1.body.orderId}`);
  assert.ok(storedOrder, 'Order must be stored in dbStore with orderId');

  const req2 = {
    headers: new Headers({ 'idempotency-key': 'test-idemp-key-unique-12345' }),
    json: async () => ({
      items: [{ productId: 'prod-2', quantity: 1 }],
      customer: {
        name: 'Khách', phone: '0912345678',
        shippingAddress: { line1: '123', wardCode: 1, wardName: 'P1', provinceCode: 79, provinceName: 'TP.HCM' }
      }
    })
  };
  const res2 = await context.createOrder(req2, env, user);
  assert.equal(res2.body.duplicate, true);
  assert.equal(res2.body.orderId, res1.body.orderId);
});

test('GD2: Cỗ máy trạng thái (State Machine) quản trị đơn hàng', async () => {
  const orderDoc = {
    id: 'ord_100',
    userId: 'user_1',
    status: 'pending',
    total: 500000,
    s3SyncStatus: 'pending'
  };
  const { context } = createTestContext({
    getDocument: async (_, path) => (path === 'orders/ord_100' ? orderDoc : null)
  });

  const adminUser = { sub: 'admin_1', admin: true, email: 'admin@skinid.vn' };
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };

  // 1. Chuyển hợp lệ: pending -> confirmed
  const reqConfirm = {
    json: async () => ({ targetStatus: 'confirmed', note: 'Đã xác nhận điện thoại' })
  };
  const resConfirm = await context.transitionOrderStatus(reqConfirm, env, adminUser, 'ord_100');
  assert.equal(resConfirm.body.success, true);
  assert.equal(resConfirm.body.status, 'confirmed');
  assert.equal(resConfirm.body.statusHistory.length, 1);

  // 2. Chuyển bất hợp pháp: từ cancelled sang completed
  orderDoc.status = 'cancelled';
  const reqIllegal = {
    json: async () => ({ targetStatus: 'completed', note: 'Hack trạng thái' })
  };
  await assert.rejects(
    async () => context.transitionOrderStatus(reqIllegal, env, adminUser, 'ord_100'),
    err => err.code === 'invalid_transition'
  );
});
