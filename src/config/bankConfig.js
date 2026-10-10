export const BANK_CONFIG = {
  bankId: 'VCB', // NAPAS short name (Vietcombank)
  bankName: 'Vietcombank (VCB) – Chi Nhánh Nam Sài Gòn',
  bin: '970436', // Vietcombank NAPAS BIN
  accountNumber: '1063583549',
  accountName: 'CT TNHH FIELDMAN',
  accountNameUnaccented: 'CONG TY TNHH FIELDMAN',
  template: 'compact2',
  // Tài khoản phụ MB Bank (dự phòng nội bộ)
  secondaryBank: {
    bankId: 'MB',
    bankName: 'MB Bank – Ngân Hàng TMCP Quân Đội',
    bin: '970422',
    accountNumber: '833373839',
    accountName: 'CÔNG TY TNHH FIELDMAN',
    accountNameUnaccented: 'CONG TY TNHH FIELDMAN'
  }
};

export const POPULAR_BANK_APPS = [
  {
    id: 'vcb',
    name: 'Vietcombank',
    appScheme: 'vietcombank://',
    icon: '🏦',
    note: 'VCB Digibank (Cùng ngân hàng)'
  },
  {
    id: 'mb',
    name: 'MB Bank',
    appScheme: 'mbmobile://',
    icon: '🎖️',
    note: 'MB Bank'
  },
  {
    id: 'techcombank',
    name: 'Techcombank',
    appScheme: 'techcombank://',
    icon: '🔴',
    note: 'Techcombank Mobile'
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    appScheme: 'momo://',
    icon: '👛',
    note: 'MoMo Pay'
  },
  {
    id: 'vpbank',
    name: 'VPBank',
    appScheme: 'vpbankneo://',
    icon: '🟢',
    note: 'VPBank NEO'
  },
  {
    id: 'bidv',
    name: 'BIDV',
    appScheme: 'bidvsmartbanking://',
    icon: '🔷',
    note: 'BIDV SmartBanking'
  },
  {
    id: 'acb',
    name: 'ACB',
    appScheme: 'acbapp://',
    icon: '🔵',
    note: 'ACB ONE'
  },
  {
    id: 'tpbank',
    name: 'TPBank',
    appScheme: 'tpbank://',
    icon: '🟣',
    note: 'TPBank Mobile'
  }
];

export function isMobileBrowser() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
    || (Boolean(navigator.maxTouchPoints) && navigator.maxTouchPoints > 2);
}

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

export function getVietQrPayLink({ amount = 0, orderId = '' } = {}) {
  const numAmount = Math.max(0, Math.round(Number(amount) || 0));
  const desc = getTransferDescription(orderId);
  const bank = BANK_CONFIG.bankId; // VCB
  const account = BANK_CONFIG.accountNumber; // 1063583549
  // Universal VietQR 1-Tap Pay Link
  return `https://vietqr.me/${bank}/${account}/${numAmount}/${encodeURIComponent(desc)}`;
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

export async function launch1TapPayment({ amount = 0, orderId = '', targetScheme = '' } = {}) {
  const desc = getTransferDescription(orderId);
  const numAmount = Math.max(0, Math.round(Number(amount) || 0));
  // 1. Sao chép thông tin dự phòng vào clipboard
  await copyToClipboard(`${BANK_CONFIG.accountNumber} ${desc}`);
  // 2. Chuyển hướng sang 1-Tap Pay Link hoặc App Scheme
  const payUrl = targetScheme || getVietQrPayLink({ amount, orderId });
  if (typeof window !== 'undefined') {
    window.location.href = payUrl;
  }
  return payUrl;
}
