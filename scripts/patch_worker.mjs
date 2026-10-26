import fs from 'fs';

const workerPath = 'D:\\skinid-web-extracted\\worker\\index.js';
let content = fs.readFileSync(workerPath, 'utf8');

const seoModuleCode = `
// ========================================================
// TECHNICAL SEO & EDGE DYNAMIC RENDERING (BCT & BOTS)
// ========================================================

const BOT_USER_AGENTS = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|facebot|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|bitrix link preview|xing-content-crawler|chrome-lighthouse|telegrambot|integration-test|zalo/i;

function isBotRequest(request) {
  const ua = request.headers.get('User-Agent') || '';
  return BOT_USER_AGENTS.test(ua);
}

function handleRobotsTxt(url) {
  const robots = \`# https://skinid.vn/robots.txt
# SkinID - Hệ thống Dược Mỹ Phẩm & Chăm Sóc Da Chuẩn Y Khoa
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: \${url.origin}/sitemap.xml
\`;
  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}

function handleSitemapXml(url) {
  const origin = url.origin;
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'daily' },
    { loc: '/skin-analysis', priority: '0.9', changefreq: 'weekly' },
    { loc: '/khuyen-mai', priority: '0.8', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    { loc: '/goc-cham-da', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tin-tuc', priority: '0.7', changefreq: 'weekly' },
    { loc: '/tra-cuu-cong-bo', priority: '0.7', changefreq: 'monthly' },
    { loc: '/compliance', priority: '0.7', changefreq: 'monthly' },
    { loc: '/kiem-chung', priority: '0.7', changefreq: 'monthly' },
    // Bộ 6 chính sách website SkinID.vn nộp Bộ Công Thương
    { loc: '/chinh-sach-bao-mat', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-van-chuyen', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-doi-tra', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-thanh-toan', priority: '0.8', changefreq: 'monthly' },
    { loc: '/dieu-khoan-giao-dich', priority: '0.8', changefreq: 'monthly' },
    { loc: '/quy-trinh-khieu-nai', priority: '0.8', changefreq: 'monthly' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';

  for (const route of staticRoutes) {
    xml += \`  <url>
    <loc>\${origin}\${route.loc}</loc>
    <lastmod>\${today}</lastmod>
    <changefreq>\${route.changefreq}</changefreq>
    <priority>\${route.priority}</priority>
  </url>\\n\`;
  }

  for (const product of SERVER_CATALOG) {
    const pLoc = \`\${origin}/products/\${encodeURIComponent(product.id)}\`;
    xml += \`  <url>
    <loc>\${pLoc}</loc>
    <lastmod>\${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\\n\`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}

const POLICY_META_MAP = {
  '/chinh-sach-bao-mat': {
    title: 'Chính sách Bảo mật Thông tin & Bảo vệ Dữ liệu Cá nhân | SkinID.vn',
    desc: 'Chính sách bảo mật thông tin và bảo vệ dữ liệu cá nhân theo Luật BV dữ liệu số 91/2025/QH15 và Nghị định 52/2013/NĐ-CP của SkinID.vn.'
  },
  '/chinh-sach-van-chuyen': {
    title: 'Chính sách Kiểm hàng & Vận chuyển Giao nhận | SkinID.vn',
    desc: 'Quy định kiểm hàng đồng kiểm khi nhận và thời gian vận chuyển toàn quốc cho đơn hàng dược mỹ phẩm SkinID.vn.'
  },
  '/chinh-sach-doi-tra': {
    title: 'Chính sách Đổi trả & Hoàn tiền Minh bạch | SkinID.vn',
    desc: 'Chính sách đổi trả sản phẩm trong 7 ngày, quy trình hoàn tiền minh bạch cho khách hàng SkinID.vn.'
  },
  '/chinh-sach-thanh-toan': {
    title: 'Chính sách & Phương thức Thanh toán An toàn | SkinID.vn',
    desc: 'Hướng dẫn thanh toán COD, chuyển khoản ngân hàng qua cổng bảo mật của CÔNG TY TNHH FIELDMAN trên SkinID.vn.'
  },
  '/dieu-khoan-giao-dich': {
    title: 'Điều khoản Dịch vụ & Giao dịch Chung | SkinID.vn',
    desc: 'Điều khoản và điều kiện giao dịch mua sắm trực tuyến trên website thương mại điện tử SkinID.vn.'
  },
  '/quy-trinh-khieu-nai': {
    title: 'Quy trình Tiếp nhận & Giải quyết Khiếu nại | SkinID.vn',
    desc: 'Quy trình 5 bước tiếp nhận, xử lý khiếu nại khách hàng nhanh chóng, minh bạch theo chuẩn Bộ Công Thương.'
  }
};

function applyDynamicSeo(request, url, response) {
  const pathname = url.pathname;
  let targetProduct = null;

  // Check product route: /products/:id or query ?product=:id
  const productMatch = pathname.match(/^\\/products\\/([^/]+)$/);
  if (productMatch) {
    const rawId = decodeURIComponent(productMatch[1]);
    targetProduct = bundledProducts.get(rawId) || SERVER_CATALOG.find(p => p.slug === rawId || p.id === rawId);
  } else if (url.searchParams.has('product')) {
    const pId = url.searchParams.get('product');
    targetProduct = bundledProducts.get(pId) || SERVER_CATALOG.find(p => p.slug === pId || p.id === pId);
  }

  if (targetProduct) {
    const title = \`\${targetProduct.name} - \${targetProduct.brand || 'Chính Hãng'} | SkinID Dược Mỹ Phẩm\`;
    const desc = (targetProduct.uses || targetProduct.description || \`Dược mỹ phẩm chính hãng \${targetProduct.name} của \${targetProduct.brand}. Tư vấn da liễu chuyên sâu tại SkinID.vn.\`).slice(0, 160);
    const img = targetProduct.image ? (targetProduct.image.startsWith('http') ? targetProduct.image : \`\${url.origin}\${targetProduct.image}\`) : \`\${url.origin}/images/og-default.jpg\`;
    const canonical = \`\${url.origin}/products/\${targetProduct.slug || targetProduct.id}\`;
    const price = Number(targetProduct.price) || 0;

    const schemaProduct = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": targetProduct.name,
      "image": [img],
      "description": desc,
      "brand": {
        "@type": "Brand",
        "name": targetProduct.brand || "SkinID"
      },
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "VND",
        "price": price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "CÔNG TY TNHH FIELDMAN"
        }
      }
    };

    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(title);
        }
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', desc);
        }
      })
      .on('head', {
        element(el) {
          el.append(\`<link rel="canonical" href="\${canonical}" />\`, { html: true });
          el.append(\`<meta property="og:title" content="\${title}" />\`, { html: true });
          el.append(\`<meta property="og:description" content="\${desc}" />\`, { html: true });
          el.append(\`<meta property="og:image" content="\${img}" />\`, { html: true });
          el.append(\`<meta property="og:url" content="\${canonical}" />\`, { html: true });
          el.append(\`<meta property="og:type" content="product" />\`, { html: true });
          el.append(\`<meta property="og:site_name" content="SkinID.vn" />\`, { html: true });
          el.append(\`<meta name="twitter:card" content="summary_large_image" />\`, { html: true });
          el.append(\`<meta name="twitter:title" content="\${title}" />\`, { html: true });
          el.append(\`<meta name="twitter:description" content="\${desc}" />\`, { html: true });
          el.append(\`<meta name="twitter:image" content="\${img}" />\`, { html: true });
          el.append(\`<script type="application/ld+json">\${JSON.stringify(schemaProduct)}</script>\`, { html: true });
        }
      });

    return rewriter.transform(response);
  }

  // Check policy route
  const policyMeta = POLICY_META_MAP[pathname];
  if (policyMeta) {
    const canonical = \`\${url.origin}\${pathname}\`;
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(policyMeta.title);
        }
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', policyMeta.desc);
        }
      })
      .on('head', {
        element(el) {
          el.append(\`<link rel="canonical" href="\${canonical}" />\`, { html: true });
          el.append(\`<meta property="og:title" content="\${policyMeta.title}" />\`, { html: true });
          el.append(\`<meta property="og:description" content="\${policyMeta.desc}" />\`, { html: true });
          el.append(\`<meta property="og:url" content="\${canonical}" />\`, { html: true });
        }
      });
    return rewriter.transform(response);
  }

  return response;
}
`;

