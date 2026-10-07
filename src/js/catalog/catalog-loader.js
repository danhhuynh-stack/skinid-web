/* Publishes the shared module catalog to legacy consumers; no duplicate network read. */
(function loadCatalog() {
    const fallback = Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : [];
    window.PRODUCTS = fallback;

    window.SKINID_CATALOG_READY = (async () => {
        try {
            const products = await window.SKINID_CATALOG_READY || fallback;
            window.PRODUCTS = products;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'bundled', count: products.length } }));
            return products;
        } catch (error) {
            console.warn('[SkinID catalog] Dùng dữ liệu local dự phòng:', error.message);
            window.PRODUCTS = fallback;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'local', count: fallback.length } }));
            return fallback;
        }
    })();
})();
