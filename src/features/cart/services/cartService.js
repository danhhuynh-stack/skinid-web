import { firebaseServices } from '../../../infrastructure/firebase/index.js';

const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 20;

export function sanitizeCartItems(items = []) {
  const normalized = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const productId = String(item?.productId || '').trim();
    const quantity = Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(Number(item?.quantity) || 0)));
    if (!productId || !quantity) continue;
    normalized.set(productId, {
      productId,
      quantity: Math.min(MAX_QUANTITY, (normalized.get(productId)?.quantity || 0) + quantity)
    });
    if (normalized.size >= MAX_CART_ITEMS) break;
  }
  return [...normalized.values()];
}

export function mergeCartItems(remoteItems = [], localItems = []) {
  return sanitizeCartItems([...remoteItems, ...localItems]);
}

function cartDocument(userId) {
  const { doc } = firebaseServices.sdk.firestore;
  return doc(firebaseServices.db, 'users', userId, 'commerce', 'cart');
}

export async function loadUserCart(userId) {
  if (!userId) return [];
  const { getDoc } = firebaseServices.sdk.firestore;
  const snapshot = await getDoc(cartDocument(userId));
  return snapshot.exists() ? sanitizeCartItems(snapshot.data()?.items) : [];
}

export async function saveUserCart(userId, items) {
  const sanitized = sanitizeCartItems(items);
  if (!userId) return sanitized;
  const { serverTimestamp, setDoc } = firebaseServices.sdk.firestore;
  await setDoc(cartDocument(userId), {
    items: sanitized,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return sanitized;
}