// Insert seoModuleCode before "export default {"
const exportDefaultIndex = content.indexOf('export default {');
if (exportDefaultIndex !== -1 && !content.includes('handleSitemapXml')) {
  content = content.slice(0, exportDefaultIndex) + seoModuleCode + '\n' + content.slice(exportDefaultIndex);
}

// Now update fetch in export default:
const oldFetchMethod = `  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {`;

const newFetchMethod = `  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // 1. Robots.txt handler
      if (url.pathname === '/robots.txt') {
        return handleRobotsTxt(url);
      }

      // 2. Sitemap.xml handler
      if (url.pathname === '/sitemap.xml') {
        return handleSitemapXml(url);
      }

      // 3. API handlers
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);

      // 4. Static assets & Edge Dynamic SEO Rendering
      const assetResponse = await env.ASSETS.fetch(request);
      
      // If request is from bot and response is HTML, dynamically inject OG & Schema tags
      const contentType = assetResponse.headers.get('Content-Type') || '';
      if (isBotRequest(request) && contentType.includes('text/html')) {
        return applyDynamicSeo(request, url, assetResponse);
      }

      return assetResponse;
    } catch (error) {`;

if (content.includes(oldFetchMethod)) {
  content = content.replace(oldFetchMethod, newFetchMethod);
}

fs.writeFileSync(workerPath, content, 'utf8');
console.log('Worker updated successfully with Technical SEO & Edge Dynamic Rendering!');
