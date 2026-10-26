import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://skinid.vn', { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const h1 = document.querySelector('h1');
    const h1Style = h1 ? window.getComputedStyle(h1) : null;

    const offerBar = document.querySelector('.offer-bar') || document.querySelector('[class*="offer"]');
    const offerBarStyle = offerBar ? window.getComputedStyle(offerBar) : null;

    const nav = document.querySelector('header') || document.querySelector('nav');
    const navStyle = nav ? window.getComputedStyle(nav) : null;

    const footer = document.querySelector('footer');
    const footerStyle = footer ? window.getComputedStyle(footer) : null;

    // Tìm tất cả các thẻ sản phẩm trong grid
    const allDivs = Array.from(document.querySelectorAll('div, article, section'));
    const cards = allDivs.filter(el => {
      const text = el.innerText || '';
      return text.includes('₫') && (text.includes('Rilastil') || text.includes('TWON') || text.includes('D\'VAH') || text.includes('Gel')) && el.querySelector('img') && el.querySelector('button');
    });

    // Lấy cấp con nhỏ nhất (leaf cards)
    const leafCards = cards.filter(c => {
      return !cards.some(other => other !== c && c.contains(other));
    });

    const sampleCards = leafCards.slice(0, 10).map((el, idx) => {
      const rect = el.getBoundingClientRect();
      const title = el.querySelector('h2, h3, h4, [class*="title"], [class*="name"]');
      const price = Array.from(el.querySelectorAll('*')).find(n => n.innerText && /[\d\.]+\s*₫/.test(n.innerText));
      const btn = el.querySelector('button');
      const img = el.querySelector('img');

      return {
        index: idx,
        tagName: el.tagName,
        className: el.className,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        titleText: title ? title.innerText.trim().slice(0, 60) : 'N/A',
        titleHeight: title ? Math.round(title.getBoundingClientRect().height) : 0,
        titleFontSize: title ? window.getComputedStyle(title).fontSize : 'N/A',
        titleFontWeight: title ? window.getComputedStyle(title).fontWeight : 'N/A',
        priceText: price ? price.innerText.trim() : 'N/A',
        priceColor: price ? window.getComputedStyle(price).color : 'N/A',
        btnText: btn ? btn.innerText.trim() : 'N/A',
        btnSize: btn ? `${Math.round(btn.getBoundingClientRect().width)}x${Math.round(btn.getBoundingClientRect().height)}` : 'N/A',
        btnBg: btn ? window.getComputedStyle(btn).backgroundColor : 'N/A',
        btnPadding: btn ? window.getComputedStyle(btn).padding : 'N/A',
        imgDimensions: img ? `${img.naturalWidth}x${img.naturalHeight}` : 'N/A',
        imgRendered: img ? `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}` : 'N/A'
      };
    });

    return {
      title: document.title,
      bodyFont: bodyStyle.fontFamily,
      bodyBg: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      h1: h1 ? {
        text: h1.innerText.trim().slice(0, 80),
        fontSize: h1Style.fontSize,
        lineHeight: h1Style.lineHeight,
        color: h1Style.color,
        fontWeight: h1Style.fontWeight
      } : null,
      offerBar: offerBar ? {
        text: offerBar.innerText.trim(),
        bg: offerBarStyle.backgroundColor,
        color: offerBarStyle.color,
        fontSize: offerBarStyle.fontSize,
        height: Math.round(offerBar.getBoundingClientRect().height)
      } : null,
      nav: nav ? {
        height: Math.round(nav.getBoundingClientRect().height),
        bg: navStyle.backgroundColor,
        position: navStyle.position
      } : null,
      footer: footer ? {
        height: Math.round(footer.getBoundingClientRect().height),
        bg: footerStyle.backgroundColor,
        color: footerStyle.color
      } : null,
      sampleCardsCount: sampleCards.length,
      sampleCards
    };
  });

  console.log('--- KẾT QUẢ ĐO LƯỜNG DOM VÀ CSS THỰC TẾ ---');
  console.log(JSON.stringify(data, null, 2));

  fs.writeFileSync('D:\\skinid-web-extracted\\audit_artifacts\\dom_detailed_metrics.json', JSON.stringify(data, null, 2), 'utf8');
  await browser.close();
}

inspect();
