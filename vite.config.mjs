import fs from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  const lines = content.split(/\r?\n/);
  let currentKey = null;
  let currentValue = '';
  let inMultiLine = false;

  for (const rawLine of lines) {
    if (!inMultiLine) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = rawLine.indexOf('=');
      if (idx > 0) {
        const key = rawLine.slice(0, idx).trim();
        let val = rawLine.slice(idx + 1).trim();
        if ((val.startsWith('"') && !val.endsWith('"')) || (val.startsWith("'") && !val.endsWith("'")) || val === '"' || val === "'") {
          inMultiLine = val[0];
          currentKey = key;
          currentValue = val.slice(1);
        } else {
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          result[key] = val;
        }
      }
    } else {
      if (rawLine.trim().endsWith(inMultiLine)) {
        currentValue += '\n' + rawLine.slice(0, rawLine.lastIndexOf(inMultiLine));
        result[currentKey] = currentValue;
        currentKey = null;
        currentValue = '';
        inMultiLine = false;
      } else {
        currentValue += '\n' + rawLine;
      }
    }
  }
  return result;
}

function loadDevVars() {
  const envFileVars = parseEnvFile(resolve(import.meta.dirname, '.env'));
  const devVars = parseEnvFile(resolve(import.meta.dirname, '.dev.vars'));
  const env = {
    ...process.env,
    ...envFileVars,
    ...devVars,
    IS_LOCAL_DEV: 'true',
    NODE_ENV: 'development'
  };

  const credPath = env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(credPath)) {
    try {
      const sa = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (sa.client_email && !env.FIREBASE_CLIENT_EMAIL) env.FIREBASE_CLIENT_EMAIL = sa.client_email;
      if (sa.private_key && !env.FIREBASE_PRIVATE_KEY) env.FIREBASE_PRIVATE_KEY = sa.private_key;
      if (sa.project_id && !env.FIREBASE_PROJECT_ID) env.FIREBASE_PROJECT_ID = sa.project_id;
    } catch {
      // Ignore invalid JSON
    }
  }

  return env;
}

/** Serve /videos/* and /images/* from src/assets/ in dev mode */
function staticAssetsDevPlugin() {
  return {
    name: 'static-assets-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];

        // 1. Serve videos
        if (pathname.startsWith('/videos/')) {
          const relativePath = pathname.slice('/videos/'.length);
          const filePath = resolve(import.meta.dirname, 'src/assets/videos', relativePath);
          if (!fs.existsSync(filePath)) return next();
          const ext = filePath.split('.').pop().toLowerCase();
          const mimeMap = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg' };
          const mime = mimeMap[ext] || 'application/octet-stream';
          const stat = fs.statSync(filePath);
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': end - start + 1,
              'Content-Type': mime,
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
          } else {
            res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
            fs.createReadStream(filePath).pipe(res);
          }
          return;
        }

        // 2. Serve images (supports direct paths, brand subfolders, and fallback search)
        if (pathname.startsWith('/images/')) {
          const relativePath = pathname.slice('/images/'.length);
          let filePath = resolve(import.meta.dirname, 'src/assets/images', relativePath);

          if (!fs.existsSync(filePath) && relativePath.startsWith('products/')) {
            const fileName = relativePath.slice('products/'.length);
            for (const brand of ['rilastil', 'dvah', 'twon']) {
              const candidate = resolve(import.meta.dirname, 'src/assets/images/products', brand, fileName);
              if (fs.existsSync(candidate)) {
                filePath = candidate;
                break;
              }
            }
          }

          if (!fs.existsSync(filePath)) return next();
          const ext = filePath.split('.').pop().toLowerCase();
          const mimeMap = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            avif: 'image/avif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            gif: 'image/gif'
          };
          const mime = mimeMap[ext] || 'application/octet-stream';
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': mime,
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=31536000'
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        return next();
      });
    }
  };
}


function workerApiDevPlugin() {
  return {
    name: 'worker-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (!pathname.startsWith('/api/')) return next();

        try {
          const env = loadDevVars();
          const host = req.headers.host || 'localhost:5173';
          const protocol = req.socket?.encrypted ? 'https' : 'http';
          const fullUrl = `${protocol}://${host}${req.url}`;
          
          const headers = new Headers();
          for (const [key, val] of Object.entries(req.headers)) {
            if (val !== undefined) {
              headers.set(key, Array.isArray(val) ? val.join(', ') : val);
            }
          }

          let body = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            body = Buffer.concat(chunks);
          }

          const webReq = new Request(fullUrl, {
            method: req.method,
            headers,
            body
          });

          const { default: worker } = await import('./worker/index.js');
          const webRes = await worker.fetch(webReq, env, {
            waitUntil() {},
            passThroughOnException() {}
          });

          res.statusCode = webRes.status;
          for (const [headerName, headerVal] of webRes.headers.entries()) {
            res.setHeader(headerName, headerVal);
          }
          const arrayBuffer = await webRes.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err) {
          console.error('[Worker Dev Middleware Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            code: 'internal_dev_error',
            message: err.message || 'Lỗi xử lý API trong môi trường phát triển.'
          }));
        }
      });
    }
  };
}

export default defineConfig({
  publicDir: false,
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime']
  },
  plugins: [
    staticAssetsDevPlugin(),
    workerApiDevPlugin(),
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'src/js', dest: '.' },
        { src: 'src/data', dest: '.' },
        // The app uses root-relative URLs such as /images/products/..., so keep
        // the deployed asset directory aligned with those URLs.
        { src: 'src/assets/images/**/*', dest: 'images', rename: { stripBase: 3 } },
        { src: 'src/assets/images/products/*/*', dest: 'images/products', rename: { stripBase: 5 } },
        { src: 'src/assets/images/banners/hero-scan-ai.jpg', dest: '.', rename: { stripBase: 4, name: 'og-image.jpg' } },
        // Video assets served at /videos/* in both dev and prod
        { src: 'src/assets/videos/*', dest: 'videos', rename: { stripBase: 3 } },
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@firebase/firestore')) return 'firebase-firestore';
          if (id.includes('node_modules/@firebase/auth')) return 'firebase-auth';
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase-core';
          return undefined;
        }
      }
    },
  }
});
