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
  console.log('ðŸš€ Preparing repository root for GitHub Pages publication...\n');

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('âŒ dist/index.html not found! Run npm run build first.');
    process.exit(1);
  }

  // 1. CNAME
  const cnamePath = path.join(rootDir, 'CNAME');
  fs.writeFileSync(cnamePath, 'skinid.vn\n', 'utf8');
  console.log('âœ… Created root CNAME: skinid.vn');

  // 2. index.html & 404.html
  const distIndex = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  fs.writeFileSync(path.join(rootDir, 'index.html'), distIndex, 'utf8');
  fs.writeFileSync(path.join(rootDir, '404.html'), distIndex, 'utf8');
  console.log('âœ… Synchronized index.html and 404.html from dist/index.html');

  // 3. assets/
  if (fs.existsSync(path.join(distDir, 'assets'))) {
    if (fs.existsSync(path.join(rootDir, 'assets'))) {
      fs.rmSync(path.join(rootDir, 'assets'), { recursive: true, force: true });
    }
    copyRecursiveSync(path.join(distDir, 'assets'), path.join(rootDir, 'assets'));
    console.log('âœ… Synchronized clean assets/ directory');
  }

  // 4. images/
  if (fs.existsSync(path.join(distDir, 'images'))) {
    copyRecursiveSync(path.join(distDir, 'images'), path.join(rootDir, 'images'));
    console.log('âœ… Synchronized images/ directory');
  }

  // 5. videos/
  if (fs.existsSync(path.join(distDir, 'videos'))) {
    copyRecursiveSync(path.join(distDir, 'videos'), path.join(rootDir, 'videos'));
    console.log('âœ… Synchronized videos/ directory');
  }

  // 6. og-image.jpg & root files
  if (fs.existsSync(path.join(distDir, 'og-image.jpg'))) {
    fs.copyFileSync(path.join(distDir, 'og-image.jpg'), path.join(rootDir, 'og-image.jpg'));
    console.log('âœ… Synchronized og-image.jpg');
  }

  // 7. SPA subroute entrypoints with unique canonical URLs and metadata
  const routeMeta = {
    'products': {
      title: 'Táº¥t cáº£ Sáº£n pháº©m DÆ°á»£c má»¹ pháº©m ChÃ­nh HÃ£ng | SkinID.vn',
      desc: 'Danh má»¥c 54 sáº£n pháº©m dÆ°á»£c má»¹ pháº©m Rilastil (Ã), chÄƒm sÃ³c cÆ¡ thá»ƒ TWON vÃ  nÆ°á»›c hoa D\'VAH nháº­p kháº©u chÃ­nh ngáº¡ch táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/products/'
    },
    'khuyen-mai': {
      title: 'Khuyáº¿n MÃ£i & 3 Combo Äá»™c Quyá»n â€” Giáº£m Äáº¿n 50% | SkinID.vn',
      desc: 'ChÆ°Æ¡ng trÃ¬nh Æ°u Ä‘Ã£i bÃ¹ng ná»•: 3 combo chÄƒm sÃ³c da chuyÃªn sÃ¢u vÃ  tuyá»ƒn chá»n sáº£n pháº©m bÃ¡n láº» chÃ­nh hÃ£ng giáº£m giÃ¡ Ä‘áº¿n 50% táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/khuyen-mai/'
    },
    'blog': {
      title: 'GÃ³c ChÄƒm Da & Cáº©m Nang DÆ°á»£c Má»¹ Pháº©m Chuáº©n Y Khoa | SkinID.vn',
      desc: 'Kiáº¿n thá»©c chÄƒm sÃ³c da khoa há»c theo 4 bÆ°á»›c routine: LÃ m sáº¡ch, Äáº·c trá»‹, KhÃ³a áº©m, Báº£o vá»‡ tá»« Ä‘á»™i ngÅ© chuyÃªn mÃ´n SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'goc-cham-da': {
      title: 'GÃ³c ChÄƒm Da & Cáº©m Nang DÆ°á»£c Má»¹ Pháº©m Chuáº©n Y Khoa | SkinID.vn',
      desc: 'Kiáº¿n thá»©c chÄƒm sÃ³c da khoa há»c theo 4 bÆ°á»›c routine: LÃ m sáº¡ch, Äáº·c trá»‹, KhÃ³a áº©m, Báº£o vá»‡ tá»« Ä‘á»™i ngÅ© chuyÃªn mÃ´n SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'tin-tuc': {
      title: 'GÃ³c ChÄƒm Da & Tin Tá»©c DÆ°á»£c Má»¹ Pháº©m | SkinID.vn',
      desc: 'Kiáº¿n thá»©c chÄƒm sÃ³c da khoa há»c theo 4 bÆ°á»›c routine tá»« chuyÃªn gia SkinID.',
      canonical: 'https://skinid.vn/blog/'
    },
    'tra-cuu-cong-bo': {
      title: 'Tra cá»©u Phiáº¿u Tiáº¿p Nháº­n CÃ´ng Bá»‘ Má»¹ Pháº©m ChÃ­nh Ngáº¡ch | SkinID.vn',
      desc: 'Há»‡ thá»‘ng tra cá»©u sá»‘ cÃ´ng bá»‘ má»¹ pháº©m (CBMP) cáº¥p bá»Ÿi Cá»¥c Quáº£n LÃ½ DÆ°á»£c - Bá»™ Y Táº¿ cho toÃ n bá»™ sáº£n pháº©m táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'compliance': {
      title: 'Tra cá»©u Phiáº¿u Tiáº¿p Nháº­n CÃ´ng Bá»‘ Má»¹ Pháº©m ChÃ­nh Ngáº¡ch | SkinID.vn',
      desc: 'Há»‡ thá»‘ng tra cá»©u sá»‘ cÃ´ng bá»‘ má»¹ pháº©m (CBMP) cáº¥p bá»Ÿi Cá»¥c Quáº£n LÃ½ DÆ°á»£c - Bá»™ Y Táº¿ cho toÃ n bá»™ sáº£n pháº©m táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'kiem-chung': {
      title: 'Tra cá»©u Phiáº¿u Tiáº¿p Nháº­n CÃ´ng Bá»‘ Má»¹ Pháº©m ChÃ­nh Ngáº¡ch | SkinID.vn',
      desc: 'Há»‡ thá»‘ng tra cá»©u sá»‘ cÃ´ng bá»‘ má»¹ pháº©m (CBMP) cáº¥p bá»Ÿi Cá»¥c Quáº£n LÃ½ DÆ°á»£c - Bá»™ Y Táº¿ cho toÃ n bá»™ sáº£n pháº©m táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/tra-cuu-cong-bo/'
    },
    'skin-analysis': {
      title: 'PhÃ¢n TÃ­ch Da AI 3 GÃ³c Äá»™ Chuáº©n Da Liá»…u | SkinID.vn',
      desc: 'CÃ´ng nghá»‡ soi da AI 3 gÃ³c thá»i gian thá»±c, Ä‘o lÆ°á»ng tá»•n thÆ°Æ¡ng da vÃ  Ä‘á» xuáº¥t routine dÆ°á»£c má»¹ pháº©m cÃ¡ nhÃ¢n hÃ³a.',
      canonical: 'https://skinid.vn/skin-analysis/'
    },
    'admin': {
      title: 'Quáº£n Trá»‹ Há»‡ Thá»‘ng | SkinID.vn',
      canonical: 'https://skinid.vn/admin/'
    },
    'profile': {
      title: 'Há»“ SÆ¡ CÃ¡ NhÃ¢n & Lá»‹ch Sá»­ Soi Da | SkinID.vn',
      canonical: 'https://skinid.vn/profile/'
    },
    'acie': {
      title: 'Trá»£ LÃ½ Da Liá»…u áº¢o ACIE | SkinID.vn',
      canonical: 'https://skinid.vn/acie/'
    },
    'acie-vision': {
      title: 'Trá»£ LÃ½ Da Liá»…u áº¢o ACIE | SkinID.vn',
      canonical: 'https://skinid.vn/acie/'
    },
    'chinh-sach-bao-mat': {
      title: 'ChÃ­nh SÃ¡ch Báº£o Máº­t ThÃ´ng Tin & Báº£o Vá»‡ Dá»¯ Liá»‡u CÃ¡ NhÃ¢n | SkinID.vn',
      desc: 'Quy Ä‘á»‹nh chi tiáº¿t cÃ¡ch CÃ´ng ty TNHH Fieldman thu tháº­p, mÃ£ hÃ³a vÃ  báº£o vá»‡ dá»¯ liá»‡u cÃ¡ nhÃ¢n, hÃ¬nh áº£nh soi da AI theo Luáº­t Báº£o vá»‡ dá»¯ liá»‡u cÃ¡ nhÃ¢n 91/2025/QH15 vÃ  Nghá»‹ Ä‘á»‹nh 13/2023/NÄ-CP.',
      canonical: 'https://skinid.vn/chinh-sach-bao-mat/'
    },
    'chinh-sach-van-chuyen': {
      title: 'ChÃ­nh SÃ¡ch Váº­n Chuyá»ƒn, Giao Nháº­n & Äá»“ng Kiá»ƒm HÃ ng | SkinID.vn',
      desc: 'Biá»ƒu phÃ­ giao hÃ ng toÃ n quá»‘c, thá»i gian váº­n chuyá»ƒn 1-3 ngÃ y, miá»…n phÃ­ váº­n chuyá»ƒn cho Ä‘Æ¡n tá»« 500.000Ä‘ vÃ  quyá»n Ä‘á»“ng kiá»ƒm hÃ ng trÆ°á»›c khi thanh toÃ¡n táº¡i SkinID.vn.',
      canonical: 'https://skinid.vn/chinh-sach-van-chuyen/'
    },
    'chinh-sach-doi-tra': {
      title: 'ChÃ­nh SÃ¡ch Äá»•i Tráº£ DÆ°á»£c Má»¹ Pháº©m & HoÃ n Tiá»n 100% | SkinID.vn',
      desc: 'Quy Ä‘á»‹nh Ä‘á»•i tráº£ dÆ°á»£c má»¹ pháº©m trong vÃ²ng 7 ngÃ y, báº£o hÃ nh kÃ­ch á»©ng da, quy trÃ¬nh hoÃ n tiá»n minh báº¡ch tá»« 3-7 ngÃ y lÃ m viá»‡c cá»§a CÃ´ng ty TNHH Fieldman.',
      canonical: 'https://skinid.vn/chinh-sach-doi-tra/'
    },
    'chinh-sach-thanh-toan': {
      title: 'ChÃ­nh SÃ¡ch Thanh ToÃ¡n Tiá»n Máº·t COD & Chuyá»ƒn Khoáº£n | SkinID.vn',
      desc: 'Quy Ä‘á»‹nh phÆ°Æ¡ng thá»©c thanh toÃ¡n tiá»n máº·t khi nháº­n hÃ ng (COD) vÃ  chuyá»ƒn khoáº£n ngÃ¢n hÃ ng duy nháº¥t vÃ o tÃ i khoáº£n CÃ”NG TY TNHH FIELDMAN táº¡i Vietcombank.',
      canonical: 'https://skinid.vn/chinh-sach-thanh-toan/'
    },
    'dieu-khoan-giao-dich': {
      title: 'Äiá»u Khoáº£n & Äiá»u Kiá»‡n Giao Dá»‹ch Chung Mua HÃ ng | SkinID.vn',
      desc: 'Quy Ä‘á»‹nh phÃ¡p lÃ½ vá» há»£p Ä‘á»“ng mua bÃ¡n Ä‘iá»‡n tá»­, cam káº¿t dÆ°á»£c má»¹ pháº©m chÃ­nh hÃ£ng 100%, giá»›i háº¡n trÃ¡ch nhiá»‡m cÃ´ng cá»¥ soi da AI táº¡i website SkinID.vn.',
      canonical: 'https://skinid.vn/dieu-khoan-giao-dich/'
    },
    'quy-trinh-khieu-nai': {
      title: 'Quy TrÃ¬nh Tiáº¿p Nháº­n & Giáº£i Quyáº¿t Khiáº¿u Náº¡i KhÃ¡ch HÃ ng | SkinID.vn',
      desc: 'Quy chuáº©n 6 bÆ°á»›c giáº£i quyáº¿t khiáº¿u náº¡i ngÆ°á»i tiÃªu dÃ¹ng theo Luáº­t Báº£o vá»‡ quyá»n lá»£i ngÆ°á»i tiÃªu dÃ¹ng 2023: tiáº¿p nháº­n 24h, giáº£i quyáº¿t dá»©t Ä‘iá»ƒm trong 7 ngÃ y cá»§a Fieldman.',
      canonical: 'https://skinid.vn/quy-trinh-khieu-nai/'
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
  console.log(`âœ… Generated ${routes.length} SEO-optimized SPA route entrypoints with dedicated canonical URLs: ${routes.join(', ')}`);

  console.log('\nðŸŽ‰ All GitHub Pages files successfully prepared and synchronized!');
}

prepare().catch((err) => {
  console.error('Fatal error during prepare:', err);
  process.exit(1);
});
