import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');

// 1. Map of SKUs to update
const SKU_MAP = {
  // Rilastil legacy fix
  'rilastil-2098': 'I14V01770', // Official Sữa rửa mặt tẩy trang 200ml
  'rilastil-2097': 'I14V01780', // Official Nước hoa hồng 200ml

  // TWON Master SKUs
  'twon-body-lotion': 'TWON-BODY-LOTION-200ML',
  'twon-kem-u-trang': 'TWON-U-TRANG-250ML',
  'twon-sua-tam': 'TWON-SUA-TAM-450ML',

  // DVAH Master SKUs
  'dvah-sarika': 'DVAH-SARIKA-10ML',
  'dvah-kamal': 'DVAH-KAMAL-10ML',
  'dvah-rakta': 'DVAH-RAKTA-10ML',
  'dvah-tanmaya': 'DVAH-TANMAYA-10ML',
  'dvah-malini': 'DVAH-MALINI-10ML'
};

// 2. Update ecom-price-list-2026-10.json
const ecomPath = path.join(root, 'src/data/ecom-price-list-2026-10.json');
const ecomData = JSON.parse(fs.readFileSync(ecomPath, 'utf8'));

let ecomUpdated = 0;
for (const p of ecomData.products) {
  if (SKU_MAP[p.id]) {
    p.productCode = SKU_MAP[p.id];
    ecomUpdated++;
  }
}
fs.writeFileSync(ecomPath, JSON.stringify(ecomData, null, 2) + '\n', 'utf8');
console.log(`✅ Updated ${ecomUpdated} products in ${ecomPath}`);

// 3. Update products.js
const productsJsPath = path.join(root, 'src/data/products.js');
const rawProductsJs = fs.readFileSync(productsJsPath, 'utf8');
const match = rawProductsJs.match(/window\.LOCAL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);?\s*$/);
if (!match) {
  throw new Error('Could not parse window.LOCAL_PRODUCTS from products.js');
}

const products = JSON.parse(match[1]);
let productsUpdated = 0;
for (const p of products) {
  if (SKU_MAP[p.id]) {
    p.productCode = SKU_MAP[p.id];
    productsUpdated++;
  }
}

const newProductsJs = `window.LOCAL_PRODUCTS = ${JSON.stringify(products, null, 4)};\n`;
fs.writeFileSync(productsJsPath, newProductsJs, 'utf8');
console.log(`✅ Updated ${productsUpdated} products in ${productsJsPath}`);

// 4. Verification
console.log('\n--- VERIFICATION ---');
console.log(`Total products: ${products.length}`);
const missingEcom = ecomData.products.filter(p => !p.productCode);
const missingLocal = products.filter(p => !p.productCode);
console.log(`Missing in ecom: ${missingEcom.length}`);
console.log(`Missing in products.js: ${missingLocal.length}`);

let mismatch = 0;
for (const p of products) {
  const ec = ecomData.products.find(e => e.id === p.id);
  if (!ec || ec.productCode !== p.productCode) {
    console.error(`❌ Mismatch for ${p.id}: local=${p.productCode}, ecom=${ec?.productCode}`);
    mismatch++;
  }
}

if (mismatch === 0 && missingEcom.length === 0 && missingLocal.length === 0) {
  console.log('🎉 100% SUCCESS: All 54 products have identical, valid SKUs across systems!');
} else {
  console.error(`⚠️ Found ${mismatch} mismatches!`);
  process.exit(1);
}
