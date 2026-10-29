import {
  DEFAULT_SYSTEM_SETTINGS,
  fetchSystemSettings,
  saveSystemSettings,
  fetchVouchers,
  saveVoucher,
  deleteVoucher,
  fetchCampaign,
  saveCampaign,
  fetchBlogPosts,
  saveBlogPost,
  deleteBlogPost
} from '../../content/index.js';
import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { apiRequest } from '../../../infrastructure/http/apiClient.js';

const { db, sdk } = firebaseServices;
const documents = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

// GĐ0: Removed localStorage override for roles

function readUserOverrides() { return {}; }

function writeUserOverrides() {}

function mergeUsersWithOverrides(remoteUsers = []) {
  const overrides = readUserOverrides();
  const mergedMap = new Map();

  for (const u of remoteUsers) {
    if (!u?.id) continue;
    mergedMap.set(u.id, { ...u });
  }

  for (const [key, patch] of Object.entries(overrides)) {
    if (!patch || typeof patch !== 'object') continue;
    const targetId = patch.id || key;
    if (patch.deleted) {
      mergedMap.delete(targetId);
      // Also delete by email if matched
      if (patch.email) {
        for (const [existingId, existingUser] of mergedMap.entries()) {
          if (String(existingUser.email || '').toLowerCase() === String(patch.email).toLowerCase()) {
            mergedMap.delete(existingId);
          }
        }
      }
      continue;
    }

    // Match by id first, then by email
    let matchedId = mergedMap.has(targetId) ? targetId : null;
    if (!matchedId && patch.email) {
      for (const [existingId, existingUser] of mergedMap.entries()) {
        if (String(existingUser.email || '').toLowerCase() === String(patch.email).toLowerCase()) {
          matchedId = existingId;
          break;
        }
      }
    }

    if (matchedId) {
      const current = mergedMap.get(matchedId);
      mergedMap.set(matchedId, { ...current, ...patch, id: matchedId });
    } else if (patch.email) {
      mergedMap.set(targetId, { id: targetId, ...patch });
    }
  }

  return Array.from(mergedMap.values());
}

export async function fetchAdminDashboard() {
  const { collection, getDocs } = sdk.firestore;

  try {
    const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')).catch((err) => {
        console.warn('[Admin Dashboard] Users read restricted:', err.message);
        return { docs: [] };
      }),
      getDocs(collection(db, 'orders')).catch((err) => {
        console.warn('[Admin Dashboard] Orders read restricted:', err.message);
        return { docs: [] };
      }),
      getDocs(collection(db, 'products')).catch((err) => {
        console.warn('[Admin Dashboard] Products read restricted:', err.message);
        return { docs: [] };
      })
    ]);

    const remoteOrders = documents(ordersSnapshot);
    const mergedOrders = remoteOrders.sort((left, right) => {
      const getMs = (item) => {
        if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
        if (typeof item.createdAt === 'string' || typeof item.createdAt === 'number') return new Date(item.createdAt).getTime();
        return 0;
      };
      return getMs(right) - getMs(left);
    });

    return {
      users: mergeUsersWithOverrides(documents(usersSnapshot)),
      orders: mergedOrders,
      products: documents(productsSnapshot)
    };
  } catch (err) {
    console.warn('[Admin Dashboard] Graceful fallback on unexpected error:', err.message);
    return {
      users: mergeUsersWithOverrides([]),
      orders: sharedOrders,
      products: []
    };
  }
}

