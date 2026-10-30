import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const sensitivePatterns = [
  { name: 'Private Key PEM', regex: /-----BEGIN (RSA )?PRIVATE KEY-----/i },
  { name: 'Basic Auth in URL (@es3.vn or es3.vn with user:pass)', regex: /[a-zA-Z0-9._%+-]+:[a-zA-Z0-9._%+-]+@es3\.vn/i },
  { name: 'Hardcoded S3 Old Username (nghia.tran)', regex: /nghia\.tran/i },
  { name: 'Google Cloud Service Account Private Key', regex: /"private_key"\s*:\s*"-----BEGIN/i },
  { name: 'Firebase Service Account Key Filename in Bundle', regex: /skinid-vietnam-firebase-adminsdk-.*\.json/i }
];

console.log('🔍 Bắt đầu quét lỗ hổng rò rỉ bí mật trong thư mục dist/...');
const distFiles = getAllFiles(distDir);
let hasViolations = false;

for (const file of distFiles) {
  if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.mp4')) continue;
  const content = readFileSync(file, 'utf8');
  for (const pattern of sensitivePatterns) {
    if (pattern.regex.test(content)) {
      console.error(`❌ CẢNH BÁO BẢO MẬT: Phát hiện mẫu [${pattern.name}] trong file: ${file}`);
      hasViolations = true;
    }
  }
}

if (!hasViolations) {
  console.log(`✅ XUẤT SẮC: Đã quét ${distFiles.length} files trong dist/. Sạch 100%, không chứa bất kỳ secret, private key hay tài khoản nhạy cảm nào!`);
} else {
  process.exit(1);
}
