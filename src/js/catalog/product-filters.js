/* Shop categories are not routine steps: body wash must not enter a face routine.
 * Explicit exceptions refer to catalogue IDs, never incidental words in ingredients.
 */
const SHOP_CATEGORY_OVERRIDES = {
    'rilastil-1856': ['sunscreen'],
    'rilastil-2085': ['moisturizer'],
    'rilastil-1125': ['moisturizer'],
    'rilastil-1939': ['special'],
    'rilastil-1872': ['cleanser', 'special'],
    'rilastil-1871': ['cleanser', 'special'],
    'rilastil-1867': ['cleanser', 'special']
};

function normalizeProductBrand(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getProductCategories(product) {
    const brand = normalizeProductBrand(product.brandSlug || product.brand);
    if (brand === 'twon' || brand === 'dvah') return ['special'];
    if (SHOP_CATEGORY_OVERRIDES[product.id]) return SHOP_CATEGORY_OVERRIDES[product.id];
    return product.stepType ? [product.stepType.toLowerCase().trim()] : [];
}

function normalizeProductSearch(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

function getProductBenefits(product) {
    const benefits = new Set();
    if (Array.isArray(product.benefits) && product.benefits.length > 0) {
        product.benefits.forEach(b => {
            const clean = String(b).toLowerCase().trim();
            if (clean) benefits.add(clean);
        });
    }

    const concerns = (product.targetConcerns || []).map(c => String(c).toLowerCase().trim());
    const skinTypes = (product.skinTypes || []).map(s => String(s).toLowerCase().trim());
    const line = String(product.line || '').toUpperCase();
    const text = [
        product.name || '',
        product.uses || '',
        ...(product.keyActives || []),
        ...(product.mainActives || [])
    ].join(' ').toLowerCase();

    // 1. Tri mun kiem dau (Da dau & mun)
    if (concerns.some(c => ['acne', 'sebum', 'pores', 'blemishes', 'blackheads', 'oiliness', 'breakouts'].includes(c)) ||
        skinTypes.some(s => ['oily', 'acne-prone'].includes(s)) ||
        ['ACNES', 'ACNESTIL', 'SEBONORM'].some(l => line.includes(l)) ||
        /mụn|kiềm dầu|bã nhờn|sebum|acne|kháng viêm|dầu thừa|bít tắc/.test(text)) {
        benefits.add('tri-mun-kiem-dau');
    }

    // 2. Cap am chuyen sau (Da kho, thieu am)
    if (concerns.some(c => ['moisture', 'dehydration', 'dryness', 'roughness', 'hydration'].includes(c)) ||
        skinTypes.some(s => ['dry', 'dehydrated'].includes(s)) ||
        ['AQUA', 'HYDRO', 'XEROLACT'].some(l => line.includes(l)) ||
        /cấp ẩm|dưỡng ẩm|thiếu ẩm|khô căng|khô ráp|aqua|hyaluronic|hydrat|ẩm mượt/.test(text)) {
        benefits.add('cap-am-chuyen-sau');
    }

    // 3. Phuc hoi diu da (Da nhay cam)
    if (concerns.some(c => ['redness', 'barrier', 'irritation', 'sensitivity', 'inflammation', 'damage'].includes(c)) ||
        skinTypes.some(s => ['sensitive', 'reactive', 'damaged'].includes(s)) ||
        ['DIFESA', 'REPAIR', 'ELASTIDOC', 'CICAFIR', 'CAMOMILLA'].some(l => line.includes(l)) ||
        /phục hồi|làm dịu|nhạy cảm|kích ứng|hàng rào|dịu da|barrier|soothing|calming|redness|tổn thương/.test(text)) {
        benefits.add('phuc-hoi-diu-da');
    }

    // 4. Sang da mo tham (Tham nam & sac to)
    if (concerns.some(c => ['pigmentation', 'dark-spots', 'uneven-tone', 'dullness', 'melasma', 'hyperpigmentation'].includes(c)) ||
        ['D-CLAR', 'BRIGHT', 'WHITE'].some(l => line.includes(l)) ||
        /mờ thâm|thâm nám|thâm mụn|sắc tố|tàn nhang|đốm nâu|sáng da|đều màu|d-clar|làm sáng|dưỡng sáng|vitamin c|tranexamic/.test(text)) {
        benefits.add('sang-da-mo-tham');
    }

    // 5. Chong lao hoa
    if (concerns.some(c => ['aging', 'wrinkles', 'elasticity', 'firmness', 'fine-lines'].includes(c)) ||
        ['PROGRESSIVE', 'MULTIREPAIR', 'INTENSIVE'].some(l => line.includes(l)) ||
        /lão hóa|nếp nhăn|đàn hồi|săn chắc|chống nhăn|collagen/.test(text)) {
        benefits.add('chong-lao-hoa');
    }

    // 6. Chong nang
    if (product.stepType === 'sunscreen' || ['SUN SYSTEM'].some(l => line.includes(l)) || /chống nắng|chong nang|spf|tia uv/.test(text)) {
        benefits.add('chong-nang');
    }

    // 7. Body & Nuoc hoa
    if (product.stepType === 'special' || /nước hoa|body|sữa tắm|lăn khử mùi/.test(text)) {
        benefits.add('body-nuoc-hoa');
    }

    return Array.from(benefits);
}

function filterProducts(products, { brand = 'all', step = 'all', benefit = 'all', query = '' } = {}) {
    const targetBrand = normalizeProductBrand(brand);
    const targetStep = String(step || 'all').toLowerCase().trim();
    const targetBenefit = String(benefit || 'all').toLowerCase().trim();
    const search = normalizeProductSearch(query);
    return products.filter(product => {
        if (targetBrand !== 'all' && targetBrand &&
            normalizeProductBrand(product.brandSlug || product.brand) !== targetBrand) return false;
        if (targetStep !== 'all' && !getProductCategories(product).includes(targetStep)) return false;
        if (targetBenefit !== 'all' && targetBenefit) {
            const benefits = getProductBenefits(product);
            if (!benefits.includes(targetBenefit)) return false;
        }
        const text = [product.name, product.brand, product.brandSlug, product.line, product.slug, product.uses, product.fullIngredients,
            ...(product.keyActives || []), ...(product.mainActives || [])].join(' ');
        return !search || normalizeProductSearch(text).includes(search);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeProductBrand, getProductCategories, getProductBenefits, filterProducts };
}
