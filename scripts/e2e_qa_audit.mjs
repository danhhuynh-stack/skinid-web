import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'D:\\skinid-web-extracted\\qa_artifacts';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function runAudit() {
  console.log('🚀 Khởi động Chrome hậu kiểm E2E (domcontentloaded)...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const report = {
    errors: [],
    pricingChecks: [],
    uiAlignments: [],
    pagesVisited: []
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        report.errors.push(`[Console Error]: ${msg.text()}`);
      }
    });

    // 1. TRANG CHỦ
    console.log('--- 1. Kiểm tra Trang chủ (Desktop 1440x900) ---');
    await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000)); // Đợi hydration
    await page.screenshot({ path: path.join(outDir, 'desktop_homepage.png'), fullPage: false });
    report.pagesVisited.push('Trang chủ Desktop');

    const productCardsInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.product-card'));
      return cards.slice(0, 8).map(c => {
        const titleEl = c.querySelector('.product-card__name');
        const priceEl = c.querySelector('.product-card__price');
        const origPriceEl = c.querySelector('.product-card__original-price');
        const badgeEl = c.querySelector('.product-card__discount');
        const btnCart = c.querySelector('.product-card__cart-button');
        const btnBox = btnCart ? btnCart.getBoundingClientRect() : null;

        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: priceEl ? priceEl.textContent.trim() : '',
          originalPrice: origPriceEl ? origPriceEl.textContent.trim() : null,
          discountBadge: badgeEl ? badgeEl.textContent.trim() : null,
          btnBottom: btnBox ? Math.round(btnBox.bottom) : null
        };
      });
    });
    console.log(`Thu thập ${productCardsInfo.length} thẻ sản phẩm trang chủ.`);
    report.pricingChecks.push({ page: 'Trang chủ', products: productCardsInfo });

    // 2. TRANG KHUYẾN MÃI
    console.log('--- 2. Kiểm tra Trang Khuyến Mại (Desktop 1440x900) ---');
    await page.goto('http://localhost:4173/khuyen-mai', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'desktop_promotions.png'), fullPage: false });
    report.pagesVisited.push('Trang Khuyến mãi Desktop');

    // 3. TRANG SẢN PHẨM
    console.log('--- 3. Kiểm tra Trang Sản Phẩm (Desktop 1440x900) ---');
    await page.goto('http://localhost:4173/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'desktop_products.png'), fullPage: false });
    report.pagesVisited.push('Trang Sản phẩm Desktop');

    // 4. TRANG ADMIN
    console.log('--- 4. Kiểm tra Trang Admin (Desktop 1440x900) ---');
    await page.goto('http://localhost:4173/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'desktop_admin.png'), fullPage: false });
    report.pagesVisited.push('Trang Admin Desktop');

    // 5. MOBILE VIEWPORT (390x844 - iPhone)
    console.log('--- 5. Kiểm tra Mobile Viewport (iPhone 390x844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });

    await mobilePage.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await mobilePage.screenshot({ path: path.join(outDir, 'mobile_homepage.png'), fullPage: false });

    await mobilePage.goto('http://localhost:4173/khuyen-mai', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await mobilePage.screenshot({ path: path.join(outDir, 'mobile_promotions.png'), fullPage: false });

    await mobilePage.goto('http://localhost:4173/chinh-sach-bao-mat', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await mobilePage.screenshot({ path: path.join(outDir, 'mobile_policy.png'), fullPage: false });

    const mobileCheck = await mobilePage.evaluate(() => {
      return {
        scrollY: window.scrollY,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    });
    console.log('Mobile Check Policy:', mobileCheck);
    report.uiAlignments.push({ mobileCheck });

    console.log('🎉 TOÀN BỘ AUDIT E2E THÀNH CÔNG RỰC RỠ!');
  } catch (err) {
    console.error('Lỗi khi chạy QA audit:', err);
    report.errors.push(`Audit failure: ${err.message}`);
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(outDir, 'qa_report.json'), JSON.stringify(report, null, 2), 'utf8');
}

runAudit();
