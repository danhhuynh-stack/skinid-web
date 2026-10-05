/* Loads the public product catalog from Firestore, with the bundled catalog as an offline fallback. */
(function loadCatalog() {
    const fallback = Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : [];
    // Enforce 5% discount on fallback products if originalPrice exists
    fallback.forEach(p => {
        if (p.originalPrice) {
            p.price = Math.round(p.originalPrice * 0.95);
        }
    });
    window.PRODUCTS = fallback;

    window.SKINID_CATALOG_READY = (async () => {
        try {
            const firebase = await window.SKINID_FIREBASE_READY;
            const snapshot = await firebase.sdk.firestore.getDocs(
                firebase.sdk.firestore.collection(firebase.db, 'products')
            );
            const fallbackMap = new Map(fallback.map(p => [p.id, p]));
            const products = snapshot.docs.map(document => {
                const data = document.data();
                const local = fallbackMap.get(document.id) || {};
                const orig = local.originalPrice ?? data.originalPrice;
                const price = orig ? Math.round(orig * 0.95) : (local.price ?? data.price);
                return {
                    ...data,
                    ...local,
                    id: document.id,
                    price,
                    originalPrice: orig
                };
            });
            if (!products.length) throw new Error('Collection products đang trống.');
            window.PRODUCTS = products;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'firestore', count: products.length } }));
            return products;
        } catch (error) {
            console.warn('[SkinID catalog] Dùng dữ liệu local dự phòng:', error.message);
            window.PRODUCTS = fallback;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'local', count: fallback.length } }));
            return fallback;
        }
    })();
})();
