const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const cartContext = read('src/features/cart/context/CartContext.jsx');
const cartDrawer = read('src/features/cart/components/CartDrawer.jsx');
const freeShippingBar = read('src/features/cart/components/FreeShippingBar.jsx');
const freeShippingBarCss = read('src/features/cart/components/FreeShippingBar.css');
const cartToast = read('src/features/cart/components/CartToast.jsx');
const cartToastCss = read('src/features/cart/components/CartToast.css');
const orderSuccessModal = read('src/features/cart/components/OrderSuccessModal.jsx');
const orderSuccessModalCss = read('src/features/cart/components/OrderSuccessModal.css');
const checkoutModal = read('src/features/cart/components/CheckoutModal.jsx');
const checkoutModalCss = read('src/features/cart/components/CheckoutModal.css');
const productDetailModal = read('src/features/catalog/ProductDetailModal.jsx');

// 1. Cart Context & Toast Notification
assert.match(cartContext, /CartToast/);
assert.match(cartContext, /cartToast/);
assert.match(cartContext, /showToast !== false/);
assert.match(cartToast, /Đã thêm vào giỏ/);
assert.match(cartToastCss, /\.cart-toast-layer/);

// 2. Free Shipping Bar (500k Threshold)
assert.match(freeShippingBar, /FREE_SHIPPING_THRESHOLD/);
assert.match(freeShippingBar, /Miễn phí vận chuyển/);
assert.match(freeShippingBarCss, /\.free-shipping-track/);
assert.match(cartDrawer, /<FreeShippingBar/);

// 3. 2-Column Checkout Layout
assert.match(checkoutModalCss, /\.react-checkout-content-grid/);
assert.match(checkoutModalCss, /\.react-checkout-form-col/);
assert.match(checkoutModalCss, /\.react-checkout-summary-col/);
assert.match(checkoutModal, /react-checkout-mini-item/);
assert.match(checkoutModal, /OrderSuccessModal/);

// 4. Order Success & Thank You Screen
assert.match(orderSuccessModal, /Đặt Hàng Thành Công!/);
assert.match(orderSuccessModal, /order-success-timeline/);
assert.match(orderSuccessModal, /order-success-receipt/);
assert.match(orderSuccessModalCss, /\.order-success-panel/);

// 5. Product Detail Modal Smooth Cart Open
assert.match(productDetailModal, /openDrawer:\s*true/);

console.log('PASS: Cart & Checkout UX overhaul (Toast, Freeship Bar, 2-Column Checkout, OrderSuccessModal) verified.');
