import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { setAvailableProducts } from './catalogService.js';

let catalogRequest;

function applyStorefrontPrice(product) {
  const originalPrice = Number(product.originalPrice);
  return {
    ...product,
    price: Number.isFinite(originalPrice) && originalPrice > 0
      ? Math.round(originalPrice * 0.95)
      : Number(product.price) || 0
  };
}

export function loadProductCatalog() {
  if (catalogRequest) return catalogRequest;
  catalogRequest = (async () => {
    const { CATALOG_FIXTURE } = await import('../data/catalogFixture.generated.js');
    const fallback = CATALOG_FIXTURE.map(applyStorefrontPrice);
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
      return setAvailableProducts(products);
    } catch (error) {
      console.warn('[SkinID Catalog] Dùng catalog đóng gói:', error.message);
      return setAvailableProducts(fallback);
    }
  })();
  return catalogRequest;
}
