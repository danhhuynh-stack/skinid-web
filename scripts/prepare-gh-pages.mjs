import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

async function prepare() {
  console.log('🚀 Preparing repository root for GitHub Pages publication...\n');

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('❌ dist/index.html not found! Run npm run build first.');
    process.exit(1);
  }

  // 1. CNAME
  const cnamePath = path.join(rootDir, 'CNAME');
  fs.writeFileSync(cnamePath, 'skinid.vn\n', 'utf8');
  console.log('✅ Created root CNAME: skinid.vn');

  // 2. index.html & 404.html
  const distIndex = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  fs.writeFileSync(path.join(rootDir, 'index.html'), distIndex, 'utf8');
  fs.writeFileSync(path.join(rootDir, '404.html'), distIndex, 'utf8');
  console.log('✅ Synchronized index.html and 404.html from dist/index.html');

  // 3. assets/
  if (fs.existsSync(path.join(distDir, 'assets'))) {
    copyRecursiveSync(path.join(distDir, 'assets'), path.join(rootDir, 'assets'));
    console.log('✅ Synchronized assets/ directory');
  }

  // 4. images/
  if (fs.existsSync(path.join(distDir, 'images'))) {
    copyRecursiveSync(path.join(distDir, 'images'), path.join(rootDir, 'images'));
    console.log('✅ Synchronized images/ directory');
  }

  // 5. videos/
  if (fs.existsSync(path.join(distDir, 'videos'))) {
    copyRecursiveSync(path.join(distDir, 'videos'), path.join(rootDir, 'videos'));
    console.log('✅ Synchronized videos/ directory');
  }

  // 6. og-image.jpg & root files
  if (fs.existsSync(path.join(distDir, 'og-image.jpg'))) {
    fs.copyFileSync(path.join(distDir, 'og-image.jpg'), path.join(rootDir, 'og-image.jpg'));
    console.log('✅ Synchronized og-image.jpg');
  }

  // 7. SPA subroute entrypoints
  const routes = [
    'products',
    'admin',
    'profile',
    'skin-analysis',
    'acie',
    'acie-vision',
    'tra-cuu-cong-bo',
    'compliance',
    'kiem-chung'
  ];

  for (const route of routes) {
    const routeDir = path.join(rootDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), distIndex, 'utf8');
  }
  console.log(`✅ Generated ${routes.length} SPA route entrypoints: ${routes.join(', ')}`);

  console.log('\n🎉 All GitHub Pages files successfully prepared and synchronized!');
}

prepare().catch((err) => {
  console.error('Fatal error during prepare:', err);
  process.exit(1);
});
