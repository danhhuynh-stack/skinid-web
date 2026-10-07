const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function repository(getDocs, loadFixture = async () => ({ CATALOG_FIXTURE: [{ id: 'p1', name: 'Published', price: 100 }] })) {
  let reads = 0;
  const context = {
    console: { warn() {} }, loadFixture, setAvailableProducts: products => products,
    firebaseServices: { db: {}, sdk: { firestore: {
      collection: () => ({}), getDocs: () => { reads++; return getDocs(); }
    } } }
  };
  vm.createContext(context);
  vm.runInContext(read('src/features/catalog/services/catalogRepository.js')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/export function /g, 'function ')
    .replace("await import('../data/catalogFixture.generated.js')", 'await loadFixture()'), context);
  return { context, reads: () => reads };
}

test('published products render while the shared Firestore enrichment is still pending', async () => {
  let finishRemote;
  const { context, reads } = repository(() => new Promise(resolve => { finishRemote = resolve; }));
  const initial = context.loadProductCatalog();
  assert.equal(initial, context.loadProductCatalog());
  const products = await initial;
  assert.equal(products[0].price, 100);
  assert.equal(reads(), 0);

  const refresh = context.refreshProductCatalog();
  assert.equal(refresh, context.refreshProductCatalog());
  await Promise.resolve();
  assert.equal(reads(), 1);
  assert.equal(await context.loadProductCatalog(), products);

  finishRemote({ empty: false, docs: [{ id: 'p1', data: () => ({ price: 1, name: 'Stale', rating: 4.8 }) }] });
  const enriched = await refresh;
  assert.equal(enriched[0].price, 100);
  assert.equal(enriched[0].name, 'Published');
  assert.equal(enriched[0].rating, 4.8);
  assert.equal(await context.loadProductCatalog(), enriched);
  assert.equal(reads(), 1);
});

test('offline or empty Firestore keeps published products available', async () => {
  for (const getDocs of [async () => { throw new Error('offline'); }, async () => ({ empty: true })]) {
    const { context } = repository(getDocs);
    const products = await context.loadProductCatalog();
    assert.equal(await context.refreshProductCatalog(), products);
  }
});

test('failed fixture download can be retried', async () => {
  let attempts = 0;
  const { context } = repository(async () => ({ empty: true }), async () => {
    if (++attempts === 1) throw new Error('chunk unavailable');
    return { CATALOG_FIXTURE: [{ id: 'p1', price: 100 }] };
  });
  await assert.rejects(context.loadProductCatalog(), /chunk unavailable/);
  assert.equal((await context.loadProductCatalog())[0].id, 'p1');
});

test('legacy loader reuses the module catalog without a Firebase request', async () => {
  const products = [{ id: 'p1', price: 100 }];
  const events = [];
  const context = {
    window: { LOCAL_PRODUCTS: products, SKINID_CATALOG_READY: Promise.resolve(products) },
    document: { dispatchEvent: event => events.push(event) },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    console
  };
  vm.createContext(context);
  vm.runInContext(read('src/js/catalog/catalog-loader.js'), context);
  assert.equal(await context.window.SKINID_CATALOG_READY, products);
  assert.equal(context.window.PRODUCTS, products);
  assert.equal(events[0].detail.source, 'bundled');
});
