import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const projectRoot = resolve(import.meta.dirname, '..');
const projectId = 'skinid-df273';
const commit = process.argv.includes('--commit');

async function readDotEnv() {
  const values = {};
  try {
    const contents = await readFile(resolve(projectRoot, '.env'), 'utf8');
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator < 1) continue;
      values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return values;
}

export async function loadProducts() {
  const source = await readFile(resolve(projectRoot, 'src/data/products.js'), 'utf8');
  const context = {};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(`${source}; globalThis.__PRODUCTS__ = window.LOCAL_PRODUCTS;`, context, {
    filename: 'src/data/products.js'
  });
  return JSON.parse(JSON.stringify(context.__PRODUCTS__));
}

export function validateProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('Catalog phải là một mảng không rỗng.');
  }

  const ids = new Set();
  for (const [index, product] of products.entries()) {
    if (!product || typeof product !== 'object') throw new Error(`Sản phẩm #${index + 1} không hợp lệ.`);
    if (!product.id || typeof product.id !== 'string') throw new Error(`Sản phẩm #${index + 1} thiếu id.`);
    if (!/^[A-Za-z0-9_-]+$/.test(product.id)) throw new Error(`ID không an toàn: ${product.id}`);
    if (ids.has(product.id)) throw new Error(`ID sản phẩm bị trùng: ${product.id}`);
    if (!product.name || typeof product.name !== 'string') throw new Error(`${product.id} thiếu name.`);
    if (!Number.isFinite(product.price) || product.price < 0) throw new Error(`${product.id} có price không hợp lệ.`);
    if (!product.brandSlug || !product.slug) throw new Error(`${product.id} thiếu brandSlug hoặc slug.`);
    ids.add(product.id);
  }

  return { count: products.length, ids };
}

async function createAdminApp() {
  const envFile = await readDotEnv();
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || envFile.FIREBASE_SERVICE_ACCOUNT_JSON;
  let credential;

  if (serviceAccountJson && !serviceAccountJson.includes('"project_id":"..."')) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (serviceAccount.project_id !== projectId) {
      throw new Error(`Service account thuộc project ${serviceAccount.project_id}, cần ${projectId}.`);
    }
    credential = cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault();
  } else {
    throw new Error(
      'Thiếu credential quản trị. Đặt FIREBASE_SERVICE_ACCOUNT_JSON trong .env hoặc ' +
      'GOOGLE_APPLICATION_CREDENTIALS trỏ tới service-account JSON rồi chạy lại với --commit.'
    );
  }

  return getApps()[0] || initializeApp({ credential, projectId });
}

async function main() {
  const products = await loadProducts();
  const { count } = validateProducts(products);
  console.log(`Catalog hợp lệ: ${count} sản phẩm, ${count} ID duy nhất.`);

  if (!commit) {
    console.log('Dry run hoàn tất. Thêm --commit để ghi vào Firestore collection products.');
    return;
  }

  const app = await createAdminApp();
  const db = getFirestore(app);

  const existingDocs = await db.collection('products').get();
  const validDocIds = new Set(products.map(p => p.id));
  let deletedCount = 0;
  for (const doc of existingDocs.docs) {
    if (!validDocIds.has(doc.id)) {
      await doc.ref.delete();
      deletedCount++;
      console.log(`Đã xóa sản phẩm thừa khỏi Firestore: ${doc.id}`);
    }
  }
  if (deletedCount > 0) {
    console.log(`Đã dọn dẹp ${deletedCount} sản phẩm cũ không còn trong catalog.`);
  }

  const batch = db.batch();
  const syncedAt = Timestamp.now();

  for (const product of products) {
    batch.set(db.collection('products').doc(product.id), {
      ...product,
      syncedAt,
      source: 'local-catalog'
    });
  }

  await batch.commit();

  const snapshots = await db.getAll(...products.map(product => db.collection('products').doc(product.id)));
  const uploaded = snapshots.filter(snapshot => snapshot.exists).length;
  if (uploaded !== count) throw new Error(`Xác minh thất bại: chỉ đọc lại được ${uploaded}/${count} sản phẩm.`);

  console.log(`Đã upsert và xác minh ${uploaded} sản phẩm tại ${projectId}/products.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main().catch(error => {
    console.error(`Import thất bại: ${error.message}`);
    process.exitCode = 1;
  });
}
