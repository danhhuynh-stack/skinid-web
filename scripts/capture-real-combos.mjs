import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), 'edge_promo_' + Date.now());
const artifactDir = 'C:/Users/Danh Huynh/.gemini/antigravity/brain/3c5400a0-641a-4be8-bda5-f85c70dbbba4';
const port = 9226;

async function run() {
  console.log('1. Khởi động Edge Headless trên port', port);
  const edge = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-extensions',
    '--window-size=1440,1100',
    'http://localhost:5173/'
  ]);

  edge.stderr.on('data', () => {});

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      targetTab = tabs.find(t => t.url && t.url.includes('5173') && t.webSocketDebuggerUrl);
      if (targetTab) break;
    } catch (e) {}
  }

  if (!targetTab) {
    console.error('Không tìm thấy tab preview 5173');
    edge.kill();
    process.exit(1);
  }

  console.log('2. Đã kết nối tới tab:', targetTab.title);
  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Đợi page load
  await new Promise(r => setTimeout(r, 3000));

  // Cuộn xuống khu vực khuyến mãi
  console.log('3. Cuộn trang xuống khu vực combo khuyến mãi...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('khuyen-mai') || document.querySelector('.promo-campaign-section');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `
  });

  await new Promise(r => setTimeout(r, 2000));

  // Chụp ảnh khu vực combo
  console.log('4. Đang chụp ảnh màn hình nghiệm thu...');
  const screenshotRes = await sendCommand('Page.captureScreenshot', {
    format: 'png'
  });

  const outputPath = path.join(artifactDir, 'promo_real_combos_verified.png');
  fs.writeFileSync(outputPath, Buffer.from(screenshotRes.data, 'base64'));
  console.log('✓ Đã lưu ảnh chụp nghiệm thu:', outputPath);

  ws.close();
  edge.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Lỗi khi chụp màn hình:', err);
  process.exit(1);
});
