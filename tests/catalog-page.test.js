const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const products = JSON.parse(read('src/data/products.js').match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);

function catalog(search) {
  const controls = new Map();
  for (const id of ['product-grid', 'filter-result-count', 'brand-filter-select', 'step-filter-select', 'benefit-filter-select', 'product-search', 'catalog-sort']) {
    controls.set(id, {
      value: '', children: [], html: '', listeners: {},
      set innerHTML(value) { this.html = value; this.children = []; },
      get innerHTML() { return this.html; },
      appendChild(child) { this.children.push(child); },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      dispatchEvent(event) { this.listeners[event.type]?.(event); }
    });
  }
  const location = new URL('https://skinid.test/products' + search);
  const context = {
    PRODUCTS: products,
    URLSearchParams, Event,
    document: { readyState: 'loading', addEventListener() {}, querySelectorAll: () => [], getElementById: id => controls.get(id) },
    window: { location },
    history: { replaceState(_state, _title, url) { location.href = new URL(url, location).href; } },
    createProductCard: product => product
  };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(read('src/js/catalog/product-filters.js'), context);
  vm.runInContext(read('src/js/analysis/skin-analysis.js'), context);
  context.initCatalog();
  return { context, controls, location };
}

test('category links and search restore their combined results after a full page load', () => {
  const { controls, location } = catalog('?step=sunscreen&search=water+touch');
  assert.equal(controls.get('step-filter-select').value, 'sunscreen');
  assert.equal(controls.get('product-search').value, 'water touch');
  assert.deepEqual(controls.get('product-grid').children.map(p => p.id), ['rilastil-1857']);
  assert.equal(location.searchParams.get('search'), 'water touch');
});

test('reset restores the complete catalog and clears controls and URL filters', () => {
  const { context, controls, location } = catalog('?brand=twon&benefit=sang-da-mo-tham&search=lotion');
  assert.equal(controls.get('product-grid').children.length, 1);
  context.window.resetAllFilters();
  assert.equal(controls.get('product-grid').children.length, 54);
  assert.equal(controls.get('product-search').value, '');
  assert.equal(controls.get('brand-filter-select').value, 'all');
  assert.equal(controls.get('benefit-filter-select').value, 'all');
  assert.equal(location.search, '');
});

test('unknown URL filter values are normalized and never injected into result markup', () => {
  const { controls, location } = catalog('?brand=unknown&step=unknown&benefit=%3Cimg%20onerror%3Dalert(1)%3E&sort=unknown');
  assert.equal(controls.get('product-grid').children.length, 54);
  assert.equal(controls.get('catalog-sort').value, 'featured');
  assert(!controls.get('filter-result-count').innerHTML.includes('<img'));
  assert.equal(location.search, '');
});
