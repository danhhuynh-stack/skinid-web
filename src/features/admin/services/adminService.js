import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { apiRequest } from '../../../infrastructure/http/apiClient.js';

const { db, sdk } = firebaseServices;
const documents = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

export async function fetchAdminDashboard() {
  const { collection, getDocs } = sdk.firestore;
  const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'products'))
  ]);
  return {
    users: documents(usersSnapshot),
    orders: documents(ordersSnapshot).sort((left, right) => (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0)),
    products: documents(productsSnapshot)
  };
}

export async function saveAdminUser(userId, values) {
  if (!userId) throw new Error('Mã người dùng không hợp lệ.');
  const { doc, serverTimestamp, updateDoc } = sdk.firestore;
  await updateDoc(doc(db, 'users', userId), {
    name: String(values.name || '').trim(),
    phone: String(values.phone || '').trim(),
    address: String(values.address || '').trim(),
    updatedAt: serverTimestamp()
  });
}

export async function saveAdminProduct(existingId, values) {
  const slugify = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = existingId || slugify(values.id);
  if (!id) throw new Error('Mã sản phẩm không hợp lệ.');
  const price = Number(values.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Giá bán không hợp lệ.');
  const brand = String(values.brand || '').trim();
  const name = String(values.name || '').trim();
  if (!brand || !name) throw new Error('Tên và thương hiệu là bắt buộc.');
  const { doc, serverTimestamp, setDoc } = sdk.firestore;
  await setDoc(doc(db, 'products', id), {
    name, slug: slugify(name), brand, brandSlug: slugify(brand), price,
    originalPrice: Number(values.originalPrice) || 0,
    volume: String(values.volume || '').trim(),
    stepType: String(values.stepType || 'special'),
    category: String(values.category || values.stepType || ''),
    line: String(values.line || '').trim(),
    image: String(values.image || '').trim(),
    uses: String(values.uses || '').trim(),
    updatedAt: serverTimestamp(),
    ...(existingId ? {} : {
      createdAt: serverTimestamp(), tier: 'Essential', mainActives: [], keyActives: [],
      skinTypes: ['all'], targetConcerns: []
    })
  }, { merge: true });
  return id;
}

export function updateAdminOrder(orderId, changes) {
  const { doc, serverTimestamp, updateDoc } = sdk.firestore;
  return updateDoc(doc(db, 'orders', orderId), { ...changes, updatedAt: serverTimestamp() });
}

export function deleteAdminProduct(productId) {
  return sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'products', productId));
}

export function deleteAdminOrder(orderId) {
  return sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'orders', orderId));
}

export function deleteUserAccount(userId) {
  return apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
