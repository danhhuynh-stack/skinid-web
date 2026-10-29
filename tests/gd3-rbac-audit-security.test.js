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
  const dbStore = new Map();

  const context = {
    ApiError,
    SERVER_CATALOG: [],
    crypto: webcrypto,
    TextEncoder,
    console,
    isValidFirebasePrivateKey: () => true,
    getDocument: async (_, path) => {
      if (overrides.getDocument) return overrides.getDocument(path);
      return dbStore.get(path) || null;
    },
    listDocuments: async (_, coll) => {
      if (overrides.listDocuments) return overrides.listDocuments(coll);
      const results = [];
      for (const [key, val] of dbStore.entries()) {
        if (key.startsWith(`${coll}/`)) {
          results.push({ id: key.replace(`${coll}/`, ''), ...val });
        }
      }
      return results;
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
    setFirebaseCustomUserClaims: async (_, uid, claims) => {
      if (overrides.setFirebaseCustomUserClaims) return overrides.setFirebaseCustomUserClaims(uid, claims);
      return { success: true, uid, claims };
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

test('GD3: Phân quyền 7 vai trò chuẩn và chặn đứng quyền trái phép', async () => {
  const { context } = createTestContext();
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };

  // 1. Kiểm tra danh sách 7 vai trò chuẩn
  assert.ok(context.VALID_ROLES.includes('super_admin'));
  assert.ok(context.VALID_ROLES.includes('admin'));
  assert.ok(context.VALID_ROLES.includes('editor'));
  assert.ok(context.VALID_ROLES.includes('marketing'));
  assert.ok(context.VALID_ROLES.includes('sales'));
  assert.ok(context.VALID_ROLES.includes('dermatologist'));
  assert.ok(context.VALID_ROLES.includes('warehouse'));

  // 2. Chặn non-super-admin gán vai trò
  const regularAdmin = { sub: 'admin_1', role: 'admin', email: 'admin1@skinid.vn' };
  const assignReq = {
    json: async () => ({ uid: 'user_target', role: 'editor' })
  };

  await assert.rejects(
    async () => context.assignStaffRole(assignReq, env, regularAdmin),
    err => err.code === 'permission_denied' && err.status === 403
  );

  // 3. Super Admin gán vai trò thành công
  const superAdmin = { sub: 'sa_1', role: 'super_admin', email: 'admin@skinid.vn' };
  const validAssignReq = {
    json: async () => ({ uid: 'user_target', role: 'editor' })
  };

  const res = await context.assignStaffRole(validAssignReq, env, superAdmin);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.role, 'editor');

  // 4. Từ chối vai trò bất hợp lệ
  const invalidRoleReq = {
    json: async () => ({ uid: 'user_target', role: 'hacker_role' })
  };
  await assert.rejects(
    async () => context.assignStaffRole(invalidRoleReq, env, superAdmin),
    err => err.code === 'invalid_role' && err.status === 400
  );
});

test('GD3: Audit Log ghi vết đầy đủ khi gán quyền và chuyển trạng thái đơn hàng', async () => {
  const { context, dbStore } = createTestContext();
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  const superAdmin = { sub: 'sa_1', role: 'super_admin', email: 'admin@skinid.vn' };

  // Gán vai trò cho nhân viên
  await context.assignStaffRole({
    json: async () => ({ uid: 'staff_1', role: 'warehouse' })
  }, env, superAdmin);

  // Kiểm tra nhật ký hệ thống
  const logsRes = await context.listAuditLogs({}, env, superAdmin);
  assert.equal(logsRes.status, 200);
  assert.ok(logsRes.body.logs.length >= 1);
  const assignLog = logsRes.body.logs.find(l => l.action === 'assign_role');
  assert.ok(assignLog);
  assert.equal(assignLog.actorRole, 'super_admin');
  assert.equal(assignLog.resource, 'staff');
  assert.equal(assignLog.resourceId, 'staff_1');
  assert.equal(assignLog.details.assignedRole, 'warehouse');
});

test('GD3: Quản trị danh sách nhân sự (Staff Directory) lọc bỏ khách hàng thông thường', async () => {
  const { context, dbStore } = createTestContext();
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  const superAdmin = { sub: 'sa_1', role: 'super_admin', email: 'admin@skinid.vn' };

  // Pre-seed users
  dbStore.set('users/u1', { id: 'u1', email: 'bs.lan@skinid.vn', name: 'BS. Lan', role: 'dermatologist' });
  dbStore.set('users/u2', { id: 'u2', email: 'kho.hung@skinid.vn', name: 'Kho Hùng', role: 'warehouse' });
  dbStore.set('users/u3', { id: 'u3', email: 'khachhang@gmail.com', name: 'Khách lẻ', role: 'customer' });

  const res = await context.listStaff({}, env, superAdmin);
  assert.equal(res.status, 200);
  const staff = res.body.staff;
  assert.ok(staff.some(s => s.role === 'dermatologist'));
  assert.ok(staff.some(s => s.role === 'warehouse'));
  assert.ok(!staff.some(s => s.email === 'khachhang@gmail.com'), 'Khách hàng thông thường không được xuất hiện trong danh sách nhân sự');
});
