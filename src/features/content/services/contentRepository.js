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
    const snapshot = await getDocs(collection(db, 'promotions'));
    if (snapshot) {
      const remote = documents(snapshot);
      setRemoteCoupons(remote);
      return remote;
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

  const updated = await fetchVouchers().catch(() => []);
  const filtered = updated.filter(v => String(v.code).trim().toUpperCase() !== normalizedCode);
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

// -------------------------------------------------------------
// 5. CMS TRANG CHỦ THEO KHỐI & BANNER SLIDER (BLOCK CMS - GĐ4)
// -------------------------------------------------------------
export const DEFAULT_HOME_BLOCKS = {
  banners: [
    {
      id: 'banner_scan_ai',
      label: 'TIỆN ÍCH SOI DA AI',
      title: 'Hiểu làn da trước khi chọn sản phẩm',
      subtitle: 'Chụp ảnh khuôn mặt theo hướng dẫn để tham khảo tình trạng da và tìm nhanh nhóm sản phẩm phù hợp.',
      desktopImage: '/images/banners/hero-scan-ai.jpg',
      mobileImage: '/images/banners/hero-scan-ai.jpg',
      alt: 'Minh họa tính năng soi da AI SkinID',
      ctaText: 'Bắt đầu soi da',
      ctaLink: '/skin-analysis',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_rilastil',
      label: 'RILASTIL · DƯỢC MỸ PHẨM TỪ Ý',
      title: 'Dịu dàng với da. Yêu thương chính mình.',
      subtitle: 'Sản phẩm rõ nguồn gốc, thông tin đầy đủ và phân loại dễ tìm theo từng nhu cầu.',
      desktopImage: '/images/banners/Rilastil_banner.png',
      mobileImage: '/images/banners/Rilastil_banner.png',
      alt: 'Bộ sản phẩm Rilastil chính ngạch từ Ý',
      ctaText: 'Mua sắm ngay',
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_twon',
      label: 'TWON · BODY RITUAL',
      title: 'Chăm sóc cơ thể. Nâng niu mỗi ngày.',
      subtitle: 'Routine dưỡng thể mềm mịn và lưu hương nhẹ nhàng cho trải nghiệm chăm sóc trọn vẹn.',
      desktopImage: '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png',
      mobileImage: '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png',
      alt: 'Bộ sản phẩm dưỡng thể TWON',
      ctaText: 'Mua TWON ngay',
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    },
    {
      id: 'banner_dvah',
      label: "D'VAH · NƯỚC HOA TINH TẾ",
      title: 'Hương thơm kiêu kỳ. Dấu ấn khó phai.',
      subtitle: 'Bộ sưu tập nước hoa cao cấp lưu hương bền lâu và tôn vinh phong cách riêng biệt.',
      desktopImage: "/images/banners/Chai nước hoa D'VAH trên mặt nước trong suốt.png",
      mobileImage: "/images/banners/Chai nước hoa D'VAH trên mặt nước trong suốt.png",
      alt: "Nước hoa D'VAH cao cấp",
      ctaText: "Khám phá D'VAH",
      ctaLink: '/products',
      active: true,
      startAt: null,
      endAt: null
    }
  ],
  announcement: {
    text: 'Ưu đãi độc quyền SkinID: Freeship toàn quốc từ 500k · Phân tích da AI miễn phí',
    link: '/khuyen-mai',
    active: true
  },
  blockOrder: [
    'hero',
    'flash_sale',
    'featured_products',
    'help_section',
    'brand_showcase',
    'acie_teaser',
    'home_blog',
    'trust_benefits'
  ],
  blockVisibility: {
    hero: true,
    flash_sale: true,
    featured_products: true,
    help_section: true,
    brand_showcase: true,
    acie_teaser: true,
    home_blog: true,
    trust_benefits: true
  }
};

export async function fetchHomePageBlocks() {
  try {
    const { doc, getDoc } = sdk.firestore;
    const snap = await getDoc(doc(db, 'pages', 'home')).catch(() => ({ exists: () => false }));
    if (snap && typeof snap.exists === 'function' && snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_HOME_BLOCKS,
        ...data,
        banners: Array.isArray(data.banners) && data.banners.length > 0 ? data.banners : DEFAULT_HOME_BLOCKS.banners,
        blockOrder: Array.isArray(data.blockOrder) ? data.blockOrder : DEFAULT_HOME_BLOCKS.blockOrder,
        blockVisibility: { ...DEFAULT_HOME_BLOCKS.blockVisibility, ...(data.blockVisibility || {}) }
      };
    }
  } catch (err) {
    console.warn('[ContentRepository] Firestore fetch home blocks failed, using defaults:', err.message);
  }
  return { ...DEFAULT_HOME_BLOCKS };
}

export async function saveHomePageBlocks(blocksData) {
  const payload = {
    ...DEFAULT_HOME_BLOCKS,
    ...blocksData,
    updatedAtIso: new Date().toISOString()
  };

  const { doc, setDoc, serverTimestamp } = sdk.firestore;
  await setDoc(doc(db, 'pages', 'home'), {
    ...payload,
    updatedAtServer: serverTimestamp()
  }, { merge: true });

  // Tự động lưu 1 snapshot lịch sử phiên bản để hỗ trợ khôi phục (versioning rollback)
  try {
    const versionId = `v_${Date.now()}`;
    await setDoc(doc(db, 'pages', 'home', 'versions', versionId), {
      ...payload,
      versionId,
      savedAtServer: serverTimestamp()
    });
  } catch (vErr) {
    console.warn('[ContentRepository] Version history snapshot warning:', vErr.message);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:home-blocks-updated', { detail: { blocks: payload } }));
  }
  return payload;
}

