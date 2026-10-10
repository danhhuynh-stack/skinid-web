export const BANK_CONFIG = {
  bankId: 'MB', // NAPAS short name (MB Bank)
  bankName: 'MB Bank – Ngân Hàng TMCP Quân Đội',
  bin: '970422',
  accountNumber: '833373839',
  accountName: 'CÔNG TY TNHH FIELDMAN',
  accountNameUnaccented: 'CONG TY TNHH FIELDMAN',
  template: 'compact2'
};

export function getOrderShortCode(orderId) {
  if (!orderId) return '';
  return String(orderId).replace(/^order[-_]?/i, '').slice(0, 8).toUpperCase();
}

export function getTransferDescription(orderId) {
  const shortId = getOrderShortCode(orderId);
  return shortId ? `SKINID ${shortId}` : 'SKINID';
}

export function getVietQrUrl({ amount = 0, orderId = '', template = 'compact2' } = {}) {
  const accountNo = BANK_CONFIG.accountNumber;
  const bank = BANK_CONFIG.bankId;
  const desc = getTransferDescription(orderId);
  const accountName = BANK_CONFIG.accountNameUnaccented;
  const numAmount = Math.max(0, Math.round(Number(amount) || 0));

  // VietQR QuickLink URL format (NAPAS 24/7)
  return `https://img.vietqr.io/image/${bank}-${accountNo}-${template}.png?amount=${numAmount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(accountName)}`;
}

export async function copyToClipboard(text) {
  const value = String(text ?? '').trim();
  if (!value) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback if clipboard API is blocked
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
