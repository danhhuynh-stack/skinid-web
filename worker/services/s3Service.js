/**
 * S3 Retail Software Integration Service (ES3 / m.present.es3.vn / m.fm.es3.vn)
 * Manages authentication, token caching, customer sync, order payload mapping, and resilient API dispatching.
 */

import { getS3Config } from '../app/env.js';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Reset token cache (useful for tests)
 */
export function resetS3TokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Retrieve or refresh authentication token from S3 API
 * Endpoint: POST /Vision/Accounts/Login/v3
 */
export async function getOrRefreshToken(config, fetchFn = fetch) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const baseUrl = (config.baseUrl || 'https://m.present.es3.vn').replace(/\/+$/, '');
  const loginUrl = `${baseUrl}/Vision/Accounts/Login/v3`;

  const response = await fetchFn(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      Username: config.username,
      Password: config.password
    })
  });

  if (!response.ok) {
    throw new Error(`S3 Login HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const token = data.AuthenticationData?.AccessToken;
  if (!token) {
    throw new Error(`S3 Login failed: ${data.Message || 'No AccessToken returned'}`);
  }

  cachedToken = token;
  // Tokens typically expire in 24h (86400s)
  tokenExpiresAt = now + 86400 * 1000;

  return cachedToken;
}

/**
 * Create or sync customer on S3 POS
 * Endpoint: POST /Vision/Customers
 */
export async function syncCustomerToS3({ customer, token, config, fetchFn = fetch }) {
  if (!customer?.phone && !customer?.name) return 0;

  const baseUrl = (config.baseUrl || 'https://m.present.es3.vn').replace(/\/+$/, '');
  const custUrl = `${baseUrl}/Vision/Customers`;

  const fullName = String(customer.name || 'Khách hàng SkinID').trim();
  const nameParts = fullName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[0] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : fullName;

  try {
    const res = await fetchFn(custUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Id: 0,
        FirstName: firstName,
        LastName: lastName,
        BirthdayDay: 0,
        BirthdayMonth: 0,
        Email: customer.email || '',
        Company: 'SkinID Web Customer',
        Address: customer.address || '',
        Phone: customer.phone || '',
        Mobile: customer.phone || '',
        Fax: '',
        Notes: `Đăng ký từ SkinID.vn | SĐT: ${customer.phone || ''}`,
        Gender: 'M',
        City: 'Hồ Chí Minh',
        Country: 'VN',
        IsActive: true,
        IsCustomer: true,
        CustomerCategoryIds: ''
      })
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.Success && data.SingleData) {
        return Number(data.SingleData);
      }
    }
  } catch (err) {
    console.warn('[S3 Customer Sync Warning]', err.message);
  }

  return 0;
}

/**
 * Map SkinID order to S3 PreOrder payload
 * Follows "Tài liệu API tích hợp ES3 v1.4" Section 8
 */
export function mapOrderToS3Payload(order, config, customerId = 0) {
  const isBankTransfer = order.paymentMethod === 'bank_transfer';
  const orderId = String(order.id || order.orderId || '').trim();
  const branchId = Number(config.branchId || 9147);
  const cashierId = Number(config.cashierId || 16668);

  const preOrderItems = (order.items || []).map((item, index) => {
    const unitPrice = Number(item.price || item.unitPrice || 0);
    const quantity = Number(item.quantity || 1);
    const productId = Number(item.s3ProductId || item.skuNumber || (index + 1));
    const productName = String(item.name || item.productName || 'Sản phẩm SkinID').slice(0, 200);

    return {
      YS_ProductID: productId,
      QuantitySold: quantity,
      PriceSold: unitPrice,
      Discount: "0",
      Attributes: "",
      AttributeKey: "",
      ReferenceCode: 0,
      UnitCost: unitPrice,
      MultiUOMKey: "",
      PromotionsKey: "",
      ProductName: productName,
      UOMDisplay: "Cái",
      ImageUrl: item.imageUrl || "",
      YS_PreOrderItemID: 0,
      CurrentQuantityFree: 0,
      CurrentAmountFree: 0,
      TotalQuantityFree: 0,
      TotalAmountFree: 0,
      BaseUOMID: 0,
      UOMID: 0,
      ExchangedVal: 0,
      OriginalPrice: unitPrice,
      IsChangedPrice: false,
      UOMs: null,
      Promotions: null,
      ProductVAT: "0",
      ProductVATTaxAmount: 0
    };
  });

  const preOrderPayments = isBankTransfer ? [
    {
      PaymentOption: 41020, // Bank Transfer in S3
      PaymentAmount: Number(order.total || 0),
      ReferenceCode: `VCB-${orderId}`
    }
  ] : [];

  return {
    PreOrder: {
      YS_PreOrderID: 0,
      Cashier: cashierId,
      CustomerID: Number(customerId || order.s3CustomerId || 0),
      CustomerName: String(order.customer?.name || '').slice(0, 100),
      CustomerPhone: String(order.customer?.phone || '').slice(0, 20),
      CustomerAddress: String(order.customer?.address || '').slice(0, 300),
      InvoiceDiscount: order.discountAmount ? String(order.discountAmount) : "0",
      TotalAmount: Number(order.subtotal || order.total || 0),
      InvoiceAmount: Number(order.total || 0),
      CustomerReceived: isBankTransfer ? Number(order.total || 0) : 0,
      Notes: `[SkinID Đơn: #${orderId.slice(0, 8)}] ${order.note || ''} | ${isBankTransfer ? 'Vietcombank 1063583549' : 'COD'}`.trim(),
      PromotionName: order.couponCode ? `Voucher ${order.couponCode}` : "",
      PromotionAmount: Number(order.discountAmount || 0),
      PromotionDiscount: order.discountAmount ? String(order.discountAmount) : "0",
      PromotionDiscountAmount: Number(order.discountAmount || 0),
      NgayLayHang: null,
      HadChangedProductPrice: false,
      HadDiscountProduct: Number(order.discountAmount || 0) > 0,
      VAT: 0,
      VATTaxAmount: 0
    },
    PreOrderPayments: preOrderPayments,
    PreOrderItems: preOrderItems,
    StorefrontOrderID: 0,
    SelectedBranch: branchId,
    RequestId: `SKINID-${orderId.slice(0, 16) || Date.now()}`
  };
}