export async function saveAdminUser(userId, values) {
  if (!userId) throw new Error('Mã người dùng không hợp lệ.');
  const validRoles = ['super_admin', 'admin', 'staff', 'customer'];
  const patch = {
    name: String(values.name || '').trim(),
    phone: String(values.phone || '').trim(),
    address: String(values.address || '').trim(),
    ...(values.role && validRoles.includes(values.role) ? { role: values.role } : {})
  };

  const overrides = readUserOverrides();
  overrides[userId] = {
    ...(overrides[userId] || {}),
    id: userId,
    ...patch,
    deleted: false,
    updatedAtIso: new Date().toISOString()
  };
  writeUserOverrides(overrides);

  try {
    const { doc, serverTimestamp, setDoc } = sdk.firestore;
    await setDoc(doc(db, 'users', userId), {
      ...patch,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Admin Users] Firestore saveAdminUser fallback to local override:', err.message);
  }
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
    name,
    slug: values.slug ? slugify(values.slug) : slugify(name),
    brand,
    brandSlug: slugify(brand),
    price,
    originalPrice: Number(values.originalPrice) || 0,
    volume: String(values.volume || '').trim(),
    stepType: String(values.stepType || 'special'),
    category: String(values.category || values.stepType || ''),
    line: String(values.line || '').trim(),
    image: String(values.image || '').trim(),
    uses: String(values.uses || '').trim(),
    // Các trường On-Page SEO
    seoTitle: String(values.seoTitle || name).trim(),
    seoDescription: String(values.seoDescription || values.uses || '').trim(),
    ogImage: String(values.ogImage || values.image || '').trim(),
    imageAlt: String(values.imageAlt || name).trim(),
    canonicalUrl: String(values.canonicalUrl || '').trim(),
    robotsMeta: String(values.robotsMeta || 'index_follow').trim(),
    updatedAt: serverTimestamp(),
    ...(existingId ? {} : {
      createdAt: serverTimestamp(),
      tier: 'Essential',
      mainActives: [],
      keyActives: [],
      skinTypes: ['all'],
      targetConcerns: []
    })
  }, { merge: true });

  try {
    const { refreshProductCatalog } = await import('../../catalog/services/catalogRepository.js');
    await refreshProductCatalog(true);
  } catch {}

  return id;
}

export function updateAdminOrder(orderId, changes) {
  const { doc, serverTimestamp, updateDoc } = sdk.firestore;
  return updateDoc(doc(db, 'orders', orderId), { ...changes, updatedAt: serverTimestamp() });
}

export async function deleteAdminProduct(productId) {
  await sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'products', productId));
  try {
    const { refreshProductCatalog } = await import('../../catalog/services/catalogRepository.js');
    await refreshProductCatalog(true);
  } catch {}
}

export function deleteAdminOrder(orderId) {
  return sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'orders', orderId));
}

export async function deleteUserAccount(userId) {
  if (!userId) throw new Error('Mã người dùng không hợp lệ.');
  const overrides = readUserOverrides();
  overrides[userId] = {
    ...(overrides[userId] || {}),
    id: userId,
    deleted: true,
    updatedAtIso: new Date().toISOString()
  };
  writeUserOverrides(overrides);

  try {
    await sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'users', userId));
  } catch (err) {
    console.warn('[Admin Users] Firestore deleteUserAccount fallback to local override:', err.message);
  }

  return apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' }).catch(() => ({ ok: true }));
}

export async function resyncAdminOrderToS3(orderOrId) {
  const order = typeof orderOrId === 'object' && orderOrId !== null ? orderOrId : null;
  const orderId = order ? order.id : String(orderOrId || '');
  if (!orderId) throw new Error('Mã đơn hàng không hợp lệ.');
  return apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/resync-s3`, { method: 'POST' });
}

export async function syncAllPendingOrdersToS3(orders = []) {
  const pendingOrders = orders.filter((o) => o.s3SyncStatus !== 'synced');
  let successCount = 0;
  let failCount = 0;

  for (const order of pendingOrders) {
    try {
      await resyncAdminOrderToS3(order);
      successCount++;
    } catch (err) {
      console.warn(`[Batch S3 Sync] Order #${order.id} failed:`, err.message);
      failCount++;
    }
  }

  return { total: pendingOrders.length, successCount, failCount };
}

export const VALID_ROLES = [
  'super_admin',
  'admin',
  'editor',
  'marketing',
  'sales',
  'dermatologist',
  'warehouse',
  'customer'
];

export async function updateUserRole(userId, newRole, extraMeta = {}) {
  if (!userId) throw new Error('Mã người dùng không hợp lệ.');
  if (!VALID_ROLES.includes(newRole)) throw new Error('Vai trò không hợp lệ.');

  let remoteSuccess = false;
  try {
    const res = await apiRequest('/admin/staff/roles', {
      method: 'POST',
      body: JSON.stringify({ uid: userId, role: newRole })
    });
    if (res && res.success) remoteSuccess = true;
  } catch (err) {
    console.warn('[Admin Staff API] Worker endpoint not available, falling back:', err.message);
  }

  const overrides = readUserOverrides();
  overrides[userId] = {
    ...(overrides[userId] || {}),
    ...(extraMeta && typeof extraMeta === 'object' ? extraMeta : {}),
    id: userId,
    role: newRole,
    deleted: false,
    updatedAtIso: new Date().toISOString()
  };
  writeUserOverrides(overrides);

  if (!remoteSuccess) {
    try {
      const { doc, serverTimestamp, setDoc } = sdk.firestore;
      await setDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('[Admin Users] Firestore updateUserRole fallback to local override:', err.message);
    }
  }
}

