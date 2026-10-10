const assert = require('node:assert/strict');

(async () => {
  const { loadProducts, validateProducts } = await import('../scripts/import-products-to-firestore.mjs');
  const products = await loadProducts();
  const result = validateProducts(products);

  assert.equal(result.count, 54);
  assert.equal(result.ids.size, 54);
  assert(products.every(product => product.id && product.name && Number.isFinite(product.price)));
  assert.throws(() => validateProducts([...products, products[0]]), /bị trùng/);

  console.log('PASS: Firestore product import validates 54 unique catalog documents.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
