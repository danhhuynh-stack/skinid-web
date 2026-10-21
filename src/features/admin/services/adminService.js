import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { apiRequest } from '../../../infrastructure/http/apiClient.js';
import { syncOrderToS3 } from '../../cart/services/s3SyncService.js';

const { db, sdk } = firebaseServices;
const documents = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

const USER_OVERRIDES_KEY = 'skinid_admin_users_override';

function readUserOverrides() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeUserOverrides(overrides) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:users-updated', { detail: { overrides } }));
    }
  } catch (err) {
    console.warn('[Admin Users] LocalStorage write warning:', err.message);
  }
}

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
  let sharedOrders = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const rawShared = localStorage.getItem('skinid_orders_shared');
      if (rawShared) {
        const parsed = JSON.parse(rawShared);
        if (Array.isArray(parsed)) sharedOrders = parsed;
      }
    }
  } catch {}

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
    const orderMap = new Map();
    // 1. Nạp đơn hàng từ shared cache
    sharedOrders.forEach((o) => {
      if (o?.id) orderMap.set(o.id, o);
    });
    // 2. Nạp/ghi đè đơn hàng từ Firestore
    remoteOrders.forEach((o) => {
      if (o?.id) orderMap.set(o.id, { ...(orderMap.get(o.id) || {}), ...o });
    });

    const mergedOrders = Array.from(orderMap.values()).sort((left, right) => {
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

  if (order) {
    const s3Result = await syncOrderToS3({ orderId, order });
    if (s3Result.success) {
      await updateAdminOrder(orderId, {
        s3SyncStatus: 'synced',
        s3OrderId: s3Result.s3OrderId,
        s3SyncedAt: s3Result.syncedAt || new Date().toISOString()
      });
      return s3Result;
    }

    await updateAdminOrder(orderId, {
      s3SyncStatus: 'failed',
      s3SyncError: s3Result.error || 'Lỗi đồng bộ S3'
    });
    throw new Error(`Đồng bộ S3 thất bại: ${s3Result.error}`);
  }

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

export async function updateUserRole(userId, newRole, extraMeta = {}) {
  if (!userId) throw new Error('Mã người dùng không hợp lệ.');
  const validRoles = ['super_admin', 'admin', 'staff', 'customer'];
  if (!validRoles.includes(newRole)) throw new Error('Vai trò không hợp lệ.');

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

export async function assignAdminByEmail(email, role = 'admin', name = '') {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Vui lòng nhập địa chỉ email hợp lệ.');
  }
  const validRoles = ['super_admin', 'admin', 'staff', 'customer'];
  if (!validRoles.includes(role)) throw new Error('Vai trò không hợp lệ.');

  const slug = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const tempId = `member_${slug}`;
  const displayName = String(name || '').trim() || cleanEmail.split('@')[0];

  const overrides = readUserOverrides();
  // Check if any override already matches this email
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

      await setDoc(doc(db, 'users', userDoc.id), {
        role,
        ...(name ? { name: displayName } : {}),
        updatedAt: serverTimestamp()
      }, { merge: true });
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

const VOUCHERS_STORAGE_KEY = 'skinid_admin_vouchers';
const CAMPAIGN_STORAGE_KEY = 'skinid_admin_campaign';

export function readLocalVouchers() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(VOUCHERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalVouchers(vouchers) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(vouchers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:vouchers-updated', { detail: { vouchers } }));
    }
  } catch (err) {
    console.warn('[Admin Vouchers] LocalStorage write error:', err.message);
  }
}

export function readLocalCampaign() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalCampaign(campaign) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:campaign-updated', { detail: { campaign } }));
    }
  } catch (err) {
    console.warn('[Admin Campaign] LocalStorage write error:', err.message);
  }
}

