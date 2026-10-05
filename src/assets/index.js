export function assetUrl(path, brandSlug) {
  if (!path) return '';
  if (path.startsWith('http:') || path.startsWith('https:') || path.startsWith('data:')) {
    return path;
  }

  let normalized = path;

  // Resolve product images that are specified without brand subfolder (e.g. /images/products/filename.ext)
  if (normalized.startsWith('/images/products/') && 
      !normalized.includes('/products/dvah/') && 
      !normalized.includes('/products/rilastil/') && 
      !normalized.includes('/products/twon/')) {
    const filename = normalized.slice('/images/products/'.length);
    const slug = brandSlug || (
      filename.startsWith('dvah-') ? 'dvah' :
      filename.startsWith('twon-') ? 'twon' :
      filename.startsWith('rilastil-') ? 'rilastil' : ''
    );
    if (slug) {
      normalized = `/images/products/${slug}/${filename}`;
    }
  }

  return import.meta.env.DEV ? `/src/assets${normalized}` : normalized;
}

window.SKINID_ASSET_URL = assetUrl;

