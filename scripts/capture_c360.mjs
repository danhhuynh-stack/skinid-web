import puppeteer from 'puppeteer-core';
import path from 'path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Danh Huynh\\.gemini\\antigravity\\brain\\44304065-feec-49f5-aa53-d27d772e9e82';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();
  console.log('Opening members tab...');
  await page.goto('http://localhost:5173/admin?preview=1&tab=members', { waitUntil: 'networkidle2' });
  await page.waitForSelector('button[title*="360"]', { timeout: 8000 });

  // 1. Chụp lại bảng members có cột Cấp quyền & Thao tác
  await page.screenshot({ path: path.join(outDir, 'visual_admin_members_c360.png') });
  console.log('Updated visual_admin_members_c360.png!');

  // 2. Click mở Drawer 360
  const btn = await page.$('button[title*="360"]');
  if (btn) {
    console.log('Clicking 360 button...');
    await btn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, 'visual_customer_360_drawer.png') });
    console.log('Customer 360 Drawer captured successfully!');
  }

  await browser.close();
}

run().catch(console.error);
