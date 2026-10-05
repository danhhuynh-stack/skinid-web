import { importPKCS8, SignJWT } from 'jose';
import { normalizeFirebasePrivateKey } from './app/env.js';

const tokenCache = new Map();

export function convertPkcs1ToPkcs8(pkcs1Pem) {
  const rawBase64 = String(pkcs1Pem || '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/[\r\n\s]/g, '');

  let binary;
  if (typeof Buffer !== 'undefined') {
    binary = Buffer.from(rawBase64, 'base64');
  } else {
    const rawString = atob(rawBase64);
    binary = new Uint8Array(rawString.length);
    for (let i = 0; i < rawString.length; i++) {
      binary[i] = rawString.charCodeAt(i);
    }
  }

  function encodeLength(len) {
    if (len < 128) return [len];
    const bytes = [];
    let temp = len;
    while (temp > 0) {
      bytes.unshift(temp & 0xff);
      temp >>= 8;
    }
    return [0x80 | bytes.length, ...bytes];
  }

  // AlgorithmIdentifier for rsaEncryption: 1.2.840.113549.1.1.1
  const algoId = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const version = [0x02, 0x01, 0x00];

  const derBytes = Array.from(binary);
  const octetString = [0x04, ...encodeLength(derBytes.length), ...derBytes];
  const inner = [...version, ...algoId, ...octetString];
  const pkcs8Der = [0x30, ...encodeLength(inner.length), ...inner];

  let base64;
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(pkcs8Der).toString('base64');
  } else {
    let str = '';
    for (let i = 0; i < pkcs8Der.length; i++) {
      str += String.fromCharCode(pkcs8Der[i]);
    }
    base64 = btoa(str);
  }

  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

export async function importPKCS1(pem, alg = 'RS256') {
  const pkcs8 = convertPkcs1ToPkcs8(pem);
  return importPKCS8(pkcs8, alg);
}

export function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
}

export function encodeFields(value) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, item]) => [key, encodeValue(item)]));
}

export function decodeValue(value = {}) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
}

export function decodeFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function getGoogleAccessToken(env) {
  const cacheKey = `${env.FIREBASE_PROJECT_ID}:${env.FIREBASE_CLIENT_EMAIL}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const normalizedPrivateKey = normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY);
  let privateKey;
  if (normalizedPrivateKey.includes('BEGIN RSA PRIVATE KEY')) {
    privateKey = await importPKCS1(normalizedPrivateKey, 'RS256');
  } else {
    try {
      privateKey = await importPKCS8(normalizedPrivateKey, 'RS256');
    } catch (error) {
      if (error && String(error.message).includes('pkcs8')) {
        privateKey = await importPKCS1(normalizedPrivateKey, 'RS256');
      } else {
        throw error;
      }
    }
  }
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit'
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(env.FIREBASE_CLIENT_EMAIL)
    .setSubject(env.FIREBASE_CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error('Không thể xác thực tài khoản dịch vụ Firebase.');
  tokenCache.set(cacheKey, { token: payload.access_token, expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000 });
  return payload.access_token;
}

export function documentName(env, path) {
  const segments = String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${segments}`;
}

function documentsBase(env) {
  return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

export async function firestoreRequest(env, path, options = {}) {
  const token = await getGoogleAccessToken(env);
  const response = await fetch(`${documentsBase(env)}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (response.status === 404) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Firestore trả về lỗi ${response.status}.`);
  return payload;
}

export async function getDocument(env, path) {
  const encodedPath = String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const document = await firestoreRequest(env, `/${encodedPath}`);
  return document ? { id: document.name.split('/').pop(), ...decodeFields(document.fields) } : null;
}

export async function runQuery(env, structuredQuery) {
  const rows = await firestoreRequest(env, ':runQuery', {
    method: 'POST',
    body: JSON.stringify({ structuredQuery })
  });
  return (rows || []).filter(row => row.document).map(row => ({
    id: row.document.name.split('/').pop(),
    name: row.document.name,
    ...decodeFields(row.document.fields)
  }));
}

export async function listDocuments(env, collectionPath) {
  const encodedPath = String(collectionPath).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const payload = await firestoreRequest(env, `/${encodedPath}?${query}`) || {};
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return documents.map(document => ({ id: document.name.split('/').pop(), name: document.name, ...decodeFields(document.fields) }));
}

export async function commitWrites(env, writes) {
  return firestoreRequest(env, ':commit', {
    method: 'POST',
    body: JSON.stringify({ writes })
  });
}

export async function deleteFirebaseUser(env, uid) {
  const token = await getGoogleAccessToken(env);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:delete`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ localId: uid })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'Không thể xóa tài khoản Firebase Authentication.');
  return payload;
}
