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

test('catalog refresh preserves Always On prices with stale Firestore data and offline', async () => {
  const code = read('src/features/catalog/services/catalogRepository.js')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/export function /g, 'function ')
    .replace("await import('../data/catalogFixture.generated.js')", '{ CATALOG_FIXTURE: fixture }');
  for (const offline of [false, true]) {
    const context = { fixture: products, setAvailableProducts: value => value,
      console: { warn() {} }, firebaseServices: { db: {}, sdk: { firestore: {
        collection() {}, async getDocs() {
          if (offline) throw new Error('offline');
          return { empty: false, docs: products.map(product => ({ id: product.id, data: () => ({ price: 1, originalPrice: 2 }) })) };
        }
      } } } };
    vm.createContext(context);
    vm.runInContext(code, context);
    const loaded = await context.refreshProductCatalog();
    for (const row of source.products) assert.equal(loaded.find(item => item.id === row.id).price, row.price);
  }
});

test('checkout charges the published catalog price even when Firestore still holds an older price', async () => {
  const code = read('worker/index.js').replace(/^import[\s\S]*?from '[^']+';\r?\n/gm, '').replace('export default {', 'const worker = {').replace(/^export /gm, '');
  const context = {
    SERVER_CATALOG: products, crypto: webcrypto, TextEncoder, console,
    isValidFirebasePrivateKey: () => true,
    getDocument: async () => ({ price: 1, name: 'Outdated name' }),
    commitWrites: async () => {}, encodeFields: value => value, documentName: (_, value) => value,
    json: (_, __, body, status) => ({ body, status })
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const result = await context.createOrder({ headers: new Headers(), json: async () => ({
    items: [{ productId: 'dvah-sarika', quantity: 2 }, { productId: 'rilastil-stretch-marks-75ml', quantity: 1 }],
    customer: { name: 'Khách hàng', phone: '0901234567',
      shippingAddress: { line1: '123 Đường A', provinceCode: 79, provinceName: 'TP.HCM', wardCode: 1, wardName: 'Phường A' } }
  }) }, { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' }, { sub: 'test-user' });
  assert.equal(result.status, 201);
  assert.equal(result.body.subtotal, 157000 * 2 + 787050);
  assert.equal(result.body.shippingFee, 0);
});
