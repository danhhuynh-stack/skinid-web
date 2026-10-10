export function normalizeProfileSearch(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function matchesProfileSearch(values, query) {
  const text = normalizeProfileSearch(values.join(' '));
  return normalizeProfileSearch(query).split(' ').filter(Boolean).every(word => text.includes(word));
}

export function profileSearchDate(value, fallback = '') {
  if (!value) return fallback;
  const date = typeof value.toDate === 'function' ? value.toDate()
    : value.seconds != null ? new Date(value.seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : `${date.toLocaleString('vi-VN')} ${date.toISOString().slice(0, 10)}`;
}

export function searchScanHistory(history, query) {
  return history.map((scan, index) => ({ scan, index, sessionNumber: history.length - index }))
    .filter(({ scan, sessionNumber }) => matchesProfileSearch([
      scan.id, `#${sessionNumber}`, `Phiên soi da ${sessionNumber}`, scan.skinType,
      scan.dateFormatted, profileSearchDate(scan.timestamp), scan.healthScore, scan.skinAge
    ], query));
}
