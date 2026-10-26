import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://skinid.vn';
const AUDIT_DIR = 'D:\\skinid-web-extracted\\audit_artifacts';

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🚀 Khởi chạy Chrome Headless để Kiểm toán Thị giác & BCT...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-cache'
    ]
  });

  const reportData = {
    bctViolations: [],
    footerInfo: {},
    productCards: [],
    typography: {},
    contrastIssues: [],
    responsiveMetrics: {}
  };

  try {
    // ==========================================
    // 1. DESKTOP AUDIT (1440 x 900)
    // ==========================================
    console.log('\n--- BẮT ĐẦU AUDIT DESKTOP (1440 x 900) ---');
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await pageDesktop.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    // Chụp Desktop Full Page
    console.log('📸 Chụp Desktop Full Page...');
    await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_01_home_full.png'), fullPage: true });

    // Chụp Desktop Above the fold
    console.log('📸 Chụp Desktop Above the fold...');
    await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_02_above_fold.png') });

    // Cuộn tới Product Grid & Chụp
    console.log('📸 Chụp Desktop Product Grid...');
    await pageDesktop.evaluate(() => {
      const el = document.querySelector('#product-grid') || document.querySelector('.products-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_03_products.png') });

    // Cuộn tới Footer & Chụp
    console.log('📸 Chụp Desktop Footer...');
    await pageDesktop.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'end' });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_04_footer.png') });

    // Quét Lệnh Truy Sát Logo BCT trên Desktop
    const bctElements = await pageDesktop.evaluate(() => {
      const results = [];
      const keywords = ['online.gov.vn', 'bộ công thương', 'đã thông báo', 'đã đăng ký', 'bo cong thuong'];
      const allElements = Array.from(document.querySelectorAll('a, img, div, span, button'));

      for (const el of allElements) {
        const text = (el.innerText || '').toLowerCase();
        const href = (el.getAttribute('href') || '').toLowerCase();
        const alt = (el.getAttribute('alt') || '').toLowerCase();
        const title = (el.getAttribute('title') || '').toLowerCase();

        for (const kw of keywords) {
          if (text.includes(kw) || href.includes(kw) || alt.includes(kw) || title.includes(kw)) {
            const rect = el.getBoundingClientRect();
            results.push({
              tag: el.tagName,
              className: el.className,
              outerHTML: el.outerHTML.slice(0, 300),
              matchedKeyword: kw,
              boundingBox: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              }
            });
            break;
          }
        }
      }
      return results;
    });
    reportData.bctViolations = bctElements;
    console.log(`🚨 Phát hiện ${bctElements.length} phần tử liên quan đến Bộ Công Thương trên DOM.`);

    // Quét chi tiết các thẻ sản phẩm (Product Cards) để đo độ lệch pixel
    const cardMetrics = await pageDesktop.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.product-card'));
      return cards.slice(0, 8).map((card, i) => {
        const rect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);
        const titleEl = card.querySelector('.product-card__title') || card.querySelector('h3') || card.querySelector('h2');
        const priceEl = card.querySelector('.product-card__price') || card.querySelector('.price');
        const imgEl = card.querySelector('img');
        const btnEl = card.querySelector('button');

        return {
          index: i,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          padding: style.padding,
          margin: style.margin,
          borderRadius: style.borderRadius,
          titleFontSize: titleEl ? window.getComputedStyle(titleEl).fontSize : 'N/A',
          titleFontWeight: titleEl ? window.getComputedStyle(titleEl).fontWeight : 'N/A',
          titleHeight: titleEl ? Math.round(titleEl.getBoundingClientRect().height) : 0,
          priceColor: priceEl ? window.getComputedStyle(priceEl).color : 'N/A',
          imgAspectRatio: imgEl ? `${imgEl.naturalWidth}x${imgEl.naturalHeight}` : 'N/A',
          btnBgColor: btnEl ? window.getComputedStyle(btnEl).backgroundColor : 'N/A'
        };
      });
    });
    reportData.productCards = cardMetrics;

    // Test mở PDP Modal (Chi tiết sản phẩm)
    console.log('🔍 Mở Product Detail Modal...');
    const hasClickedProduct = await pageDesktop.evaluate(() => {
      const firstCard = document.querySelector('.product-card');
      if (firstCard) {
        firstCard.click();
        return true;
      }
      return false;
    });

    if (hasClickedProduct) {
      await new Promise((r) => setTimeout(r, 1500));
      await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_05_pdp_modal.png') });
      console.log('📸 Đã chụp Product Detail Modal');

      // Bấm nút "Thêm vào giỏ"
      await pageDesktop.evaluate(() => {
        const addBtn = document.querySelector('.product-detail-modal button[type="submit"]') ||
          document.querySelector('button.btn--primary') ||
          Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Thêm vào giỏ') || b.innerText.includes('Mua ngay'));
        if (addBtn) addBtn.click();
      });
      await new Promise((r) => setTimeout(r, 1500));

      // Chụp Cart Drawer
      await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_06_cart_drawer.png') });
      console.log('📸 Đã chụp Cart Drawer');

      // Bấm "Tiến hành đặt hàng" để mở Checkout Modal
      await pageDesktop.evaluate(() => {
        const checkoutBtn = Array.from(document.querySelectorAll('button, a')).find((b) => (b.innerText || '').includes('Tiến hành đặt hàng') || (b.innerText || '').includes('Thanh toán'));
        if (checkoutBtn) checkoutBtn.click();
      });
      await new Promise((r) => setTimeout(r, 1500));

      // Bấm Đặt hàng khi form trống để trigger Validation Error
      await pageDesktop.evaluate(() => {
        const submitOrder = document.querySelector('#checkout-submit-btn') || Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('Hoàn tất đặt hàng') || (b.innerText || '').includes('Đặt hàng ngay'));
        if (submitOrder) submitOrder.click();
      });
      await new Promise((r) => setTimeout(r, 1000));
      await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_07_checkout_validation.png') });
      console.log('📸 Đã chụp Checkout Validation Error');
    }

    // Chụp Trang Chính Sách Bảo Mật Desktop
    console.log('📸 Chụp Desktop Trang Chính Sách...');
    await pageDesktop.goto(`${TARGET_URL}/chinh-sach-bao-mat`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await pageDesktop.screenshot({ path: path.join(AUDIT_DIR, 'desktop_08_policy_privacy.png'), fullPage: true });

    await pageDesktop.close();

    // ==========================================
    // 2. MOBILE AUDIT (390 x 844 - iPhone 14/15)
    // ==========================================
    console.log('\n--- BẮT ĐẦU AUDIT MOBILE (390 x 844 - iPhone) ---');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3
    });
    await pageMobile.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');

    await pageMobile.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Chụp Mobile Full Page
    console.log('📱 Chụp Mobile Full Page...');
    await pageMobile.screenshot({ path: path.join(AUDIT_DIR, 'mobile_01_home_full.png'), fullPage: true });

    // Chụp Mobile Above the fold
    console.log('📱 Chụp Mobile Above the fold...');
    await pageMobile.screenshot({ path: path.join(AUDIT_DIR, 'mobile_02_above_fold.png') });

    // Cuộn tới Product Grid trên Mobile
    await pageMobile.evaluate(() => {
      const el = document.querySelector('#product-grid') || document.querySelector('.products-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageMobile.screenshot({ path: path.join(AUDIT_DIR, 'mobile_03_products.png') });

    // Cuộn tới Footer trên Mobile
    await pageMobile.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'end' });
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageMobile.screenshot({ path: path.join(AUDIT_DIR, 'mobile_04_footer.png') });

    // Chụp Mobile Trang Chính Sách
    await pageMobile.goto(`${TARGET_URL}/chinh-sach-thanh-toan`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await pageMobile.screenshot({ path: path.join(AUDIT_DIR, 'mobile_05_policy_payment.png'), fullPage: true });

    await pageMobile.close();

    // Lưu dữ liệu audit ra JSON
    fs.writeFileSync(path.join(AUDIT_DIR, 'audit_raw_data.json'), JSON.stringify(reportData, null, 2), 'utf8');
    console.log('\n🎉 Hoàn thành xuất sắc thu thập dữ liệu và hình ảnh kiểm toán!');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình audit:', err);
  } finally {
    await browser.close();
  }
}

runAudit();
