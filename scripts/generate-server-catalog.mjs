import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'src/data/products.js'), 'utf8');
const context = { window: {} };
context.window.window = context.window;
context.window.SKINID_ASSET_URL = value => value;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'src/data/products.js' });

const catalogFixture = context.window.LOCAL_PRODUCTS || [];
const products = catalogFixture.map(product => ({
  id: String(product.id || ''),
  brand: String(product.brand || ''),
  brandSlug: String(product.brandSlug || ''),
  name: String(product.name || ''),
  image: String(product.image || ''),
  volume: String(product.volume || ''),
  price: Number(product.price)
}));

if (!products.length || products.some(product => !product.id || !product.name || !Number.isFinite(product.price))) {
  throw new Error('Không thể tạo catalog máy chủ: dữ liệu sản phẩm không hợp lệ.');
}

const serverOutput = resolve(root, 'worker/catalog.generated.js');
const clientOutput = resolve(root, 'src/features/catalog/data/catalogSummary.generated.js');
const fixtureOutput = resolve(root, 'src/features/catalog/data/catalogFixture.generated.js');
await Promise.all([
  mkdir(dirname(serverOutput), { recursive: true }),
  mkdir(dirname(clientOutput), { recursive: true }),
  mkdir(dirname(fixtureOutput), { recursive: true })
]);
await Promise.all([
  writeFile(serverOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const SERVER_CATALOG = ${JSON.stringify(products, null, 2)};\n`),
  writeFile(clientOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const CATALOG_SUMMARY = ${JSON.stringify(products, null, 2)};\n`),
  writeFile(fixtureOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const CATALOG_FIXTURE = ${JSON.stringify(catalogFixture, null, 2)};\n`)
]);
console.log(`Generated server summary and lazy client catalog with ${products.length} products.`);
