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

  // 7. SPA subroute entrypoints with unique canonical URLs and metadata
  const routeMeta = {
    'products': {
      title: 'Tất cả Sản phẩm Dược mỹ phẩm Chính Hãng | SkinID.vn',
      desc: 'Danh mục 54 sản phẩm dược mỹ phẩm Rilastil (Ý), chăm sóc cơ thể TWON và nước hoa D\'VAH nhập khẩu chính ngạch tại SkinID.vn.',
      canonical: 'https://skinid.vn/products/'
    },
    'khuyen-mai': {
      title: 'Khuyến Mãi & Voucher Giảm Giá Độc Quyền | SkinID.vn',
      desc: 'Tổng hợp mã giảm giá, voucher freeship và ưu đãi flash sale dược mỹ phẩm chính hãng tại SkinID.vn.',
      canonical: 'https://skinid.vn/khuyen-mai/'
    },
    'blog': {
      title: 'Góc Chăm Da & Cẩm Nang Dược Mỹ Phẩm Chuẩn Y Khoa | SkinID.vn',
      desc: 'Kiến thức chăm sóc da khoa học theo 4 bước routine: Làm sạch, Đặc trị, Khóa ẩm, Bảo vệ từ đội ngũ chuyên môn SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'goc-cham-da': {
      title: 'Góc Chăm Da & Cẩm Nang Dược Mỹ Phẩm Chuẩn Y Khoa | SkinID.vn',
      desc: 'Kiến thức chăm sóc da khoa học theo 4 bước routine: Làm sạch, Đặc trị, Khóa ẩm, Bảo vệ từ đội ngũ chuyên môn SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'tin-tuc': {
      title: 'Góc Chăm Da & Tin Tức Dược Mỹ Phẩm | SkinID.vn',
      desc: 'Kiến thức chăm sóc da khoa học theo 4 bước routine từ chuyên gia SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'tra-cuu-cong-bo': {
      title: 'Tra cứu Phiếu Tiếp Nhận Công Bố Mỹ Phẩm Chính Ngạch | SkinID.vn',
      desc: 'Hệ thống tra cứu số công bố mỹ phẩm (CBMP) cấp bởi Cục Quản Lý Dược - Bộ Y Tế cho toàn bộ sản phẩm tại SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'compliance': {
      title: 'Tra cứu Phiếu Tiếp Nhận Công Bố Mỹ Phẩm Chính Ngạch | SkinID.vn',
      desc: 'Hệ thống tra cứu số công bố mỹ phẩm (CBMP) cấp bởi Cục Quản Lý Dược - Bộ Y Tế cho toàn bộ sản phẩm tại SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'kiem-chung': {
      title: 'Tra cứu Phiếu Tiếp Nhận Công Bố Mỹ Phẩm Chính Ngạch | SkinID.vn',
      desc: 'Hệ thống tra cứu số công bố mỹ phẩm (CBMP) cấp bởi Cục Quản Lý Dược - Bộ Y Tế cho toàn bộ sản phẩm tại SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'skin-analysis': {
      title: 'Phân Tích Da AI 3 Góc Độ Chuẩn Da Liễu | SkinID.vn',
      desc: 'Công nghệ soi da AI 3 góc thời gian thực, đo lường tổn thương da và đề xuất routine dược mỹ phẩm cá nhân hóa.',
      canonical: 'https://skinid.vn/skin-analysis/'
    },
    'admin': {
      title: 'Quản Trị Hệ Thống | SkinID.vn',
      canonical: 'https://skinid.vn/admin/'
    },
    'profile': {
      title: 'Hồ Sơ Cá Nhân & Lịch Sử Soi Da | SkinID.vn',
      canonical: 'https://skinid.vn/profile/'
    },
    'acie': {
      title: 'Trợ Lý Da Liễu Ảo ACIE | SkinID.vn',
      canonical: 'https://skinid.vn/acie/'
    },
    'acie-vision': {
      title: 'Trợ Lý Da Liễu Ảo ACIE | SkinID.vn',
      canonical: 'https://skinid.vn/acie/'
    }
  };

  const routes = Object.keys(routeMeta);
  for (const route of routes) {
    const routeDir = path.join(rootDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    const meta = routeMeta[route];
    let customHtml = distIndex;
    if (meta.canonical) {
      customHtml = customHtml.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${meta.canonical}">`);
      customHtml = customHtml.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${meta.canonical}">`);
    }
    if (meta.title) {
      customHtml = customHtml.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
      customHtml = customHtml.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${meta.title}">`);
    }
    if (meta.desc) {
      customHtml = customHtml.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${meta.desc}">`);
      customHtml = customHtml.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${meta.desc}">`);
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), customHtml, 'utf8');
  }
  console.log(`✅ Generated ${routes.length} SEO-optimized SPA route entrypoints with dedicated canonical URLs: ${routes.join(', ')}`);

  console.log('\n🎉 All GitHub Pages files successfully prepared and synchronized!');
}

prepare().catch((err) => {
  console.error('Fatal error during prepare:', err);
  process.exit(1);
});
