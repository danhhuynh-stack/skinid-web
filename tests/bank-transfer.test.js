const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const bankConfig = read('src/config/bankConfig.js');
const checkoutModal = read('src/features/cart/components/CheckoutModal.jsx');
const checkoutModalCss = read('src/features/cart/components/CheckoutModal.css');
const vietQrModal = read('src/features/cart/components/VietQrPaymentModal.jsx');
const vietQrModalCss = read('src/features/cart/components/VietQrPaymentModal.css');
const profileOrders = read('src/features/profile/components/ProfileOrders.jsx');
const worker = read('worker/index.js');

// 1. Bank Configuration Tests
assert.match(bankConfig, /accountNumber:\s*'833373839'/);
assert.match(bankConfig, /accountName:\s*'CÔNG TY TNHH FIELDMAN'/);
assert.match(bankConfig, /accountNameUnaccented:\s*'CONG TY TNHH FIELDMAN'/);
assert.match(bankConfig, /bankId:\s*'MB'/);
assert.match(bankConfig, /https:\/\/img\.vietqr\.io\/image\//);
assert.match(bankConfig, /copyToClipboard/);

// 2. Checkout Modal Payment Selection Tests
assert.match(checkoutModal, /name="payment-method"/);
assert.match(checkoutModal, /value="cod"/);
assert.match(checkoutModal, /value="bank_transfer"/);
assert.match(checkoutModal, /Chuyển khoản VietQR \(MB Bank\)/);
assert.match(checkoutModal, /VietQrPaymentModal/);
assert.match(checkoutModal, /setCreatedOrder/);
assert.match(checkoutModalCss, /\.react-checkout-payment-option/);
assert.match(checkoutModalCss, /\.react-checkout-bank-preview/);

// 3. VietQR Modal & Copy Tests
assert.match(vietQrModal, /Mã VietQR thanh toán/);
assert.match(vietQrModal, /Lưu mã QR vào máy/);
assert.match(vietQrModal, /BANK_CONFIG\.accountNumber/);
assert.match(vietQrModal, /Sao chép/);
assert.match(vietQrModalCss, /\.vietqr-modal-layer/);
assert.match(vietQrModalCss, /\.vietqr-btn-download/);

// 4. Profile Orders VietQR Integration Tests
assert.match(profileOrders, /order\.paymentMethod === 'bank_transfer'/);
assert.match(profileOrders, /Quét mã VietQR/);
assert.match(profileOrders, /VietQrPaymentModal/);

// 5. Worker API Compatibility
assert.match(worker, /payload\.paymentMethod === 'bank_transfer' \? 'bank_transfer' : 'cod'/);

console.log('PASS: MB Bank VietQR transfer is fully configured, tested and UI integrated.');
