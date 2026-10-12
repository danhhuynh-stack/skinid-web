import { apiRequest } from '../../../infrastructure/http/apiClient.js';

export const FREE_SHIPPING_THRESHOLD = 500000;
export const STANDARD_SHIPPING_FEE = 30000;

export function calculateShippingFee(subtotal) {
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
