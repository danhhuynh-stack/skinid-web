const assert = require('node:assert/strict');
const path = require('node:path');

// Dynamically import ES Module bankConfig
async function run() {
  const bankConfigPath = path.resolve(__dirname, '../src/config/bankConfig.js');
  const {
    BANK_CONFIG,
    POPULAR_BANK_APPS,
    getOrderShortCode,
    getTransferDescription,
    getVietQrUrl,
    getVietQrPayLink,
    isMobileBrowser
  } = await import(`file://${bankConfigPath.replace(/\\/g, '/')}`);

  // 1. Verify VCB bank configuration
  assert.equal(BANK_CONFIG.bankId, 'VCB');
  assert.equal(BANK_CONFIG.bin, '970436');
  assert.equal(BANK_CONFIG.accountNumber, '1063583549');
  assert.equal(BANK_CONFIG.accountName, 'CT TNHH FIELDMAN');
  assert.equal(BANK_CONFIG.accountNameUnaccented, 'CONG TY TNHH FIELDMAN');

  // 2. Order Short Code & Description format
  assert.equal(getOrderShortCode('order_1234abcd5678'), '1234ABCD');
  assert.equal(getTransferDescription('order_1234abcd5678'), 'SKINID 1234ABCD');
  assert.equal(getTransferDescription(''), 'SKINID');

  // 3. VietQR image URL generation
  const qrUrl = getVietQrUrl({ amount: 350000, orderId: 'order_test123' });
  assert.ok(qrUrl.includes('https://img.vietqr.io/image/VCB-1063583549-compact2.png'));
  assert.ok(qrUrl.includes('amount=350000'));
  assert.ok(qrUrl.includes('addInfo=SKINID%20TEST123'));
  assert.ok(qrUrl.includes('accountName=CONG%20TY%20TNHH%20FIELDMAN'));

  // 4. 1-Tap Universal Deep Link generation
  const payLink = getVietQrPayLink({ amount: 520000, orderId: 'order_pay999' });
  assert.ok(payLink.startsWith('https://vietqr.me/VCB/1063583549/520000/SKINID%20PAY999'));

  // 5. Popular Bank Apps registry
  assert.ok(Array.isArray(POPULAR_BANK_APPS));
  assert.ok(POPULAR_BANK_APPS.length >= 5);
  const vcbApp = POPULAR_BANK_APPS.find((b) => b.id === 'vcb');
  assert.ok(vcbApp);
  assert.equal(vcbApp.appScheme, 'vietcombank://');

  const mbApp = POPULAR_BANK_APPS.find((b) => b.id === 'mb');
  assert.ok(mbApp);
  assert.equal(mbApp.appScheme, 'mbmobile://');

  // 6. Mobile browser detection helper
  assert.equal(typeof isMobileBrowser, 'function');

  console.log('PASS: Vietcombank VietQR 1-Tap deep links, schemes and payload generators verified.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