export async function assignAdminByEmail(email, role = 'admin', name = '') {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Vui lòng nhập địa chỉ email hợp lệ.');
  }
  if (!VALID_ROLES.includes(role)) throw new Error('Vai trò không hợp lệ.');

  const slug = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const tempId = `member_${slug}`;
  const displayName = String(name || '').trim() || cleanEmail.split('@')[0];

  const overrides = readUserOverrides();
  let targetKey = tempId;
  for (const [k, val] of Object.entries(overrides)) {
    if (String(val?.email || '').toLowerCase() === cleanEmail) {
      targetKey = k;
      break;
    }
  }

  overrides[targetKey] = {
    ...(overrides[targetKey] || {}),
    id: overrides[targetKey]?.id || targetKey,
    email: cleanEmail,
    name: displayName,
    role,
    isPreassigned: true,
    deleted: false,
    updatedAtIso: new Date().toISOString()
  };
  writeUserOverrides(overrides);

  try {
    const { collection, getDocs, query, where, doc, setDoc, serverTimestamp } = sdk.firestore;
    const snapshot = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      overrides[userDoc.id] = {
        ...overrides[targetKey],
        id: userDoc.id
      };
      if (targetKey !== userDoc.id) delete overrides[targetKey];
      writeUserOverrides(overrides);

      await updateUserRole(userDoc.id, role, { name: displayName });
      return { isNew: false, id: userDoc.id, email: cleanEmail, role };
    }

    await setDoc(doc(db, 'users', tempId), {
      email: cleanEmail,
      name: displayName,
      role,
      isPreassigned: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { isNew: true, id: tempId, email: cleanEmail, role };
  } catch (err) {
    console.warn('[Admin Users] Firestore assignAdminByEmail fallback to local override:', err.message);
    return { isNew: true, id: targetKey, email: cleanEmail, role };
  }
}

export async function fetchAuditLogs() {
  try {
    const res = await apiRequest('/admin/audit-logs');
    if (res?.logs) return res.logs;
  } catch (err) {
    console.warn('[Admin Audit Logs] API fetch failed, querying Firestore:', err.message);
  }

  try {
    const { collection, getDocs, query, orderBy, limit } = sdk.firestore;
    const snapshot = await getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(50)));
    return documents(snapshot);
  } catch (err) {
    console.warn('[Admin Audit Logs] Firestore direct query failed:', err.message);
    return [];
  }
}

export async function fetchStaffDirectory() {
  try {
    const res = await apiRequest('/admin/staff');
    if (res?.staff) return res.staff;
  } catch (err) {
    console.warn('[Admin Staff Directory] API fetch failed:', err.message);
  }
  return [];
}

export {
  DEFAULT_SYSTEM_SETTINGS,
  fetchSystemSettings,
  saveSystemSettings,
  fetchVouchers,
  saveVoucher,
  deleteVoucher,
  fetchCampaign,
  saveCampaign,
  fetchBlogPosts,
  saveBlogPost,
  deleteBlogPost
};

// Compatibility no-op helpers (eliminated localStorage)
export function readLocalVouchers() { return null; }
export function writeLocalVouchers() {}
export function readLocalCampaign() { return null; }
export function writeLocalCampaign() {}
export function readLocalBlogPosts() { return null; }
export function writeLocalBlogPosts() {}
export function readLocalSystemSettings() { return null; }
export function writeLocalSystemSettings() {}

export async function fetchAdminPromotions() {
  const [vouchers, campaign] = await Promise.all([
    fetchVouchers().catch(() => []),
    fetchCampaign().catch(() => null)
  ]);
  return { vouchers: vouchers || [], campaign };
}

export async function saveAdminVoucher(id, voucherData) {
  const data = typeof id === 'object' && id !== null ? id : { ...(voucherData || {}), code: id };
  return await saveVoucher(data);
}

export async function deleteAdminVoucher(code) {
  return await deleteVoucher(code);
}

export async function fetchAdminCampaign() {
  return await fetchCampaign();
}

export async function saveAdminCampaign(campaignData) {
  return await saveCampaign(campaignData);
}

export async function fetchAdminBlogPosts() {
  return await fetchBlogPosts();
}

export async function saveAdminBlogPost(postId, postData) {
  const data = typeof postId === 'object' && postId !== null ? postId : { ...(postData || {}), id: postId };
  return await saveBlogPost(data);
}

export async function deleteAdminBlogPost(postId) {
  return await deleteBlogPost(postId);
}