/**
 * Send order to S3 POS API with strict fail-safe resilience
 * Never throws an unhandled error so customer checkout is NEVER interrupted.
 */
export async function syncOrderToS3({ orderId, order, env = {}, timeoutMs = 4000, fetchFn = fetch }) {
  const config = getS3Config(env);

  if (!config.enabled) {
    return {
      success: false,
      skipped: true,
      reason: 's3_sync_disabled',
      s3SyncStatus: 'disabled'
    };
  }

  const normalizedOrder = {
    ...order,
    id: orderId || order.id || order.orderId
  };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    const token = await getOrRefreshToken(config, fetchFn);

    // Sync or create customer profile on S3
    const customerId = await syncCustomerToS3({
      customer: normalizedOrder.customer,
      token,
      config,
      fetchFn
    });

    const payload = mapOrderToS3Payload(normalizedOrder, config, customerId);
    const baseUrl = (config.baseUrl || 'https://m.present.es3.vn').replace(/\/+$/, '');
    const postUrl = `${baseUrl}/Vision/AddNewPreOrder/v2`;

    const response = await fetchFn(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller?.signal
    });

    if (timeoutId) clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => ({}));

    if (response.ok && (responseData.success || responseData.code === '00' || responseData.code === 0)) {
      const s3OrderId = responseData.code === '00' ? (payload.RequestId) : (responseData.PreOrderID || payload.RequestId);
      return {
        success: true,
        s3OrderId: String(s3OrderId),
        s3CustomerId: customerId || undefined,
        s3SyncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        raw: responseData
      };
    }

    const errorMsg = responseData.message || responseData.Message || `HTTP ${response.status}`;
    console.warn(`[S3 Sync Warning] Order #${normalizedOrder.id} failed to sync to S3:`, errorMsg);

    return {
      success: false,
      s3SyncStatus: 'pending',
      error: errorMsg,
      payload
    };
  } catch (error) {
    const isTimeout = error.name === 'AbortError' || error.message?.includes('aborted');
    const errorMsg = isTimeout ? 'S3 API request timed out (> 4s)' : (error.message || 'Unknown S3 network error');
    console.warn(`[S3 Sync Fail-Safe] Order #${normalizedOrder.id}:`, errorMsg);

    return {
      success: false,
      s3SyncStatus: 'pending',
      error: errorMsg
    };
  }
}
