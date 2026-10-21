import { apiRequest } from '../../../infrastructure/http/apiClient.js';

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

/**
 * Kiểm tra xem giỏ hàng có chứa mặt hàng không áp dụng chính sách Freeship hay không.
 * (Theo quy định: Các gói Combo ưu đãi đã giảm giá sâu không áp dụng miễn phí vận chuyển).
 */
export function hasNonFreeshipItems(items = []) {
  if (!Array.isArray(items)) return false;
  return items.some((item) => {
    const id = String(item.productId || item.id || '');
    return id.startsWith('combo-');
  });
}

export function calculateShippingFee(subtotal, items = []) {
  // Nếu có Combo trong giỏ, không áp dụng Freeship tự động
  if (hasNonFreeshipItems(items)) {
    return STANDARD_SHIPPING_FEE;
  }
  return Number(subtotal) >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function createOrder({ items, customer, note = '', paymentMethod = 'cod', couponCode = '', idempotencyKey }) {
  return apiRequest('/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      customer,
      note: String(note).trim(),
      paymentMethod,
      couponCode: String(couponCode).trim().toUpperCase(),
      items: items.map(({ productId, quantity }) => ({ productId, quantity }))
    })
  });
}
