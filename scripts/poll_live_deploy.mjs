async function checkLiveStatus() {
  console.log('Đang thăm dò trạng thái deploy trên https://skinid.vn...');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`https://skinid.vn/?t=${Date.now()}`, { cache: 'no-store' });
    const text = await res.text();
    const hasBCT = text.includes('online.gov.vn') || text.includes('ĐÃ THÔNG BÁO');
    console.log(`Lần ${i} (${new Date().toLocaleTimeString()}): ${hasBCT ? '⏳ Vẫn đang deploy (còn cache)' : '🎉 ĐÃ SẠCH 100% LOGO BCT TRÊN MẠNG INTERNET!'}`);
    if (!hasBCT) return true;
    await new Promise(r => setTimeout(r, 10000));
  }
  return false;
}
checkLiveStatus();
