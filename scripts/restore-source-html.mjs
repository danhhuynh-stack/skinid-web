import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'index.source.html');
const targetPath = path.join(rootDir, 'index.html');

const SUBROUTES = [
  'products',
  'khuyen-mai',
  'blog',
  'goc-cham-da',
  'tin-tuc',
  'tra-cuu-cong-bo',
  'compliance',
  'kiem-chung',
  'skin-analysis',
  'admin',
  'profile',
  'acie',
  'acie-vision',
  'chinh-sach-bao-mat',
  'chinh-sach-van-chuyen',
  'chinh-sach-doi-tra',
  'chinh-sach-thanh-toan',
  'dieu-khoan-giao-dich',
  'quy-trinh-khieu-nai'
];

if (fs.existsSync(sourcePath)) {
  const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
  fs.writeFileSync(targetPath, sourceHtml, 'utf8');
  for (const route of SUBROUTES) {
    const subIndex = path.join(rootDir, route, 'index.html');
    if (fs.existsSync(subIndex)) {
      const canonicalUrl = `https://skinid.vn/${route}/`;
      const customHtml = sourceHtml
        .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`)
        .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`);
      fs.writeFileSync(subIndex, customHtml, 'utf8');
    }
  }
  console.log('🔄 Restored index.html and SPA subroutes from index.source.html for Vite');
} else {
  console.warn('⚠️ index.source.html not found!');
}
