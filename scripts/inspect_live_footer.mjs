import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectLive() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Đang truy cập https://skinid.vn...');
  await page.goto('https://skinid.vn', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  const footerInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return 'NO FOOTER';
    const text = footer.innerText;
    const hasBCT = text.includes('ĐÃ THÔNG BÁO') || text.includes('BỘ CÔNG THƯƠNG') || text.includes('online.gov.vn');
    const bctElements = Array.from(footer.querySelectorAll('*')).filter(el => {
      const t = el.textContent || '';
      return t.includes('ĐÃ THÔNG BÁO') || t.includes('BỘ CÔNG THƯƠNG');
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      outerHTML: el.outerHTML
    }));

    return {
      hasBCT,
      bctElementsCount: bctElements.length,
      sampleHTML: bctElements.slice(0, 3)
    };
  });

  console.log('KẾT QUẢ KIỂM TRA FOOTER LIVE:');
  console.log(JSON.stringify(footerInfo, null, 2));

  await page.screenshot({ path: 'D:\\skinid-web-extracted\\qa_artifacts\\live_site_footer.png', fullPage: false });
  await browser.close();
}

inspectLive().catch(console.error);
