import { execSync } from 'child_process';
import path from 'path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Danh Huynh\\.gemini\\antigravity\\brain\\44304065-feec-49f5-aa53-d27d772e9e82';
const destPath = path.join(outDir, 'visual_admin_cms.png');
const cmd = `"${chrome}" --headless=new --disable-gpu --disable-cache --incognito --window-size=1440,960 --virtual-time-budget=5000 --screenshot="${destPath}" "http://localhost:5173/admin?preview=1&tab=cms"`;

execSync(cmd, { stdio: 'inherit' });
console.log('CMS re-captured successfully!');
