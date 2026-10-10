const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { filterProducts, getProductCategories, normalizeProductBrand } = require('../src/js/catalog/product-filters');
const source = fs.readFileSync(path.join(__dirname, '../src/data/products.js'), 'utf8');
const products = JSON.parse(source.match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);
const ids = results => results.map(p => p.id);
assert.equal(new Set(ids(products)).size, products.length);
assert.equal(filterProducts(products).length, 54);
for (const brand of ['all', 'rilastil', 'twon', 'dvah', "D'VAH", ' D’VAH ']) {
    for (const step of ['all', 'cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen', 'special']) {
        for (const query of ['', 'gel', 'niacinamide', 'khong-co-san-pham']) {
            const result = filterProducts(products, { brand, step, query });
            for (const p of result) {
                assert(brand === 'all' || normalizeProductBrand(p.brandSlug) === normalizeProductBrand(brand));
                assert(step === 'all' || getProductCategories(p).includes(step));
            }
        }
    }
}
assert.deepEqual(filterProducts(products, { brand: 'twon', step: 'sunscreen' }), []);
assert.deepEqual(filterProducts(products, { brand: 'dvah', step: 'cleanser' }), []);
assert.equal(filterProducts(products, { brand: "D'VAH" }).length, 5);
assert.equal(filterProducts(products, { brand: 'twon', step: 'special' }).length, 3);
assert(ids(filterProducts(products, { step: 'sunscreen' })).includes('rilastil-1856'));
for (const id of ['rilastil-2085', 'rilastil-1125']) {
    assert(ids(filterProducts(products, { step: 'moisturizer' })).includes(id));
    assert(!ids(filterProducts(products, { step: 'special' })).includes(id));
}
for (const id of ['rilastil-1939', 'rilastil-1872']) {
    assert(ids(filterProducts(products, { step: 'special' })).includes(id));
}
assert(filterProducts(products, { query: 'sua rua mat' }).length > 0);

// Benefit filtering tests
assert(filterProducts(products, { benefit: 'tri-mun-kiem-dau' }).length > 0);
assert(filterProducts(products, { benefit: 'sang-da-mo-tham' }).length > 0);
assert(filterProducts(products, { benefit: 'chong-lao-hoa' }).length > 0);
assert(filterProducts(products, { benefit: 'chong-nang' }).length > 0);
assert.equal(filterProducts(products, { brand: 'twon', benefit: 'tri-mun-kiem-dau' }).length, 0);
assert(filterProducts(products, { brand: 'rilastil', benefit: 'tri-mun-kiem-dau', step: 'cleanser' }).length > 0);

console.log('PASS: 168 brand/category/search combinations, aliases, empty intersections, benefit grouping and category regressions.');
