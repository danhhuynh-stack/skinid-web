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

console.log('PASS: Worker verifies Firebase tokens, recalculates orders and keeps credentials server-side.');
