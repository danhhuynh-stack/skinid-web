import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { DEFAULT_BLOG_ARTICLES } from '../../../data/blogArticles.js';
import { CURATED_COMBOS, RETAIL_50_DEALS } from '../../../data/promotions.js';
import { AVAILABLE_COUPONS, setRemoteCoupons } from '../../cart/services/couponService.js';

const { db, sdk } = firebaseServices;

function documents(snapshot) {
  if (!snapshot || typeof snapshot.forEach !== 'function') return [];
  const items = [];
  snapshot.forEach((item) => {
    items.push({ id: item.id, ...item.data() });
  });
  return items;
}

// -------------------------------------------------------------
// 1. CẤU HÌNH HỆ THỐNG (SYSTEM SETTINGS)
// -------------------------------------------------------------
export const DEFAULT_SYSTEM_SETTINGS = {
  brandName: 'SkinID.vn',
  slogan: 'Healthier Skin, Happier You',
  hotline: '0924 093 461',
  supportEmail: 'operation@fieldman.vn',
  showroomAddress: '35 đường số 3, Phường Tân Mỹ, TP. Hồ Chí Minh',
  freeshipThreshold: 500000,
  shippingFee: 30000,
  allowInspection: true,
  s3ApiEndpoint: 'https://m.es3.vn',
  s3BranchId: '9099',
  s3CashierId: '16614',
  s3AutoSync: true,
  soundAlertOrders: true,
  emailAlertUnpaid: true,
  ga4Id: '',
  gtmId: '',
  metaPixelId: '',
  gscVerification: ''
};

export async function fetchSystemSettings() {
  try {
    const { doc, getDoc } = sdk.firestore;
    const docSnap = await getDoc(doc(db, 'settings', 'system_config')).catch(() => ({ exists: () => false }));
    if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
      return { ...DEFAULT_SYSTEM_SETTINGS, ...docSnap.data() };
    }
  } catch (err) {
    console.warn('[ContentRepository] Firestore fetch system settings failed, using defaults:', err.message);
  }
  return { ...DEFAULT_SYSTEM_SETTINGS };
}

export async function saveSystemSettings(settings) {
  const payload = {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...settings,
    updatedAtIso: new Date().toISOString()
  };

  // N2: Tuyệt đối không nuốt lỗi, lỗi phải ném ra để giao diện hiển thị cảnh báo đỏ
  const { doc, setDoc, serverTimestamp } = sdk.firestore;
  await setDoc(doc(db, 'settings', 'system_config'), {
    ...payload,
    updatedAtServer: serverTimestamp()
  }, { merge: true });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:system-settings-updated', { detail: { settings: payload } }));
  }
  return payload;
}

// -------------------------------------------------------------
// 2. MÃ KHUYẾN MÃI & VOUCHERS (PROMOTIONS)
// -------------------------------------------------------------
function getDefaultVouchersList() {
  return Object.values(AVAILABLE_COUPONS).map(c => ({
    code: c.code,
    description: c.description,
    type: c.type,
    discountValue: c.value,
    minOrderValue: c.minOrder,
    maxDiscount: c.maxDiscount || 0,
    active: true
  }));
}

export async function fetchVouchers() {
  try {
    const { collection, getDocs } = sdk.firestore;
    const snapshot = await getDocs(collection(db, 'promotions')).catch(() => ({ empty: true }));
    if (!snapshot.empty) {
      const remote = documents(snapshot);
      if (remote.length > 0) {
        setRemoteCoupons(remote);
        return remote;
      }
    }
  } catch (err) {
    console.warn('[ContentRepository] Firestore fetch vouchers failed, using default list:', err.message);
  }

  const defaults = getDefaultVouchersList();
  setRemoteCoupons(defaults);
  return defaults;
}

export async function saveVoucher(voucherData) {
  if (!voucherData || !voucherData.code) {
    throw new Error('Mã khuyến mãi không được để trống.');
  }
  const code = String(voucherData.code).trim().toUpperCase();
  const payload = {
    ...voucherData,
    code,
    active: voucherData.active !== false,
    updatedAtIso: new Date().toISOString()
  };

  // N2: Thao tác trực tiếp vào Firestore, ném lỗi nếu thất bại
  const { doc, serverTimestamp, setDoc } = sdk.firestore;
  await setDoc(doc(db, 'promotions', code), {
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Cập nhật in-memory cho giỏ hàng
  const current = await fetchVouchers().catch(() => []);
  const idx = current.findIndex(v => v.code === code);
  const updatedList = idx >= 0 ? current.map(v => v.code === code ? payload : v) : [...current, payload];
  setRemoteCoupons(updatedList);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:vouchers-updated', { detail: { vouchers: updatedList } }));
  }
  return code;
}

export async function deleteVoucher(code) {
  if (!code) throw new Error('Mã voucher không hợp lệ.');
  const normalizedCode = String(code).trim().toUpperCase();

  // N2: Xóa thực tế trên Firestore, ném lỗi nếu thất bại
  const { doc, deleteDoc } = sdk.firestore;
  await deleteDoc(doc(db, 'promotions', normalizedCode));

  const current = await fetchVouchers().catch(() => []);
  const filtered = current.filter(v => String(v.code).trim().toUpperCase() !== normalizedCode);
  setRemoteCoupons(filtered);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:vouchers-updated', { detail: { vouchers: filtered } }));
  }
  return normalizedCode;
}

