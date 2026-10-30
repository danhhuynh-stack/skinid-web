import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Danh Huynh\\.gemini\\antigravity\\brain\\44304065-feec-49f5-aa53-d27d772e9e82';

const targets = [
  {
    name: 'visual_admin_system_vcb.png',
    url: 'http://localhost:5173/admin?preview=1&tab=system',
    delay: 5000,
    size: '1440,960'
  },
  {
    name: 'visual_admin_members_c360.png',
    url: 'http://localhost:5173/admin?preview=1&tab=members',
    delay: 5000,
    size: '1440,960'
  },
  {
    name: 'visual_admin_promotions.png',
    url: 'http://localhost:5173/admin?preview=1&tab=promotions',
    delay: 5000,
    size: '1440,960'
  },
  {
    name: 'visual_admin_cms.png',
    url: 'http://localhost:5173/admin?preview=1&tab=cms',
    delay: 5000,
    size: '1440,960'
  }
];

console.log('🚀 Chụp tiếp các tab chi tiết...');

for (const t of targets) {
  const destPath = path.join(outDir, t.name);
  console.log(`📸 Đang chụp: ${t.name}...`);
  const cmd = `"${chrome}" --headless=new --disable-gpu --disable-cache --incognito --window-size=${t.size} --virtual-time-budget=${t.delay} --screenshot="${destPath}" "${t.url}"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    const stat = fs.statSync(destPath);
    console.log(`✅ Thành công: ${t.name} (${Math.round(stat.size / 1024)} KB)`);
  } catch (err) {
    console.error(`❌ Lỗi chụp ${t.name}:`, err.message);
  }
}

console.log('🎉 Hoàn tất!');
