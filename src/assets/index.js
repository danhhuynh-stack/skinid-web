export function assetUrl(path, brandSlug) {
  if (!path) return '';
  if (path.startsWith('http:') || path.startsWith('https:') || path.startsWith('data:')) {
    return path;
  }

  let normalized = path;

  // Resolve product images that are specified without brand subfolder (e.g. /images/products/filename.ext)
  // Tuyệt đối KHÔNG can thiệp nếu đường dẫn đã có subfolder như combos, brands, v.v.
  if (normalized.startsWith('/images/products/') && 
      !normalized.startsWith('/images/products/combos/') &&
      !normalized.includes('/products/dvah/') && 
      !normalized.includes('/products/rilastil/') && 
      !normalized.includes('/products/twon/')) {
    const filename = normalized.slice('/images/products/'.length);
    if (!filename.includes('/')) {
      const slug = brandSlug || (
        filename.startsWith('dvah-') ? 'dvah' :
        filename.startsWith('twon-') ? 'twon' :
        filename.startsWith('rilastil-') ? 'rilastil' : ''
      );
      if (slug) {
        normalized = `/images/products/${slug}/${filename}`;
      }
    }
  }

  return import.meta.env.DEV ? `/src/assets${normalized}` : normalized;
}

window.SKINID_ASSET_URL = assetUrl;

