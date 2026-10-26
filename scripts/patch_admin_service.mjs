import fs from 'fs';

const filePath = 'D:/skinid-web-extracted/src/features/admin/services/adminService.js';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Cập nhật saveAdminProduct
const oldSaveRegex = /export async function saveAdminProduct\(existingId, values\) \{[\s\S]*?return id;\s*\}/;
const newSaveProduct = `export async function saveAdminProduct(existingId, values) {
  const slugify = (value) => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
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
}`;

if (oldSaveRegex.test(code)) {
  code = code.replace(oldSaveRegex, newSaveProduct);
} else {
  console.warn('⚠️ Warning: oldSaveRegex did not match in adminService.js');
}

// 2. Cập nhật deleteAdminProduct
const oldDeleteRegex = /export function deleteAdminProduct\(productId\) \{[\s\S]*?\}/;
const newDeleteProduct = `export async function deleteAdminProduct(productId) {
  await sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'products', productId));
  try {
    const { refreshProductCatalog } = await import('../../catalog/services/catalogRepository.js');
    await refreshProductCatalog(true);
  } catch {}
}`;

if (oldDeleteRegex.test(code)) {
  code = code.replace(oldDeleteRegex, newDeleteProduct);
}

// 3. Bổ sung System Settings nếu chưa có
if (!code.includes('SYSTEM_SETTINGS_STORAGE_KEY')) {
  code += `\n
const SYSTEM_SETTINGS_STORAGE_KEY = 'skinid_system_settings';

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
  // Cấu hình SEO & Tracking toàn trang
  ga4Id: '',
  gtmId: '',
  metaPixelId: '',
  gscVerification: ''
};

export function readLocalSystemSettings() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SYSTEM_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalSystemSettings(settings) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SYSTEM_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:system-settings-updated', { detail: { settings } }));
    }
  } catch (err) {
    console.warn('[System Settings] LocalStorage write error:', err.message);
  }
}

export async function fetchSystemSettings() {
  const local = readLocalSystemSettings();
  try {
    const { doc, getDoc } = sdk.firestore;
    const docSnap = await getDoc(doc(db, 'settings', 'system_config')).catch(() => ({ exists: () => false }));
    if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
      const remote = docSnap.data();
      const merged = { ...DEFAULT_SYSTEM_SETTINGS, ...(local || {}), ...remote };
      writeLocalSystemSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[System Settings] Firestore fetch failed, fallback local:', err.message);
  }
  return { ...DEFAULT_SYSTEM_SETTINGS, ...(local || {}) };
}

export async function saveSystemSettings(settings) {
  const merged = { ...DEFAULT_SYSTEM_SETTINGS, ...settings, updatedAtIso: new Date().toISOString() };
  writeLocalSystemSettings(merged);
  try {
    const { doc, setDoc, serverTimestamp } = sdk.firestore;
    await setDoc(doc(db, 'settings', 'system_config'), {
      ...merged,
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[System Settings] Firestore save deferred:', err.message);
  }
  return merged;
}
`;
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ Updated adminService.js successfully!');
