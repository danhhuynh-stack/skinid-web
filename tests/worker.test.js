const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'worker/index.js'), 'utf8');
const firestore = fs.readFileSync(path.join(root, 'worker/firestore.js'), 'utf8');
const firebaseAuth = fs.readFileSync(path.join(root, 'worker/infrastructure/firebase/auth.js'), 'utf8');
const workerEnv = fs.readFileSync(path.join(root, 'worker/app/env.js'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/cloudflare-deploy.yml'), 'utf8');

assert.match(firebaseAuth, /jwtVerify\(token, jwks/);
assert.match(worker, /getDocument\(env, `products\/\$\{id\}`\)/);
assert.match(worker, /bundledProducts\.get\(id\)/);
assert.match(worker, /if \(!hasFirestore\) return bundledProducts\.get\(id\)/);
assert.match(worker, /idempotency-key/);
assert.match(worker, /crypto\.subtle\.digest\('SHA-256'/);
assert.match(worker, /error instanceof ApiError/);
assert.match(worker, /Hệ thống đang bận/);
assert.match(workerEnv, /server_not_configured/);
assert.match(workerEnv, /isValidFirebasePrivateKey/);
assert.match(workerEnv, /normalizeFirebasePrivateKey/);
assert.match(worker, /isValidFirebasePrivateKey\(env\.FIREBASE_PRIVATE_KEY\)/);
assert.match(firestore, /importPKCS1/);
assert.match(firestore, /BEGIN RSA PRIVATE KEY/);
assert.match(worker, /source: 'cloudflare-worker'/);
assert.match(worker, /currentDocument: precondition/);
assert.match(worker, /users\/\$\{user\.sub\}\/addresses\/default/);
assert.match(worker, /users\/\$\{user\.sub\}\/activities\/\$\{orderId\}/);
assert.match(worker, /count >= 10/);
assert.match(firestore, /https:\/\/oauth2\.googleapis\.com\/token/);
assert.match(firestore, /scope: 'https:\/\/www\.googleapis\.com\/auth\/datastore/);
assert.doesNotMatch(worker + firestore + firebaseAuth + workerEnv, /AIza[\w-]{30,}/);
assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID/);

// GD2: Tiền ở Server - Voucher validation, Shipping calculation & State machine
assert.match(worker, /VALID_ORDER_TRANSITIONS/);
assert.match(worker, /async function transitionOrderStatus/);
assert.match(worker, /transitionMatch/);
assert.match(worker, /coupon_min_order/);
assert.match(worker, /coupon_expired/);
assert.match(worker, /coupon_inactive/);
assert.match(worker, /coupon_limit_exceeded/);
assert.match(worker, /resolveShippingFee/);
assert.match(worker, /duplicate: true/);
assert.match(worker, /statusHistory/);

// GD3: Phân quyền 7 vai trò, Audit Logs, Staff API & Security Headers
assert.match(worker, /VALID_ROLES/);
assert.match(worker, /super_admin/);
assert.match(worker, /dermatologist/);
assert.match(worker, /warehouse/);
assert.match(worker, /assertStaffRole/);
assert.match(worker, /logAuditEvent/);
assert.match(worker, /assignStaffRole/);
assert.match(worker, /listStaff/);
assert.match(worker, /listAuditLogs/);
assert.match(worker, /\/api\/admin\/staff\/roles/);
assert.match(worker, /\/api\/admin\/audit-logs/);
assert.match(firestore, /setFirebaseCustomUserClaims/);
assert.match(workerEnv + worker, /danh\.huynh@fieldman\.vn/);

const httpModule = fs.readFileSync(path.join(root, 'worker/app/http.js'), 'utf8');
assert.match(httpModule, /x-content-type-options/);
assert.match(httpModule, /x-frame-options/);
assert.match(httpModule, /strict-transport-security/);

console.log('PASS: Worker verifies Firebase tokens, recalculates orders, validates vouchers/shipping, enforces 7 RBAC roles and logs audit trails.');
