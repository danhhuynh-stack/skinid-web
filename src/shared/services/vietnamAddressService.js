const apiBase = 'https://provinces.open-api.vn/api/v2';

export const vietnamProvinces = [
  [1, 'Thành phố Hà Nội'], [4, 'Tỉnh Cao Bằng'], [8, 'Tỉnh Tuyên Quang'],
  [11, 'Tỉnh Điện Biên'], [12, 'Tỉnh Lai Châu'], [14, 'Tỉnh Sơn La'],
  [15, 'Tỉnh Lào Cai'], [19, 'Tỉnh Thái Nguyên'], [20, 'Tỉnh Lạng Sơn'],
  [22, 'Tỉnh Quảng Ninh'], [24, 'Tỉnh Bắc Ninh'], [25, 'Tỉnh Phú Thọ'],
  [31, 'Thành phố Hải Phòng'], [33, 'Tỉnh Hưng Yên'], [37, 'Tỉnh Ninh Bình'],
  [38, 'Tỉnh Thanh Hóa'], [40, 'Tỉnh Nghệ An'], [42, 'Tỉnh Hà Tĩnh'],
  [44, 'Tỉnh Quảng Trị'], [46, 'Thành phố Huế'], [48, 'Thành phố Đà Nẵng'],
  [51, 'Tỉnh Quảng Ngãi'], [52, 'Tỉnh Gia Lai'], [56, 'Tỉnh Khánh Hòa'],
  [66, 'Tỉnh Đắk Lắk'], [68, 'Tỉnh Lâm Đồng'], [75, 'Tỉnh Đồng Nai'],
  [79, 'Thành phố Hồ Chí Minh'], [80, 'Tỉnh Tây Ninh'], [82, 'Tỉnh Đồng Tháp'],
  [86, 'Tỉnh Vĩnh Long'], [91, 'Tỉnh An Giang'], [92, 'Thành phố Cần Thơ'],
  [96, 'Tỉnh Cà Mau']
].map(([code, name]) => ({ code, name }));

const wardCache = new Map();

export async function fetchVietnamWards(provinceCode) {
  const code = Number(provinceCode);
  if (!Number.isInteger(code)) return [];
  if (wardCache.has(code)) return wardCache.get(code);
  const response = await fetch(`${apiBase}/p/${code}?depth=2`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Không thể tải danh sách phường/xã.');
  const payload = await response.json();
  const wards = Array.isArray(payload.wards)
    ? payload.wards.map(({ code: wardCode, name }) => ({ code: wardCode, name }))
    : [];
  wardCache.set(code, wards);
  return wards;
}

export function createShippingAddress({ line1, provinceCode, wardCode, wards = [] }) {
  const normalizedLine = String(line1 || '').trim();
  const province = vietnamProvinces.find((item) => String(item.code) === String(provinceCode));
  const ward = wards.find((item) => String(item.code) === String(wardCode));
  const hasAny = Boolean(normalizedLine || provinceCode || wardCode);
  if (hasAny && (!normalizedLine || !province || !ward)) {
    throw new Error('Vui lòng nhập đầy đủ tỉnh/thành, phường/xã và địa chỉ chi tiết.');
  }
  return {
    line1: normalizedLine,
    provinceCode: province?.code || 0,
    provinceName: province?.name || '',
    wardCode: ward?.code || 0,
    wardName: ward?.name || '',
    fullAddress: [normalizedLine, ward?.name, province?.name].filter(Boolean).join(', ')
  };
}
