import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'index.source.html');
const targetPath = path.join(rootDir, 'index.html');

if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log('🔄 Restored index.html from index.source.html for Vite');
} else {
  console.warn('⚠️ index.source.html not found!');
}
