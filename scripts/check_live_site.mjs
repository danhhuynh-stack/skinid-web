import https from 'https';

async function checkLive() {
  const res = await fetch('https://skinid.vn');
  const html = await res.text();
  console.log('Live HTML size:', html.length);
  const scripts = html.match(/assets\/[a-zA-Z0-9_-]+\.js/g) || [];
  console.log('Found scripts:', scripts.slice(0, 10));

  for (const scriptUrl of scripts.slice(0, 5)) {
    const sRes = await fetch(`https://skinid.vn/${scriptUrl}`);
    const sCode = await sRes.text();
    if (sCode.includes('ĐÃ THÔNG BÁO') || sCode.includes('online.gov.vn') || sCode.includes('BỘ CÔNG THƯƠNG')) {
      console.log(`🚨 FOUND BCT LOGO IN LIVE SCRIPT: ${scriptUrl}`);
    } else {
      console.log(`Clean script: ${scriptUrl}`);
    }
  }
}

checkLive().catch(console.error);