export async function listHomePageVersions() {
  try {
    const { collection, getDocs } = sdk.firestore;
    const snap = await getDocs(collection(db, 'pages', 'home', 'versions')).catch(() => ({ empty: true }));
    if (!snap.empty) {
      return documents(snap).sort((a, b) => (b.updatedAtIso || '').localeCompare(a.updatedAtIso || '')).slice(0, 10);
    }
  } catch (err) {
    console.warn('[ContentRepository] listHomePageVersions warning:', err.message);
  }
  return [];
}

export async function restoreHomePageVersion(versionData) {
  if (!versionData) throw new Error('Dữ liệu phiên bản không hợp lệ.');
  return saveHomePageBlocks(versionData);
}

// -------------------------------------------------------------
// 6. KIỂM SOÁT TUÂN THỦ QUẢNG CÁO MỸ PHẨM (COSMETIC COMPLIANCE)
// -------------------------------------------------------------
export const RESTRICTED_COSMETIC_WORDS = [
  'điều trị',
  'trị dứt điểm',
  'chữa khỏi',
  'đặc trị',
  'tận gốc',
  'khỏi hoàn toàn',
  'thuốc',
  'chữa bệnh',
  'tiêu diệt tận gốc',
  'cam kết khỏi',
  'hết vĩnh viễn'
];

export function validateCosmeticCompliance(text) {
  const content = String(text || '').toLowerCase();
  const flagged = RESTRICTED_COSMETIC_WORDS.filter(w => content.includes(w));
  return {
    isCompliant: flagged.length === 0,
    flaggedWords: flagged,
    warningMessage: flagged.length > 0
      ? `Cảnh báo tuân thủ quy chế quảng cáo mỹ phẩm (Thông tư 06/2011/TT-BYT): Nội dung chứa các từ ngữ y khoa bị cấm: [${flagged.join(', ')}]. Vui lòng thay bằng các cụm từ chuẩn: "hỗ trợ cải thiện", "chăm sóc da", "giúp phục hồi" trước khi xuất bản.`
      : null
  };
}

// -------------------------------------------------------------
// 7. ARTICLE SCHEMA STRUCTURED DATA (JSON-LD SEO)
// -------------------------------------------------------------
export function generateArticleJsonLd(post, siteOrigin = 'https://skinid.vn') {
  if (!post) return null;
  const url = `${siteOrigin}/blog/${encodeURIComponent(post.id || '')}`;
  const image = post.image?.startsWith('http') ? post.image : `${siteOrigin}${post.image || '/og-image.jpg'}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    headline: post.title || 'Cẩm nang Skincare SkinID',
    description: post.excerpt || post.description || 'Hướng dẫn chăm sóc da khoa học từ SkinID.vn.',
    image: [image],
    datePublished: post.createdAtIso || new Date().toISOString(),
    dateModified: post.updatedAtIso || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || 'Chuyên gia Da liễu SkinID'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SkinID.vn',
      logo: {
        '@type': 'ImageObject',
        url: `${siteOrigin}/logo.png`
      }
    }
  };
}

// -------------------------------------------------------------
// 8. THƯ VIỆN ẢNH & MEDIA STORAGE
// -------------------------------------------------------------
export async function fetchMediaLibrary() {
  try {
    const { collection, getDocs } = sdk.firestore;
    const snap = await getDocs(collection(db, 'media')).catch(() => ({ empty: true }));
    if (!snap.empty) {
      return documents(snap).sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || ''));
    }
  } catch (err) {
    console.warn('[ContentRepository] fetchMediaLibrary warning:', err.message);
  }
  return [
    { id: 'm1', url: '/images/banners/hero-scan-ai.jpg', alt: 'Soi da AI', name: 'hero-scan-ai.jpg', size: 184500 },
    { id: 'm2', url: '/images/banners/Rilastil_banner.png', alt: 'Banner Rilastil', name: 'Rilastil_banner.png', size: 312000 },
    { id: 'm3', url: '/images/banners/Bộ mỹ phẩm TWON giữa sắc hoa anh đào.png', alt: 'Banner TWON Body', name: 'TWON_banner.png', size: 284000 }
  ];
}

export async function saveMediaItem(mediaItem) {
  if (!mediaItem || !mediaItem.url) throw new Error('Đường dẫn ảnh không được để trống.');
  const id = mediaItem.id || `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const payload = {
    ...mediaItem,
    id,
    alt: mediaItem.alt || mediaItem.name || 'Hình ảnh SkinID',
    createdAtIso: mediaItem.createdAtIso || new Date().toISOString()
  };

  const { doc, setDoc, serverTimestamp } = sdk.firestore;
  await setDoc(doc(db, 'media', id), {
    ...payload,
    updatedAtServer: serverTimestamp()
  }, { merge: true });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('skinid:media-updated', { detail: { item: payload } }));
  }
  return payload;
}

export async function deleteMediaItem(mediaId) {
  if (!mediaId) throw new Error('ID hình ảnh không hợp lệ.');
  const { doc, deleteDoc } = sdk.firestore;
  await deleteDoc(doc(db, 'media', mediaId));
  return mediaId;
}
