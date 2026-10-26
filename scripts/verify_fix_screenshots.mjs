import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:5173'; // Dev server đang chạy
const ARTIFACT_DIR = 'D:\\skinid-web-extracted\\audit_artifacts';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Kiểm tra Footer trên Desktop
  console.log('Truy cập trang chủ dev server để kiểm tra Footer...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 15000 });
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'end' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_01_footer_fixed.png') });
  console.log('📸 Đã chụp verify_01_footer_fixed.png');

  // 2. Kiểm tra Sidebar Chính sách
  console.log('Truy cập trang /chinh-sach-bao-mat để kiểm tra Sidebar...');
  await page.goto(`${TARGET_URL}/chinh-sach-bao-mat`, { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_02_policy_sidebar_fixed.png') });
  console.log('📸 Đã chụp verify_02_policy_sidebar_fixed.png');

  // 3. Quét lại xem còn phần tử BCT vi phạm nào không
  const checkViolations = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    const hasOnlineGov = !!document.querySelector('a[href*="online.gov.vn"]');
    const hasDaThongBaoBadge = text.includes('đã thông báo bộ công thương') || text.includes('đã thông báo bct');
    return {
      hasOnlineGov,
      hasDaThongBaoBadge
    };
  });
  console.log('KẾT QUẢ KIỂM TRA VI PHẠM BCT:', checkViolations);

  await browser.close();
}

verify();