export async function fetchAdminPromotions() {
  const localVouchers = readLocalVouchers();
  const localCampaign = readLocalCampaign();

  try {
    const { collection, getDocs, doc, getDoc } = sdk.firestore;
    const [voucherSnapshot, campaignDoc] = await Promise.all([
      getDocs(collection(db, 'promotions')).catch(() => ({ empty: true })),
      getDoc(doc(db, 'settings', 'campaign_config')).catch(() => ({ exists: () => false }))
    ]);
    const remoteVouchers = voucherSnapshot.empty ? null : documents(voucherSnapshot);
    const remoteCampaign = campaignDoc.exists() ? campaignDoc.data() : null;

    const mergedCampaign = remoteCampaign || localCampaign;
    let mergedVouchers = remoteVouchers;
    if (!mergedVouchers && localVouchers) {
      mergedVouchers = localVouchers;
    } else if (mergedVouchers && localVouchers) {
      const vMap = new Map();
      mergedVouchers.forEach(v => vMap.set(v.code, v));
      localVouchers.forEach(v => vMap.set(v.code, { ...(vMap.get(v.code) || {}), ...v }));
      mergedVouchers = Array.from(vMap.values());
    }

    if (mergedVouchers) writeLocalVouchers(mergedVouchers);
    if (mergedCampaign) writeLocalCampaign(mergedCampaign);

    return { vouchers: mergedVouchers, campaign: mergedCampaign };
  } catch (err) {
    console.warn('[Admin Promotions] Fetch failed, fallback:', err.message);
    return { vouchers: localVouchers, campaign: localCampaign };
  }
}

export async function saveAdminVoucher(id, voucherData) {
  const code = String(id || voucherData.code || '').trim().toUpperCase();
  if (!code) throw new Error('Mã voucher là bắt buộc.');

  const payload = {
    code,
    type: voucherData.type || 'percent',
    discountValue: Number(voucherData.discountValue) || 0,
    minOrderValue: Number(voucherData.minOrderValue) || 0,
    maxDiscount: Number(voucherData.maxDiscount) || 0,
    description: String(voucherData.description || '').trim(),
    active: voucherData.active !== false,
    updatedAtIso: new Date().toISOString()
  };

  // 1. Cập nhật LocalStorage
  const localList = readLocalVouchers() || [];
  const existingIdx = localList.findIndex(v => v.code === code);
  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...payload };
  } else {
    localList.push(payload);
  }
  writeLocalVouchers(localList);

  // 2. Cập nhật Firestore
  try {
    const { doc, serverTimestamp, setDoc } = sdk.firestore;
    await setDoc(doc(db, 'promotions', code), {
      ...payload,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Admin Voucher] Firestore write deferred:', err.message);
  }

  return code;
}

export async function deleteAdminVoucher(code) {
  if (!code) throw new Error('Mã voucher không hợp lệ.');

  // 1. Cập nhật LocalStorage
  const localList = readLocalVouchers() || [];
  const filtered = localList.filter(v => v.code !== code);
  writeLocalVouchers(filtered);

  // 2. Cập nhật Firestore
  try {
    const { doc, deleteDoc } = sdk.firestore;
    await deleteDoc(doc(db, 'promotions', code));
  } catch (err) {
    console.warn('[Admin Voucher] Firestore delete deferred:', err.message);
  }
}

export async function saveAdminCampaign(campaignData) {
  const payload = {
    title: String(campaignData.title || '').trim(),
    subtitle: String(campaignData.subtitle || '').trim(),
    active: Boolean(campaignData.active),
    endsAt: campaignData.endsAt || null,
    deals: campaignData.deals || [],
    updatedAtIso: new Date().toISOString()
  };

  // 1. Cập nhật LocalStorage & Dispatch event cho Storefront
  writeLocalCampaign(payload);

  // 2. Cập nhật Firestore
  try {
    const { doc, serverTimestamp, setDoc } = sdk.firestore;
    await setDoc(doc(db, 'settings', 'campaign_config'), {
      ...payload,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Admin Campaign] Firestore sync deferred:', err.message);
  }
}

const BLOG_STORAGE_KEY = 'skinid_admin_blog_posts';

function readLocalBlogPosts() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalBlogPosts(posts) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:blog-updated', { detail: { posts } }));
    }
  } catch (err) {
    console.warn('[Admin Blog] LocalStorage write warning:', err.message);
  }
}

export async function fetchAdminBlogPosts() {
  const localPosts = readLocalBlogPosts();
  try {
    const { collection, getDocs } = sdk.firestore;
    const snapshot = await getDocs(collection(db, 'blog_posts'));
    if (!snapshot.empty) {
      const remotePosts = documents(snapshot);
      if (localPosts && localPosts.length > 0) {
        const mergedMap = new Map();
        remotePosts.forEach((p) => mergedMap.set(p.id, p));
        localPosts.forEach((p) => mergedMap.set(p.id, { ...(mergedMap.get(p.id) || {}), ...p }));
        const merged = Array.from(mergedMap.values());
        writeLocalBlogPosts(merged);
        return merged;
      }
      writeLocalBlogPosts(remotePosts);
      return remotePosts;
    }
  } catch (err) {
    console.warn('[Admin Blog] Fetch failed, fallback:', err.message);
  }
  return localPosts;
}

