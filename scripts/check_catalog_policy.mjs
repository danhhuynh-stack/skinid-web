import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkCatalogAndPolicy() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Kiểm tra trang /products
  console.log('Đang truy cập /products...');
  await page.goto('https://skinid.vn/products', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'D:\\skinid-web-extracted\\audit_artifacts\\desktop_products_catalog.png' });

  const catalogMetrics = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div, a, article'));
    const cards = allDivs.filter(el => {
      const t = el.innerText || '';
      return t.includes('₫') && el.querySelector('img') && (t.includes('Rilastil') || t.includes('Kem') || t.includes('Serum') || t.includes('Sữa'));
    });
    // Filter leaf cards
    const leafCards = cards.filter(c => !cards.some(other => other !== c && c.contains(other)));

    return leafCards.slice(0, 10).map((c, i) => {
      const r = c.getBoundingClientRect();
      const s = window.getComputedStyle(c);
      const title = c.querySelector('h2, h3, h4, [class*="name"], [class*="title"], p.font-bold');
      const btn = c.querySelector('button');
      const price = Array.from(c.querySelectorAll('*')).find(n => n.innerText && /[\d\.]+\s*₫/.test(n.innerText));

      return {
        index: i,
        className: c.className,
        width: Math.round(r.width),
        height: Math.round(r.height),
        title: title ? title.innerText.trim().slice(0, 50) : 'N/A',
        titleHeight: title ? Math.round(title.getBoundingClientRect().height) : 0,
        price: price ? price.innerText.trim() : 'N/A',
        btnText: btn ? btn.innerText.trim() : 'N/A',
        borderRadius: s.borderRadius,
        boxShadow: s.boxShadow
      };
    });
  });
  console.log('CATALOG METRICS:', JSON.stringify(catalogMetrics, null, 2));

  // 2. Kiểm tra trang /chinh-sach-bao-mat
  console.log('Đang truy cập /chinh-sach-bao-mat...');
  await page.goto('https://skinid.vn/chinh-sach-bao-mat', { waitUntil: 'networkidle2', timeout: 30000 });
  const policyAudit = await page.evaluate(() => {
    const bctElements = Array.from(document.querySelectorAll('a, div, span')).filter(el => {
      const t = (el.innerText || '').toLowerCase();
      const h = (el.getAttribute('href') || '').toLowerCase();
      return (t.includes('bộ công thương') || t.includes('đã thông báo') || h.includes('online.gov.vn')) && !el.closest('footer');
    });

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.innerText.trim().slice(0, 60),
      fontSize: window.getComputedStyle(h).fontSize
    }));

    return {
      sidebarBctViolations: bctElements.map(el => ({
        tag: el.tagName,
        className: el.className,
        outerHTML: el.outerHTML.slice(0, 200)
      })),
      headingsCount: headings.length,
      headingsSample: headings.slice(0, 6)
    };
  });
  console.log('POLICY AUDIT:', JSON.stringify(policyAudit, null, 2));

  fs.writeFileSync('D:\\skinid-web-extracted\\audit_artifacts\\catalog_and_policy_metrics.json', JSON.stringify({
    catalogMetrics,
    policyAudit
  }, null, 2), 'utf8');

  await browser.close();
}

checkCatalogAndPolicy();
