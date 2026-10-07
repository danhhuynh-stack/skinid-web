(function () {
  const storefrontScripts = [
    'src/js/app/scroll-lock.js',
    'src/js/catalog/catalog-loader.js',
    'src/js/catalog/product-card.js',
    'src/js/catalog/product-filters.js',
    'src/js/analysis/skin-analysis.js',
    'src/js/analysis/camera.js',
    'src/js/catalog/storefront.js'
  ];
  const applicationScripts = storefrontScripts;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const base = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/$/, '');
      const cleanPath = src.replace(/^\//, '');
      const normalizedSrc = `${base}/${cleanPath}`;
      script.src = `${normalizedSrc}?v=20261005-1`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Không thể tải ${normalizedSrc}`));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    for (const src of applicationScripts) {
      await loadScript(src);
      if (src.endsWith('/catalog-loader.js') || src.endsWith('catalog-loader.js')) await window.SKINID_CATALOG_READY;
    }
    document.documentElement.classList.add('components-ready');
    document.dispatchEvent(new CustomEvent('skinid:ready'));
  }

  boot().catch((error) => console.error('[SkinID boot]', error));
})();
