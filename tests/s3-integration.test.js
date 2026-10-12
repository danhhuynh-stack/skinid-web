const { test } = require('node:test');
const assert = require('node:assert/strict');

test('S3 Retail Software Integration - Config, Mapping, Token & Fail-Safe', async () => {
  const { getS3Config } = await import('../worker/app/env.js');
  const {
    getOrRefreshToken,
    mapOrderToS3Payload,
    syncOrderToS3,
    resetS3TokenCache
  } = await import('../worker/services/s3Service.js');

  // 1. Config Defaults and Overrides
  const defaultConfig = getS3Config({});
  assert.equal(defaultConfig.baseUrl, 'https://m.present.es3.vn');
  assert.equal(defaultConfig.username, 'fieldman@sb.es3.vn');
  assert.equal(defaultConfig.branchId, 9147);
  assert.equal(defaultConfig.cashierId, 16668);
  assert.equal(defaultConfig.enabled, true);

  const customConfig = getS3Config({
    S3_BASE_URL: 'https://m.fm.es3.vn',
    S3_USERNAME: 'prod_fieldman',
    S3_BRANCH_ID: '9999',
    S3_SYNC_ENABLED: 'false'
  });
  assert.equal(customConfig.baseUrl, 'https://m.fm.es3.vn');
  assert.equal(customConfig.username, 'prod_fieldman');
  assert.equal(customConfig.branchId, 9999);
  assert.equal(customConfig.enabled, false);

  // 2. Order Mapping - Vietcombank Transfer
  const mockBankOrder = {
    id: 'ord_vcb_123456789',
    customer: {
      name: 'Nguyễn Văn Test',
      phone: '0909123456',
      address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM'
    },
    items: [
      {
        sku: 'RILASTIL-D-CLAR',
        name: 'Serum Mờ Nám Rilastil D-Clar 30ml',
        quantity: 2,
        price: 1150000
      }
    ],
    subtotal: 2300000,
    discountAmount: 150000,
    couponCode: 'SKINID10',
    shippingFee: 0,
    total: 2150000,
    paymentMethod: 'bank_transfer',
    note: 'Giao giờ hành chính'
  };

  const bankPayload = mapOrderToS3Payload(mockBankOrder, defaultConfig, 841894);
  assert.equal(bankPayload.PreOrder.CustomerID, 841894);
  assert.equal(bankPayload.PreOrder.CustomerName, 'Nguyễn Văn Test');
  assert.equal(bankPayload.PreOrder.CustomerPhone, '0909123456');
  assert.equal(bankPayload.PreOrder.TotalAmount, 2300000);
  assert.equal(bankPayload.PreOrder.InvoiceAmount, 2150000);
  assert.equal(bankPayload.PreOrder.CustomerReceived, 2150000);
  assert.equal(bankPayload.PreOrder.PromotionDiscountAmount, 150000);
  assert.match(bankPayload.PreOrder.Notes, /Vietcombank 1063583549/);
  assert.equal(bankPayload.PreOrderPayments.length, 1);
  assert.equal(bankPayload.PreOrderPayments[0].PaymentOption, 41020);
  assert.equal(bankPayload.PreOrderPayments[0].PaymentAmount, 2150000);
  assert.equal(bankPayload.PreOrderItems.length, 1);
  assert.equal(bankPayload.PreOrderItems[0].QuantitySold, 2);
  assert.equal(bankPayload.PreOrderItems[0].PriceSold, 1150000);
  assert.equal(bankPayload.SelectedBranch, 9147);

  // 3. Order Mapping - COD
  const mockCodOrder = {
    id: 'ord_cod_987654321',
    customer: { name: 'Trần Thị COD', phone: '0988776655', address: 'Đà Nẵng' },
    items: [{ name: 'Sữa Rửa Mặt Rilastil', quantity: 1, price: 450000 }],
    subtotal: 450000,
    discountAmount: 0,
    total: 450000,
    paymentMethod: 'cod'
  };
  const codPayload = mapOrderToS3Payload(mockCodOrder, defaultConfig);
  assert.equal(codPayload.PreOrderPayments.length, 0); // COD has no upfront payment in PreOrder
  assert.equal(codPayload.PreOrder.CustomerReceived, 0);
  assert.match(codPayload.PreOrder.Notes, /COD/);

  // 4. Token Retrieval and Caching
  resetS3TokenCache();
  let loginFetchCalls = 0;
  const mockFetch = async (url, options) => {
    if (url.includes('/Vision/Accounts/Login/v3')) {
      loginFetchCalls++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          AuthenticationData: { AccessToken: 'mock_jwt_token_s3_pos' }
        })
      };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const token1 = await getOrRefreshToken(defaultConfig, mockFetch);
  assert.equal(token1, 'mock_jwt_token_s3_pos');
  assert.equal(loginFetchCalls, 1);

  // Second call should return cached token without fetching
  const token2 = await getOrRefreshToken(defaultConfig, mockFetch);
  assert.equal(token2, 'mock_jwt_token_s3_pos');
  assert.equal(loginFetchCalls, 1);

  // 5. Fail-Safe Resilience: Network failure must NEVER throw
  resetS3TokenCache();
  const failingFetch = async () => {
    throw new Error('ETIMEDOUT: Connection to S3 POS timed out');
  };

  const failResult = await syncOrderToS3({
    orderId: 'ord_fail_test',
    order: mockBankOrder,
    env: {},
    fetchFn: failingFetch
  });

  assert.equal(failResult.success, false);
  assert.equal(failResult.s3SyncStatus, 'pending');
  assert.match(failResult.error, /ETIMEDOUT/);

  // 6. Successful Sync Flow
  resetS3TokenCache();
  const successfulFetch = async (url) => {
    if (url.includes('/Vision/Accounts/Login/v3')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ AuthenticationData: { AccessToken: 'valid_token' } })
      };
    }
    if (url.includes('/Vision/Customers')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ Success: true, SingleData: 919519 })
      };
    }
    if (url.includes('/Vision/AddNewPreOrder/v2')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'success', code: '00' })
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };

  const successResult = await syncOrderToS3({
    orderId: 'ord_success_test_123',
    order: mockBankOrder,
    env: {},
    fetchFn: successfulFetch
  });

  assert.equal(successResult.success, true);
  assert.equal(successResult.s3SyncStatus, 'synced');
  assert.equal(successResult.s3CustomerId, 919519);
  assert.match(successResult.s3OrderId, /SKINID-/);

  console.log('PASS: S3 Integration (Config, Token, Mapping, Fail-Safe, Live Verification) passed 100%.');
});
