export function compactActiveLabel(value) {
  const text = String(value || '').split(':')[0].replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (!normalized || normalized.startsWith('KHONG SU DUNG')) return '';

  const labels = [
    ['HOA SEN', 'Hoa sen'], ['HUONG PHAN', 'Hương phấn'], ['HOA TRANG', 'Hoa trắng'],
    ['TRAI CAY', 'Trái cây'], ['GO TRAM', 'Gỗ trầm'], ['GO GU', 'Hương gỗ'],
    ['THAO MOC', 'Thảo mộc'], ['VANI', 'Vani'], ['TINH DAU', 'Tinh dầu'],
    ['VITAMIN E', 'Vitamin E'], ['CERAMIDE', 'Ceramide'], ['GLYCERIN', 'Glycerin'],
    ['PANTHENOL', 'Panthenol'], ['NIACINAMIDE', 'Niacinamide'],
    ['HYALURONIC', 'Hyaluronic acid'], ['SALICYLIC', 'Salicylic acid'], ['SODIUM DNA', 'Sodium DNA']
  ];
  const match = labels.find(([keyword]) => normalized.includes(keyword));
  if (match) return match[1];
  const compact = text.split(' ').filter(word => word && word !== '&').slice(0, 3).join(' ').toLocaleLowerCase('vi-VN');
  return compact.replace(/^\p{Ll}/u, character => character.toLocaleUpperCase('vi-VN'));
}

export function productDisplayName(product) {
  const name = String(product?.name || '')
    .replace(/\s*\d+(?:[.,]\d+)?\s*(?:ml|gr|kg|g|l)\b/gi, '')
    .replace(/\s+([–—-])\s+/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
  let displayName = name.toLocaleLowerCase('vi-VN')
    .replace(/^\p{Ll}/u, character => character.toLocaleUpperCase('vi-VN'))
    .replace(/([–—-]\s*)\p{Ll}/gu, segment => segment.toLocaleUpperCase('vi-VN'));
  const casing = [
    [/(^|\s)d'vah(?=\s|$)/giu, "$1D'VAH"], [/(^|\s)d’vah(?=\s|$)/giu, "$1D'VAH"],
    [/\brilastil\b/giu, 'Rilastil'], [/\btwon\b/giu, 'TWON'],
    [/\bkamal\b/giu, 'Kamal'], [/\bmalini\b/giu, 'Malini'], [/\brakta\b/giu, 'Rakta'],
    [/\bsarika\b/giu, 'Sarika'], [/\btanmaya\b/giu, 'Tanmaya'],
    [/\btamaya\b/giu, 'Tamaya'], [/\bmalani\b/giu, 'Malani'],
    [/\bspf\b/giu, 'SPF'], [/\bdna\b/giu, 'DNA'], [/\bpb\b/giu, 'PB']
  ];
  casing.forEach(([pattern, replacement]) => { displayName = displayName.replace(pattern, replacement); });
  return displayName;
}

export function productBenefit(product) {
  const brand = String(product?.brand || '').toLocaleLowerCase('vi-VN');
  const step = String(product?.stepType || '').toLocaleLowerCase('vi-VN');
  if (brand.includes("d'vah") || brand.includes('d’vah') || brand.includes('dvah')) return 'Hương thơm tinh tế · Tiện mang theo mỗi ngày';
  if (brand.includes('twon')) return 'Nuôi dưỡng cơ thể · Mềm mịn và lưu hương';
  return {
    cleanser: 'Làm sạch dịu nhẹ · Duy trì hàng rào ẩm',
    toner: 'Cân bằng da · Chuẩn bị cho bước dưỡng',
    balance: 'Cân bằng da · Làm dịu và cấp ẩm',
    treatment: 'Chăm sóc chuyên sâu · Cải thiện dấu hiệu da',
    special: 'Tác động chuyên biệt · Hỗ trợ phục hồi da',
    moisturizer: 'Cấp ẩm sâu · Củng cố hàng rào bảo vệ',
    sunscreen: 'Bảo vệ phổ rộng · Hạn chế tác động tia UV',
    body: 'Nuôi dưỡng cơ thể · Da mềm mại hơn'
  }[step] || 'Chăm sóc da hằng ngày · Công thức chuyên biệt';
}

export function formatPrice(price) {
  return `${Number(price || 0).toLocaleString('vi-VN')}đ`;
}
