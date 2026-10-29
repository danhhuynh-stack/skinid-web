const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = JSON.parse(read('src/data/ecom-price-list-2026-10.json'));
const products = JSON.parse(read('src/data/products.js').match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);

test('October prices and specifications reconcile all 54 spreadsheet rows across generated catalogs', () => {
  const catalogs = [products,
    JSON.parse(read('src/features/catalog/data/catalogFixture.generated.js').match(/= (\[[\s\S]*\]);/)[1]),
    JSON.parse(read('src/features/catalog/data/catalogSummary.generated.js').match(/= (\[[\s\S]*\]);/)[1]),
    JSON.parse(read('worker/catalog.generated.js').match(/= (\[[\s\S]*\]);/)[1])];
  assert.equal(source.products.length, 54);
  assert.equal(new Set(source.products.map(item => item.id)).size, 54);
  for (const catalog of catalogs) {
    assert.equal(catalog.length, 54);
    for (const row of source.products) {
      const product = catalog.find(item => item.id === row.id);
      assert.equal(product.price, row.price, row.id);
      assert.equal(product.volume, row.volume, row.id);
      assert(Number.isInteger(product.price));
    }
  }
  for (const row of source.products) {
    const product = products.find(item => item.id === row.id);
    assert.equal(product.originalPrice, row.originalPrice);
    assert.equal(product.productCode || null, row.productCode);
    assert.equal(product.unit, row.unit);
    assert.equal(product.sourceName, row.name);
  }
  const variant = products.find(item => item.id === 'rilastil-stretch-marks-75ml');
  assert(fs.existsSync(path.join(__dirname, '../src/assets', variant.image)), variant.image);
});

test('catalog refresh preserves Always On prices when offline and applies Firestore updates when online', async () => {
  const code = read('src/features/catalog/services/catalogRepository.js')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/export function /g, 'function ')
    .replace("await import('../data/catalogFixture.generated.js')", '{ CATALOG_FIXTURE: fixture }');
  for (const offline of [false, true]) {
    const context = { fixture: products, setAvailableProducts: value => value,
      console: { warn() {} }, firebaseServices: { db: {}, sdk: { firestore: {
        collection() {}, async getDocs() {
          if (offline) throw new Error('offline');
          return { empty: false, docs: products.map(product => ({ id: product.id, data: () => ({ price: 999000, originalPrice: 1200000 }) })) };
        }
      } } } };
    vm.createContext(context);
    vm.runInContext(code, context);
    const loaded = await context.refreshProductCatalog();
    for (const row of source.products) {
      const expected = offline ? row.price : 999000;
      assert.equal(loaded.find(item => item.id === row.id).price, expected);
    }
  }
});

test('checkout uses fallback catalog price when unconfigured and applies Firestore admin price when online', async () => {
  const code = read('worker/index.js').replace(/^import[\s\S]*?from '[^']+';\r?\n/gm, '').replace('export default {', 'const worker = {').replace(/^export /gm, '');
  
  // 1. When Firestore has an updated Admin price (e.g. 200,000đ per item), Firestore takes precedence (L10 fix)
  const onlineContext = {
    SERVER_CATALOG: products, crypto: webcrypto, TextEncoder, console,
    isValidFirebasePrivateKey: () => true,
    getDocument: async () => ({ price: 200000, name: 'Admin Updated Price' }),
    commitWrites: async () => {}, encodeFields: value => value, documentName: (_, value) => value,
    json: (_, __, body, status) => ({ body, status })
  };
  vm.createContext(onlineContext);
  vm.runInContext(code, onlineContext);
  const onlineResult = await onlineContext.createOrder({ headers: new Headers(), json: async () => ({
    items: [{ productId: 'dvah-sarika', quantity: 2 }, { productId: 'rilastil-stretch-marks-75ml', quantity: 1 }],
    customer: { name: 'Khách hàng', phone: '0901234567',
      shippingAddress: { line1: '123 Đường A', provinceCode: 79, provinceName: 'TP.HCM', wardCode: 1, wardName: 'Phường A' } }
  }) }, { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' }, { sub: 'test-user' });
  assert.equal(onlineResult.status, 201);
  assert.equal(onlineResult.body.subtotal, 200000 * 2 + 200000);

  // 2. When Firestore has no override (null), fallback catalog price is preserved
  const fallbackContext = {
    SERVER_CATALOG: products, crypto: webcrypto, TextEncoder, console,
    isValidFirebasePrivateKey: () => true,
    getDocument: async () => null,
    commitWrites: async () => {}, encodeFields: value => value, documentName: (_, value) => value,
    json: (_, __, body, status) => ({ body, status })
  };
  vm.createContext(fallbackContext);
  vm.runInContext(code, fallbackContext);
  const fallbackResult = await fallbackContext.createOrder({ headers: new Headers(), json: async () => ({
    items: [{ productId: 'dvah-sarika', quantity: 2 }, { productId: 'rilastil-stretch-marks-75ml', quantity: 1 }],
    customer: { name: 'Khách hàng', phone: '0901234567',
      shippingAddress: { line1: '123 Đường A', provinceCode: 79, provinceName: 'TP.HCM', wardCode: 1, wardName: 'Phường A' } }
  }) }, { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' }, { sub: 'test-user' });
  assert.equal(fallbackResult.status, 201);
  assert.equal(fallbackResult.body.subtotal, 157000 * 2 + 787050);
});
