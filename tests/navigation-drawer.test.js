const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterProducts } = require('../src/js/catalog/product-filters.js');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const header = read('src/components/layout/Header.jsx');
const groups = vm.runInNewContext('(' + header.match(/export const navigationGroups = (\[[\s\S]*?\n\]);/)[1] + ')');
const products = JSON.parse(read('src/data/products.js').match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);

test('every drawer shopping link returns matching products using the existing catalog filters', () => {
  const urls = new Set();
  for (const group of groups) {
    for (const [label, href] of group.links) {
      assert(!urls.has(href), 'Duplicate shopping link: ' + href);
      urls.add(href);
      const url = new URL(href, 'https://skinid.test');
      assert.equal(url.pathname, '/products');
      const result = filterProducts(products, Object.fromEntries(url.searchParams));
      assert(result.length > 0, label + ' must have matching products');
      assert(result.length < products.length, label + ' must apply an actual filter');
    }
  }
});

test('drawer previews use existing local images and valid non-checkout destinations', () => {
  for (const group of groups) {
    assert(fs.existsSync(path.join(__dirname, '../src/assets', group.image)), group.image);
    assert(['/skin-analysis', '/#featured-products', '/#brands'].includes(group.previewHref));
    assert(group.imageAlt);
  }
});
