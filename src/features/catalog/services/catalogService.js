import { CATALOG_SUMMARY } from '../data/catalogSummary.generated.js';

let moduleCatalog = CATALOG_SUMMARY;

const SHOP_CATEGORY_OVERRIDES = {
  'rilastil-1856': ['sunscreen'],
  'rilastil-2085': ['moisturizer'],
  'rilastil-1125': ['moisturizer'],
  'rilastil-1939': ['special'],
  'rilastil-1872': ['cleanser', 'special'],
  'rilastil-1871': ['cleanser', 'special'],
  'rilastil-1867': ['cleanser', 'special']
};

export function normalizeProductBrand(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getProductCategories(product) {
  if (!product) return [];
  const brand = normalizeProductBrand(product.brandSlug || product.brand);
  if (brand === 'twon' || brand === 'dvah') return ['special'];
  if (SHOP_CATEGORY_OVERRIDES[product.id]) return SHOP_CATEGORY_OVERRIDES[product.id];
  return product.stepType ? [product.stepType.toLowerCase().trim()] : [];
}

export function normalizeProductSearch(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export function getProductBenefits(product) {
  if (!product) return [];
  const benefits = new Set();
  if (Array.isArray(product.benefits) && product.benefits.length > 0) {
    product.benefits.forEach((b) => {
      const clean = String(b).toLowerCase().trim();
      if (clean) benefits.add(clean);
    });
  }

  const concerns = (product.targetConcerns || []).map((c) => String(c).toLowerCase().trim());
  const skinTypes = (product.skinTypes || []).map((s) => String(s).toLowerCase().trim());
  const line = String(product.line || '').toUpperCase();
  const text = [
    product.name || '',
    product.uses || '',
    ...(product.keyActives || []),
    ...(product.mainActives || [])
  ].join(' ').toLowerCase();

  // 1. Tri mun kiem dau
  if (concerns.some((c) => ['acne', 'sebum', 'pores', 'blemishes', 'blackheads', 'oiliness', 'breakouts'].includes(c)) ||
      skinTypes.some((s) => ['oily', 'acne-prone'].includes(s)) ||
      ['ACNES', 'ACNESTIL', 'SEBONORM'].some((l) => line.includes(l)) ||
      /mụn|kiềm dầu|bã nhờn|sebum|acne|kháng viêm|dầu thừa|bít tắc/.test(text)) {
    benefits.add('tri-mun-kiem-dau');
  }

  // 2. Cap am chuyen sau
  if (concerns.some((c) => ['moisture', 'dehydration', 'dryness', 'roughness', 'hydration'].includes(c)) ||
      skinTypes.some((s) => ['dry', 'dehydrated'].includes(s)) ||
      ['AQUA', 'INTENSE'].some((l) => line.includes(l)) ||
      /cấp ẩm|dưỡng ẩm|ngậm nước|khô|thiếu nước|mất nước|aqua|moisturizing|hydration/.test(text)) {
    benefits.add('cap-am-chuyen-sau');
  }

  // 3. Phuc hoi diu da
  if (concerns.some((c) => ['sensitivity', 'redness', 'irritation', 'barrier', 'damaged skin'].includes(c)) ||
      skinTypes.some((s) => ['sensitive', 'reactive'].includes(s)) ||
      ['DIFESA', 'CICASTIL', 'RE-PEEL'].some((l) => line.includes(l)) ||
      /phục hồi|làm dịu|da nhạy cảm|kích ứng|mẩn đỏ|tổn thương|barrier|soothing|calming|repair/.test(text)) {
    benefits.add('phuc-hoi-diu-da');
  }

  // 4. Sang da mo tham
  if (concerns.some((c) => ['pigmentation', 'dark spots', 'dullness', 'uneven skin tone', 'brightening'].includes(c)) ||
      ['D-CLAR'].some((l) => line.includes(l)) ||
      /sáng da|mờ thâm|nám|tàn nhang|đốm nâu|d-clar|brightening|depigmenting|đều màu/.test(text)) {
    benefits.add('sang-da-mo-tham');
  }

  // 5. Chong lao hoa
  if (concerns.some((c) => ['aging', 'wrinkles', 'fine lines', 'loss of firmness', 'elasticity'].includes(c)) ||
      ['HYDROTENSEUR', 'MULTIREPAIR', 'PROGRESSIVE'].some((l) => line.includes(l)) ||
      /chống lão hóa|nếp nhăn|săn chắc|đàn hồi|trẻ hóa|retinol|anti-wrinkle|firming|elasticity/.test(text)) {
    benefits.add('chong-lao-hoa');
  }

  // 6. Chong nang
  if (product.stepType === 'sunscreen' || ['SUN SYSTEM'].some((l) => line.includes(l)) || /chống nắng|spf|uv/.test(text)) {
    benefits.add('chong-nang');
  }

  // 7. Body & Nuoc hoa
  if (product.stepType === 'special' || /nước hoa|body|sữa tắm|lăn khử mùi/.test(text)) {
    benefits.add('body-nuoc-hoa');
  }

  return Array.from(benefits);
}

export function filterProducts(products = [], { brand = 'all', step = 'all', benefit = 'all', query = '' } = {}) {
  const targetBrand = normalizeProductBrand(brand);
  const targetStep = String(step || 'all').toLowerCase().trim();
  const targetBenefit = String(benefit || 'all').toLowerCase().trim();
  const search = normalizeProductSearch(query);
  return products.filter((product) => {
    if (targetBrand !== 'all' && targetBrand &&
        normalizeProductBrand(product.brandSlug || product.brand) !== targetBrand) return false;
    if (targetStep !== 'all' && !getProductCategories(product).includes(targetStep)) return false;
    if (targetBenefit !== 'all' && targetBenefit) {
      const benefits = getProductBenefits(product);
      if (!benefits.includes(targetBenefit)) return false;
    }
    const text = [
      product.name, product.brand, product.brandSlug, product.line, product.slug, product.uses, product.fullIngredients,
      ...(product.keyActives || []), ...(product.mainActives || [])
    ].join(' ');
    return !search || normalizeProductSearch(text).includes(search);
  });
}

/**
 * Returns the current available catalog of products.
 * Falls back to window.LOCAL_PRODUCTS or window.PRODUCTS if available.
 */
export function getAvailableProducts() {
  if (typeof window !== 'undefined') {
    if (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0) {
      return window.PRODUCTS;
    }
    if (Array.isArray(window.LOCAL_PRODUCTS) && window.LOCAL_PRODUCTS.length > 0) {
      return window.LOCAL_PRODUCTS;
    }
  }
  return moduleCatalog;
}

export function setAvailableProducts(products) {
  if (Array.isArray(products) && products.length) moduleCatalog = products;
  return moduleCatalog;
}

/**
 * Finds a single product by ID.
 * @param {string} productId
 */
export function getProductById(productId) {
  const products = getAvailableProducts();
  return products.find((p) => p.id === productId) || null;
}

/**
 * Filters the product catalog based on provided criteria.
 * @param {Array} products
 * @param {Object} filters
 */
export function applyProductFilters(products, filters = {}) {
  const catalog = products?.length ? products : getAvailableProducts();
  return filterProducts(catalog, filters);
}
