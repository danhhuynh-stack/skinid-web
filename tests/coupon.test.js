const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const checkoutModal = read('src/features/cart/components/CheckoutModal.jsx');
const checkoutModalCss = read('src/features/cart/components/CheckoutModal.css');
const checkoutService = read('src/features/cart/services/checkoutService.js');
const couponServiceSource = read('src/features/cart/services/couponService.js');
const productCatalog = read('src/features/catalog/ProductCatalog.jsx');
const softStorefrontCss = read('src/styles/soft-storefront.css');
const worker = read('worker/index.js');

// 1. Coupon Service Unit Checks
assert.match(couponServiceSource, /AVAILABLE_COUPONS/);
assert.match(couponServiceSource, /SKINID10/);
assert.match(couponServiceSource, /WELCOME50/);
assert.match(couponServiceSource, /FREESHIP/);
assert.match(couponServiceSource, /validateCoupon/);

// Dynamic check coupon logic
async function testCouponLogic() {
  const { validateCoupon } = await import('../src/features/cart/services/couponService.js');
  
  // Valid SKINID10
  const valid10 = validateCoupon('SKINID10', 500000, 30000);
  assert.equal(valid10.valid, true);
  assert.equal(valid10.discount, 50000);

  // SKINID10 below min order
  const belowMin = validateCoupon('skinid10', 100000, 30000);
  assert.equal(belowMin.valid, false);
  assert.match(belowMin.message, /chỉ áp dụng cho đơn hàng từ/);

  // Valid WELCOME50
  const validWelcome = validateCoupon('WELCOME50', 350000, 30000);
  assert.equal(validWelcome.valid, true);
  assert.equal(validWelcome.discount, 50000);

  // Valid FREESHIP
  const validShip = validateCoupon('freeship', 200000, 30000);
  assert.equal(validShip.valid, true);
  assert.equal(validShip.discount, 30000);

  // Invalid code
  const invalid = validateCoupon('KHONG_TON_TAI_99', 500000, 30000);
  assert.equal(invalid.valid, false);
  assert.equal(invalid.message, 'Mã giảm giá không tồn tại hoặc đã hết hạn.');

  // Empty code
  const empty = validateCoupon('', 500000, 30000);
  assert.equal(empty.valid, false);
}

testCouponLogic().then(() => {
  // 2. Checkout Modal & CSS Integration Checks
  assert.match(checkoutModal, /validateCoupon/);
  assert.match(checkoutModal, /react-checkout-coupon/);
  assert.match(checkoutModal, /appliedCoupon/);
  assert.match(checkoutModal, /handleApplyCoupon/);
  assert.match(checkoutModal, /handleRemoveCoupon/);
  assert.match(checkoutModalCss, /\.react-checkout-coupon/);
  assert.match(checkoutModalCss, /\.react-checkout-coupon-input/);
  assert.match(checkoutModalCss, /\.react-checkout-coupon-btn/);

  // 3. Checkout Service & Worker Coupon Transmission
  assert.match(checkoutService, /couponCode/);
  assert.match(worker, /couponCode/);
  assert.match(worker, /discountAmount/);

  // 4. Product Catalog Price Filter Checks
  assert.match(productCatalog, /PRICE_OPTIONS/);
  assert.match(productCatalog, /catalog-price-quick-bar/);
  assert.match(productCatalog, /catalog-price-quick-pill/);
  assert.match(productCatalog, /under-500k/);
  assert.match(productCatalog, /500k-1000k/);
  assert.match(productCatalog, /over-1000k/);
  assert.match(softStorefrontCss, /\.catalog-price-quick-bar/);
  assert.match(softStorefrontCss, /\.catalog-price-quick-pill/);

  console.log('PASS: Coupon voucher engine and Catalog price quick filters verified.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
