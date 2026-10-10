const test = require('node:test');
const assert = require('node:assert/strict');

test('React catalog query restores combined filters and search', async () => {
  const { readCatalogQuery } = await import('../src/features/catalog/catalog.query.mjs');
  assert.deepEqual(readCatalogQuery(new URLSearchParams('brand=rilastil&step=sunscreen&search=water+touch&sort=price-asc')), {
    brand: 'rilastil', step: 'sunscreen', benefit: 'all', sort: 'price-asc', query: 'water touch'
  });
});

test('React catalog query removes unknown enum values', async () => {
  const { normalizeCatalogQuery, readCatalogQuery } = await import('../src/features/catalog/catalog.query.mjs');
  const normalized = normalizeCatalogQuery(new URLSearchParams('brand=unknown&benefit=%3Cimg%3E&search=gel'));
  assert.equal(normalized.changed, true);
  assert.equal(normalized.searchParams.toString(), 'search=gel');
  assert.deepEqual(readCatalogQuery(normalized.searchParams), {
    brand: 'all', step: 'all', benefit: 'all', sort: 'featured', query: 'gel'
  });
});

test('React catalog query omits defaults and preserves active criteria', async () => {
  const { updateCatalogQuery } = await import('../src/features/catalog/catalog.query.mjs');
  let params = new URLSearchParams('brand=twon&step=special');
  params = updateCatalogQuery(params, 'brand', 'all');
  params = updateCatalogQuery(params, 'sort', 'price-desc');
  assert.equal(params.toString(), 'step=special&sort=price-desc');
});
