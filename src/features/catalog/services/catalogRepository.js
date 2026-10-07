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
// Published local prices remain authoritative, matching Worker checkout.
export function refreshProductCatalog() {
  if (refreshRequest) return refreshRequest;
  refreshRequest = (async () => {
    const fallback = await loadProductCatalog();
    try {
      const { collection, getDocs } = firebaseServices.sdk.firestore;
      const snapshot = await getDocs(collection(firebaseServices.db, 'products'));
      if (snapshot.empty) throw new Error('Collection products đang trống.');
      const remote = new Map(snapshot.docs.map((snapshotDocument) => [snapshotDocument.id, snapshotDocument.data()]));
      const products = fallback.map((local) => {
        const remoteData = remote.get(local.id);
        if (!remoteData) return local;
        return applyStorefrontPrice({
          ...remoteData,
          ...local,
          id: local.id
        });
      });
      const catalog = setAvailableProducts(products);
      catalogRequest = Promise.resolve(catalog);
      return catalog;
    } catch (error) {
      console.warn('[SkinID Catalog] Dùng catalog đóng gói:', error.message);
      return setAvailableProducts(fallback);
    }
  })();
  return refreshRequest;
}
