export const firebaseConfig = Object.freeze({
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyAO6NL0qtQz0whIy75WoB9lJpJMqwMtfKg',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'skinid-vietnam.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'skinid-vietnam',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'skinid-vietnam.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '915066619862',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:915066619862:web:910237340c6509e51e4677',
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-JWWNEXFL94'
});

const CLOUDFLARE_WORKER_API_URL = import.meta.env?.VITE_WORKER_API_URL || 'https://skinid-web.fieldman-vn.workers.dev/api';

function resolveApiBaseUrl() {
  if (typeof window === 'undefined') return '/api';
  if (window.SKINID_CONFIG?.apiBaseUrl) return window.SKINID_CONFIG.apiBaseUrl;
  if (window.location.hostname.endsWith('workers.dev')) return '/api';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return '/api';
  if (window.location.hostname === 'skinid.vn' || window.location.hostname === 'www.skinid.vn') return '/api';
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