export async function saveAdminBlogPost(postId, postData) {
  const slugify = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = postId || postData?.id || slugify(postData?.title) || `blog_${Date.now()}`;
  if (!id) throw new Error('Tiêu đề bài viết không hợp lệ.');

  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const normalizedContent = Array.isArray(postData.content)
    ? postData.content
        .map((sec) => ({
          heading: String(sec?.heading || '').trim(),
          text: String(sec?.text || '').trim(),
          image: String(sec?.image || '').trim(),
          imageCaption: String(sec?.imageCaption || '').trim()
        }))
        .filter((sec) => sec.heading || sec.text || sec.image)
    : [];

  const record = {
    id,
    title: String(postData.title || '').trim(),
    step: String(postData.step || 'treatment'),
    stepLabel: String(postData.stepLabel || 'Bước 02 · Tinh chất & Serum'),
    author: String(postData.author || 'SkinID Skincare Advisory Board').trim(),
    readTime: String(postData.readTime || '5 phút đọc').trim(),
    date: postData.date || todayStr,
    updatedAt: todayStr,
    status: postData.status || 'published',
    image: String(postData.image || '/images/products/rilastil/rilastil-serum-cap-cam-aqua-intense-gel-serum.png').trim(),
    excerpt: String(postData.excerpt || '').trim(),
    content: normalizedContent,
    relatedProductIds: Array.isArray(postData.relatedProductIds) ? postData.relatedProductIds : [],
    seoTitle: String(postData.seoTitle || postData.title || '').trim(),
    seoDescription: String(postData.seoDescription || postData.excerpt || '').trim(),
    active: (postData.status || 'published') === 'published'
  };

  // Lưu ngay vào LocalStorage để phản hồi tức thì
  const existing = readLocalBlogPosts() || [];
  const existsIdx = existing.findIndex((p) => p.id === id);
  const nextLocal = existsIdx >= 0
    ? existing.map((p, i) => (i === existsIdx ? { ...p, ...record } : p))
    : [record, ...existing];
  writeLocalBlogPosts(nextLocal);

  try {
    const { doc, serverTimestamp, setDoc } = sdk.firestore;
    await setDoc(doc(db, 'blog_posts', id), {
      ...record,
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Admin Blog] Firestore save fallback to local:', err.message);
  }

  return record;
}

export async function deleteAdminBlogPost(postId) {
  if (!postId) throw new Error('Mã bài viết không hợp lệ.');
  const existing = readLocalBlogPosts();
  if (existing) {
    writeLocalBlogPosts(existing.filter((p) => p.id !== postId));
  }
  try {
    const { doc, deleteDoc } = sdk.firestore;
    await deleteDoc(doc(db, 'blog_posts', postId));
  } catch (err) {
    console.warn('[Admin Blog] Firestore delete fallback to local:', err.message);
  }
}



const SYSTEM_SETTINGS_KEY = 'skinid_system_settings';

export async function fetchSystemSettings() {
  let localSettings = null;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SYSTEM_SETTINGS_KEY);
      if (raw) localSettings = JSON.parse(raw);
    }
  } catch {}

  try {
    const { doc, getDoc } = sdk.firestore;
    const snap = await getDoc(doc(db, 'settings', 'store_config'));
    if (snap.exists()) {
      const remote = snap.data();
      const merged = { ...(localSettings || {}), ...remote };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn('[Admin Settings] Firestore read fallback to local:', err.message);
  }

  return localSettings;
}

export async function saveSystemSettings(settings) {
  if (!settings || typeof settings !== 'object') throw new Error('Dữ liệu cài đặt không hợp lệ.');

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skinid:settings-updated', { detail: { settings } }));
      }
    }
  } catch (e) {
    console.warn('[Admin Settings] Local write error:', e.message);
  }

  try {
    const { doc, serverTimestamp, setDoc } = sdk.firestore;
    await setDoc(doc(db, 'settings', 'store_config'), {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[Admin Settings] Firestore save fallback to local:', err.message);
  }

  return settings;
}
