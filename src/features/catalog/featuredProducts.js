export const FEATURED_PRODUCT_IDS = Object.freeze([
  'rilastil-1774',
  'rilastil-525',
  'rilastil-2067',
  'rilastil-1857',
]);

export function isFeaturedProduct(productId) {
  return FEATURED_PRODUCT_IDS.includes(String(productId || ''));
}
