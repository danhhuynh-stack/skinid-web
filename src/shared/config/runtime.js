export const firebaseConfig = Object.freeze({
  apiKey: 'AIzaSyBMnJ7Z1NYjARTXSdUNL9UWs8wodU6ddiE',
  authDomain: 'skinid-df273.firebaseapp.com',
  projectId: 'skinid-df273',
  storageBucket: 'skinid-df273.firebasestorage.app',
  messagingSenderId: '489776624763',
  appId: '1:489776624763:web:76f0e682e559c0448b1ede',
  measurementId: 'G-425CLMQ7YP'
});

const CLOUDFLARE_WORKER_API_URL = 'https://skinid-web.hominhkhang01072005.workers.dev/api';

function resolveApiBaseUrl() {
  if (typeof window === 'undefined') return '/api';
  if (window.SKINID_CONFIG?.apiBaseUrl) return window.SKINID_CONFIG.apiBaseUrl;
  if (window.location.hostname.endsWith('workers.dev')) return '/api';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return '/api';
  return CLOUDFLARE_WORKER_API_URL;
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl: resolveApiBaseUrl(),
  firebase: firebaseConfig
});

export function installLegacyRuntimeConfig() {
  if (typeof window === 'undefined') return runtimeConfig;
  window.SKINID_CONFIG = Object.freeze({
    ...runtimeConfig,
    ...(window.SKINID_CONFIG || {})
  });
  return window.SKINID_CONFIG;
}
