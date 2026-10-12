export const firebaseConfig = Object.freeze({
  apiKey: 'AIzaSyBr1YHvfKvkWEv8Tcg-Mm7sS6_6-u9SBxg',
  authDomain: 'skinid-official.firebaseapp.com',
  projectId: 'skinid-official',
  storageBucket: 'skinid-official.firebasestorage.app',
  messagingSenderId: '313072494053',
  appId: '1:313072494053:web:d8a85bc893d797faacbb0c',
  measurementId: 'G-Q5KZ61ESN8'
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
