const fs = require('fs');
const path = require('path');

const srcDist = 'D:\\skinid-web-extracted\\dist';
const targetDir = 'C:\\Users\\Danh Huynh\\.gemini\\antigravity\\scratch\\skinid-v2';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying dist to target deployment directory...');
copyDirRecursive(srcDist, targetDir);

// 1. Ensure 404.html matches index.html
const indexHtmlPath = path.join(targetDir, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
fs.writeFileSync(path.join(targetDir, '404.html'), indexHtml, 'utf8');
console.log('Synchronized 404.html with index.html');

// 2. Ensure CNAME and .nojekyll
fs.writeFileSync(path.join(targetDir, 'CNAME'), 'skinid.vn\n', 'utf8');
fs.writeFileSync(path.join(targetDir, '.nojekyll'), '', 'utf8');
console.log('Ensured CNAME and .nojekyll');

// 3. Generate SPA sub-routes
const routes = [
  'products',
  'profile',
  'skin-analysis',
  'admin',
  'acie',
  'acie-vision',
  'tra-cuu-cong-bo',
  'compliance',
  'kiem-chung',
  'chinh-sach-bao-mat',
  'chinh-sach-van-chuyen',
  'chinh-sach-doi-tra',
  'chinh-sach-thanh-toan',
  'dieu-khoan-giao-dich',
  'quy-trinh-khieu-nai'
];

for (const r of routes) {
  const rDir = path.join(targetDir, r);
  if (!fs.existsSync(rDir)) fs.mkdirSync(rDir, { recursive: true });
  fs.writeFileSync(path.join(rDir, 'index.html'), indexHtml, 'utf8');
  console.log('Generated SPA route entry: /' + r + '/index.html');
}

console.log('All files synchronized successfully!');
