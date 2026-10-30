import puppeteer from 'puppeteer-core';
import path from 'path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Danh Huynh\\.gemini\\antigravity\\brain\\44304065-feec-49f5-aa53-d27d772e9e82';

async function run() {
  console.log('🚀 Khởi động Puppeteer Core...');
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();

  // 1. Chụp Order Timeline Modal
  console.log('📸 Đang mở trang Orders...');
  await page.goto('http://localhost:5173/admin?preview=1&tab=orders', { waitUntil: 'networkidle2' });
  await page.waitForSelector('button[title*="thời gian"]', { timeout: 8000 }).catch(() => {});
  const timelineBtn = await page.$('button[title*="thời gian"]');
  if (timelineBtn) {
    console.log('👉 Click mở OrderTimelineModal...');
    await timelineBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    const modalPath = path.join(outDir, 'visual_order_timeline_modal.png');
    await page.screenshot({ path: modalPath });
    console.log('✅ Đã chụp visual_order_timeline_modal.png');
  }

  // 2. Chụp Customer 360 Drawer
  console.log('📸 Đang mở trang Members...');
  await page.goto('http://localhost:5173/admin?preview=1&tab=members', { waitUntil: 'networkidle2' });
  await page.waitForSelector('button[title*="360"]', { timeout: 8000 }).catch(() => {});
  const c360Btn = await page.$('button[title*="360"]');
  if (c360Btn) {
    console.log('👉 Click mở CustomerDetailDrawer...');
    await c360Btn.click();
    await new Promise(r => setTimeout(r, 1200));
    const drawerPath = path.join(outDir, 'visual_customer_360_drawer.png');
    await page.screenshot({ path: drawerPath });
    console.log('✅ Đã chụp visual_customer_360_drawer.png');
  }

  // 3. Chụp Bulk Coupon Modal
  console.log('📸 Đang mở trang Promotions...');
  await page.goto('http://localhost:5173/admin?preview=1&tab=promotions', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const bulkBtnHandle = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('Tạo hàng loạt'));
  });
  if (bulkBtnHandle && bulkBtnHandle.asElement()) {
    console.log('👉 Click mở BulkCouponModal...');
    await bulkBtnHandle.asElement().click();
    await new Promise(r => setTimeout(r, 1200));
    const bulkPath = path.join(outDir, 'visual_bulk_coupon_modal.png');
    await page.screenshot({ path: bulkPath });
    console.log('✅ Đã chụp visual_bulk_coupon_modal.png');
  }

  await browser.close();
  console.log('🎉 Hoàn tất Puppeteer!');
}

run().catch(err => {
  console.error('Lỗi Puppeteer:', err);
  process.exit(1);
});
