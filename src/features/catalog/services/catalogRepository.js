import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { setAvailableProducts } from './catalogService.js';

let catalogRequest;
let refreshRequest;

function applyStorefrontPrice(product) {
  return {
    ...product,
    price: Number(product.price) || 0
  };
}

export function loadProductCatalog() {
  if (catalogRequest) return catalogRequest;
  catalogRequest = (async () => {
    const { CATALOG_FIXTURE } = await import('../data/catalogFixture.generated.js');
    return setAvailableProducts(CATALOG_FIXTURE.map(applyStorefrontPrice));
  })().catch((error) => {
    catalogRequest = undefined;
    throw error;
  });
  return catalogRequest;
}

// Remote-only fields enrich the catalog without delaying its first render.
// When remote data arrives, Admin edits in Firestore override static build fixtures.
export function refreshProductCatalog(force = false) {
  if (refreshRequest && !force) return refreshRequest;
  refreshRequest = (async () => {
    const fallback = await loadProductCatalog();
    try {
      const { collection, getDocs } = firebaseServices.sdk.firestore;
      const snapshot = await getDocs(collection(firebaseServices.db, 'products'));
      if (snapshot.empty) throw new Error('Collection products đang trống.');
      const remote = new Map(snapshot.docs.map((snapshotDocument) => [snapshotDocument.id, snapshotDocument.data()]));
      
      // 1. Merge remote overrides len tren local fallback (giu vung bang gia niem yet goc)
      const mergedLocals = fallback.map((local) => {
        const remoteData = remote.get(local.id);
        if (!remoteData) return local;
        return applyStorefrontPrice({
          ...remoteData,
          ...local,
          id: local.id
        });
      });

      // 2. Bổ sung các sản phẩm mới được tạo từ Admin mà file tĩnh chưa có
      const localIdSet = new Set(fallback.map((p) => p.id));
      const brandNewProducts = [];
      for (const [id, remoteData] of remote.entries()) {
        if (!localIdSet.has(id) && remoteData?.name && remoteData?.price) {
          brandNewProducts.push(applyStorefrontPrice({
            id,
            brand: remoteData.brand || 'Khác',
            brandSlug: remoteData.brandSlug || 'khac',
            name: remoteData.name,
            price: Number(remoteData.price) || 0,
            originalPrice: Number(remoteData.originalPrice) || 0,
            volume: remoteData.volume || '',
            stepType: remoteData.stepType || 'special',
            category: remoteData.category || remoteData.stepType || 'special',
            line: remoteData.line || '',
            image: remoteData.image || '/images/products/placeholder.png',
            uses: remoteData.uses || '',
            tier: remoteData.tier || 'Essential',
            mainActives: Array.isArray(remoteData.mainActives) ? remoteData.mainActives : [],
            keyActives: Array.isArray(remoteData.keyActives) ? remoteData.keyActives : [],
            skinTypes: Array.isArray(remoteData.skinTypes) ? remoteData.skinTypes : ['all'],
            targetConcerns: Array.isArray(remoteData.targetConcerns) ? remoteData.targetConcerns : [],
            ...remoteData
          }));
        }
      }

      const products = [...mergedLocals, ...brandNewProducts];
      const catalog = setAvailableProducts(products);
      catalogRequest = Promise.resolve(catalog);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skinid:catalog-updated', { detail: { count: catalog.length } }));
      }

      return catalog;
    } catch (error) {
      console.warn('[SkinID Catalog] Dùng catalog đóng gói:', error.message);
      return setAvailableProducts(fallback);
    }
  })();
  return refreshRequest;
}
