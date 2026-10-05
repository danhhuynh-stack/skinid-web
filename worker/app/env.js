import { ApiError } from './errors.js';

export function normalizeFirebasePrivateKey(value) {
  let key = String(value || '').trim();
  if (key.startsWith('{')) {
    try {
      key = JSON.parse(key).private_key || key;
    } catch {
      // Fall through to the normal PEM validation below.
    }
  }
  while (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'")) ||
    (key.startsWith('\\"') && key.endsWith('\\"'))
  ) {
    if (key.startsWith('\\"')) key = key.slice(2, -2).trim();
    else key = key.slice(1, -1).trim();
  }
  return key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
}

export function isValidFirebasePrivateKey(value) {
  const normalized = normalizeFirebasePrivateKey(value);
  const isPkcs8 = normalized.includes('-----BEGIN PRIVATE KEY-----')
    && normalized.includes('-----END PRIVATE KEY-----');
  const isPkcs1 = normalized.includes('-----BEGIN RSA PRIVATE KEY-----')
    && normalized.includes('-----END RSA PRIVATE KEY-----');
  return isPkcs8 || isPkcs1;
}

export function requiredFirebaseEnv(env) {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !isValidFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY)) {
    throw new ApiError(
      503,
      'server_not_configured',
      'Hệ thống đặt hàng đang được bảo trì. Vui lòng thử lại sau ít phút.'
    );
  }
}