// -------------------------------------------------------------
// 3. CHIẾN DỊCH KHUYẾN MẠI (CAMPAIGNS: 3 COMBO & FLASH SALE 50%)
// -------------------------------------------------------------
export const DEFAULT_CAMPAIGN = {
  title: "Đại Tiệc Dưỡng Trắng & Hương Thơm — TWON x D'VAH",
  subtitle: 'Ưu Đãi Độc Quyền Đến 50% & Quà Tặng Nàng Thơ',
  badge: 'SIÊU SALE ĐẶC BIỆT',
  combos: CURATED_COMBOS,
  flashSale: RETAIL_50_DEALS,
  active: true
};

export async function fetchCampaign() {
  try {
    const { doc, getDoc } = sdk.firestore;
    const docSnap = await getDoc(doc(db, 'settings', 'campaign_config')).catch(() => ({ exists: () => false }));
    if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
      return { ...DEFAULT_CAMPAIGN, ...docSnap.data() };
    }
  } catch (err) {
    console.warn('[ContentRepository] Firestore fetch campaign failed, using defaults:', err.message);
  }
  return { ...DEFAULT_CAMPAIGN };
}

export async function saveCampaign(campaignData) {
  const payload = {
    ...DEFAULT_CAMPAIGN,
    ...campaignData,
    updatedAtIso: new Date().toISOString()
  };

  const { doc, setDoc, serverTimestamp } = sdk.firestore;
  await setDoc(doc(db, 'settings', 'campaign_config'), {
    ...payload,
    updatedAtServer: serverTimestamp()
  }, { merge: true });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:campaign-updated', { detail: { campaign: payload } }));
  }
  return payload;
}

// -------------------------------------------------------------
// 4. BÀI VIẾT BLOG & CẨM NANG (POSTS)
// -------------------------------------------------------------
export async function fetchBlogPosts() {
  try {
    const { collection, getDocs } = sdk.firestore;
    const snapshot = await getDocs(collection(db, 'posts')).catch(() => ({ empty: true }));
    if (!snapshot.empty) {
      const remote = documents(snapshot);
      if (remote.length > 0) return remote;
    }
    // Fallback thử collection blog_posts cũ nếu posts chưa migrate
    const legacySnap = await getDocs(collection(db, 'blog_posts')).catch(() => ({ empty: true }));
    if (!legacySnap.empty) {
      const legacyRemote = documents(legacySnap);
      if (legacyRemote.length > 0) return legacyRemote;
    }
  } catch (err) {
    console.warn('[ContentRepository] Firestore fetch blog posts failed, using defaults:', err.message);
  }
  return [...DEFAULT_BLOG_ARTICLES];
}

export async function saveBlogPost(postData) {
  if (!postData || !postData.title) throw new Error('Tiêu đề bài viết không được để trống.');
  const id = postData.id || String(postData.title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const payload = {
    ...postData,
    id,
    updatedAt: new Date().toLocaleDateString('vi-VN'),
    updatedAtIso: new Date().toISOString()
  };

  const { doc, setDoc, serverTimestamp } = sdk.firestore;
  // Ghi đồng bộ vào cả posts và blog_posts để tương thích ngược
  await Promise.all([
    setDoc(doc(db, 'posts', id), { ...payload, updatedAtServer: serverTimestamp() }, { merge: true }),
    setDoc(doc(db, 'blog_posts', id), { ...payload, updatedAtServer: serverTimestamp() }, { merge: true })
  ]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:blog-posts-updated', { detail: { post: payload } }));
  }
  return payload;
}

export async function deleteBlogPost(postId) {
  if (!postId) throw new Error('ID bài viết không hợp lệ.');
  const { doc, deleteDoc } = sdk.firestore;
  await Promise.all([
    deleteDoc(doc(db, 'posts', postId)),
    deleteDoc(doc(db, 'blog_posts', postId))
  ]);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:blog-posts-updated', { detail: { deletedId: postId } }));
  }
  return postId;
}
