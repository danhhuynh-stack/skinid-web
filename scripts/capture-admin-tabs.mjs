import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), 'edge_admin_tabs_' + Date.now());
const artifactDir = 'C:/Users/Danh Huynh/.gemini/antigravity/brain/3c5400a0-641a-4be8-bda5-f85c70dbbba4';
const port = 9229;

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
    '--window-size=1480,1100',
    'http://localhost:5173/admin?preview=true&tab=dashboard'
  ]);

  edge.stderr.on('data', () => {});

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      targetTab = tabs.find(t => t.url && t.url.includes('admin') && t.webSocketDebuggerUrl);
      if (targetTab) break;
    } catch (e) {}
  }

  if (!targetTab) {
    console.error('Không tìm thấy tab admin 5173');
    edge.kill();
    process.exit(1);
  }

  console.log('2. Đã kết nối CDP WebSocket:', targetTab.title);
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

  async function takeShot(filename) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(artifactDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(res.data, 'base64'));
    console.log(`✓ Đã chụp và lưu: ${filename}`);
  }

  async function goToTab(tabKey, waitMs = 2500) {
    await sendCommand('Page.navigate', {
      url: `http://localhost:5173/admin?preview=true&tab=${tabKey}`
    });
    await new Promise(r => setTimeout(r, waitMs));
  }

  // 1. Tab Dashboard
  console.log('📸 [1/6] Tab Dashboard...');
  await new Promise(r => setTimeout(r, 3000));
  await takeShot('admin_visual_1_dashboard.png');

  // 2. Tab Orders
  console.log('📸 [2/6] Tab Orders...');
  await goToTab('orders');
  await takeShot('admin_visual_2_orders.png');

  // 3. Tab Products (All)
  console.log('📸 [3/6] Tab Products (All)...');
  await goToTab('products');
  await takeShot('admin_visual_3_products_all.png');

  // Lọc Serum
  console.log('📸 [3.1/6] Tab Products (Filter Serum)...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      const catBtn = Array.from(document.querySelectorAll('.segmented-item')).find(b => b.textContent.includes('Tinh chất'));
      if (catBtn) catBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  await takeShot('admin_visual_3_products_serum_filter.png');

  // 4. Tab Promotions
  console.log('📸 [4/6] Tab Promotions...');
  await goToTab('promotions');
  await takeShot('admin_visual_4_promotions.png');

  // 5. Tab Settings
  console.log('📸 [5/6] Tab Settings...');
  await goToTab('settings');
  await takeShot('admin_visual_5_settings.png');

  // 6. Tab System (Hạ tầng & Kết nối)
  console.log('📸 [6/6] Tab System...');
  await goToTab('system');
  await takeShot('admin_visual_6_system.png');

  console.log('🎉 Toàn bộ 6 Tabs đã được chụp độc lập và lưu thành công!');
  ws.close();
  edge.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Lỗi chụp màn hình:', err);
  process.exit(1);
});
