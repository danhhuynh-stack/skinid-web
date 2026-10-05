export const CATALOG_OPTIONS = {
  brand: [
    { value: 'all', label: 'Tất cả thương hiệu' }, { value: 'rilastil', label: 'Rilastil' },
    { value: 'twon', label: 'TWON' }, { value: 'dvah', label: "D'VAH" }
  ],
  step: [
    { value: 'all', label: 'Tất cả danh mục' }, { value: 'cleanser', label: 'Làm sạch' },
    { value: 'toner', label: 'Cân bằng' }, { value: 'treatment', label: 'Đặc trị' },
    { value: 'moisturizer', label: 'Dưỡng ẩm' }, { value: 'sunscreen', label: 'Chống nắng' },
    { value: 'special', label: 'Cơ thể & nước hoa' }
  ],
  benefit: [
    { value: 'all', label: 'Tất cả nhu cầu' }, { value: 'tri-mun-kiem-dau', label: 'Da dầu & mụn' },
    { value: 'cap-am-chuyen-sau', label: 'Da khô & cấp ẩm' }, { value: 'phuc-hoi-diu-da', label: 'Phục hồi & làm dịu' },
    { value: 'sang-da-mo-tham', label: 'Sáng da & mờ thâm' }, { value: 'chong-lao-hoa', label: 'Chống lão hóa' },
    { value: 'chong-nang', label: 'Bảo vệ khỏi nắng' }, { value: 'body-nuoc-hoa', label: 'Cơ thể & nước hoa' }
  ],
  sort: [
    { value: 'featured', label: 'Nổi bật' }, { value: 'price-asc', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' }
  ]
};

export function validCatalogValue(kind, value) {
  const options = CATALOG_OPTIONS[kind];
  if (!options) throw new Error(`Unknown catalog parameter: ${kind}`);
  return options.some(option => option.value === value) ? value : options[0].value;
}

export function readCatalogQuery(searchParams) {
  return {
    brand: validCatalogValue('brand', searchParams.get('brand') || 'all'),
    step: validCatalogValue('step', searchParams.get('step') || 'all'),
    benefit: validCatalogValue('benefit', searchParams.get('benefit') || 'all'),
    sort: validCatalogValue('sort', searchParams.get('sort') || 'featured'),
    query: searchParams.get('search') || ''
  };
}

export function normalizeCatalogQuery(searchParams) {
  const next = new URLSearchParams(searchParams);
  let changed = false;
  for (const key of Object.keys(CATALOG_OPTIONS)) {
    const raw = next.get(key);
    if (raw && validCatalogValue(key, raw) !== raw) {
      next.delete(key);
      changed = true;
    }
  }
  return { searchParams: next, changed };
}

export function updateCatalogQuery(searchParams, key, value) {
  const next = new URLSearchParams(searchParams);
  const defaultValue = key === 'sort' ? 'featured' : 'all';
  if (!value || value === defaultValue) next.delete(key);
  else next.set(key, value);
  return next;
}
