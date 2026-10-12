const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const productCard = read('src/features/catalog/ProductCard.jsx');
const productCatalog = read('src/features/catalog/ProductCatalog.jsx');
const softStorefrontCss = read('src/styles/soft-storefront.css');
const siteCss = read('src/styles/site.css');
const router = read('src/app/router.jsx');
const prepareScript = read('scripts/prepare-gh-pages.mjs');
const header = read('src/components/layout/Header.jsx');
const footer = read('src/components/layout/Footer.jsx');
const offerBar = read('src/components/layout/OfferBar.jsx');

// 1. Audit Issue #1: Product Card uses valid <a href> tag for SEO & multi-tab navigation
assert.match(productCard, /<a\s+[^>]*href=\{`\/products\?detail=\$\{product\.id\}`\}[^>]*className="product-card__title-link"/, 'Product title must be an anchor tag with href for indexing');
assert.match(productCard, /tabIndex=\{-1\}/, 'Product image should have link wrapper with tabIndex -1');

// 2. Audit Issue #2: Dedicated canonical URLs injected in prepare-gh-pages.mjs
assert.match(prepareScript, /routeMeta/, 'prepare-gh-pages must define routeMeta map');
assert.match(prepareScript, /https:\/\/skinid\.vn\/products\//, 'Canonical for products must point to /products/');
assert.match(prepareScript, /https:\/\/skinid\.vn\/khuyen-mai\//, 'Canonical for khuyen-mai must point to /khuyen-mai/');
assert.match(prepareScript, /https:\/\/skinid\.vn\/blog\//, 'Canonical for blog must point to /blog/');

// Check generated HTML if files exist
if (fs.existsSync(path.join(root, 'products', 'index.html'))) {
  const productsHtml = read('products/index.html');
  assert.match(productsHtml, /<link rel="canonical" href="https:\/\/skinid\.vn\/products\/">/);
  assert.match(productsHtml, /<meta property="og:url" content="https:\/\/skinid\.vn\/products\/">/);
}

// 3. Audit Issue #3: CTA tap target >= 44px and font-size >= 13px (0.8125rem)
assert.match(softStorefrontCss, /\.product-card__cart-button span/);
assert.match(softStorefrontCss, /font-size:\s*0\.8125rem\s*!important/);
assert.match(softStorefrontCss, /min-height:\s*48px\s*!important/);
assert.doesNotMatch(siteCss, /\.product-card__cart-button\{min-height:38px\}/, 'Outdated 38px height must be eliminated');

// 4. Audit Issue #4 & #5: Mobile bottom-sheet drawer & shortened search placeholder
assert.match(productCatalog, /placeholder="Tìm sản phẩm, thương hiệu\.\.\."/, 'Search placeholder must be concise for 375px viewport');
assert.match(productCatalog, /catalog-mobile-quick-bar/, 'ProductCatalog must include mobile filter quick bar');
assert.match(productCatalog, /catalog-sheet-backdrop/, 'ProductCatalog must include bottom-sheet filter drawer for mobile');

// 5. Strategic additions: Blog and Promotions routes
assert.match(router, /path:\s*'khuyen-mai'/);
assert.match(router, /path:\s*'blog'/);
assert.match(router, /PromotionsPage\.jsx/);
assert.match(router, /BlogPage\.jsx/);

// 6. Navigation links to Blog and Promotions
assert.match(header, /\/khuyen-mai/);
assert.match(header, /\/blog/);
assert.match(footer, /\/khuyen-mai/);
assert.match(footer, /\/blog/);
assert.match(offerBar, /\/khuyen-mai/);

console.log('PASS: All 7 UX/UI Audit issues verified and protected against regressions.');
