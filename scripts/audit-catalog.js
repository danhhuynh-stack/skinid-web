// Read-only audit against a pinned upstream revision; never executes upstream JS.
const fs = require('node:fs');
const path = require('node:path');
const { getProductCategories } = require('../src/js/catalog/product-filters');
const revision = '8fa91f4878ac8bf73d39063ea03955527e28d29f';
const root = path.join(__dirname, '..');
const parse = source => {
    const match = source.match(/(?:const PRODUCTS|window\.LOCAL_PRODUCTS) = (\[[\s\S]*?\]);/);
    if (!match) throw new Error('Không tìm thấy mảng dữ liệu sản phẩm trong nguồn catalog.');
    return JSON.parse(match[1]);
};
async function audit() {
    const local = parse(fs.readFileSync(path.join(root, 'src/data/products.js'), 'utf8'));
    const response = await fetch('https://raw.githubusercontent.com/danhhuynh-stack/skinid-web/' + revision + '/js/skin-ai.js');
    if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
    const remote = parse(await response.text());
    const changedFields = local.flatMap(p => {
        const upstream = remote.find(r => r.id === p.id);
        return upstream ? Object.keys(upstream).filter(k => JSON.stringify(p[k]) !== JSON.stringify(upstream[k]))
            .map(field => ({ id: p.id, field })) : [];
    });
    const missingFields = local.flatMap(p => ['name', 'brand', 'brandSlug', 'price', 'image', 'volume', 'fullIngredients', 'keyActives', 'usage']
        .filter(k => p[k] == null || p[k] === '' || Array.isArray(p[k]) && !p[k].length).map(field => ({ id: p.id, field })));
    const missingImages = local.filter(p => {
        if (/^https?:|^data:/.test(p.image)) return false;
        const name = path.basename(p.image);
        return !fs.existsSync(path.join(root, 'src/assets/images/products', p.brandSlug, name));
    }).map(p => p.id);
    console.log(JSON.stringify({
        revision, localCount: local.length, upstreamCount: remote.length,
        missingIds: remote.filter(r => !local.some(p => p.id === r.id)).map(r => r.id),
        extraIds: local.filter(p => !remote.some(r => r.id === p.id)).map(p => p.id),
        changedFields, missingFields, missingImages,
        invalidPrices: local.filter(p => !Number.isFinite(p.price) || p.price <= 0 || p.originalPrice && p.originalPrice < p.price).map(p => p.id),
        duplicateIds: local.filter((p, i) => local.findIndex(x => x.id === p.id) !== i).map(p => p.id),
        brandMismatch: local.filter(p => p.brand.toLowerCase().replace(/[^a-z0-9]/g, '') !== p.brandSlug).map(p => p.id),
        volumeConflicts: local.filter(p => {
            const size = p.name.match(/(\d+)\s*ml\b/i);
            return size && size[1] !== p.volume.match(/\d+/)?.[0];
        }).map(p => ({ id: p.id, name: p.name, volume: p.volume })),
        categories: Object.fromEntries(['cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen', 'special']
            .map(step => [step, local.filter(p => getProductCategories(p).includes(step)).length]))
    }, null, 2));
}
audit().catch(error => { console.error(error.message); process.exitCode = 1; });
