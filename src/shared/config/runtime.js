export const firebaseConfig = Object.freeze({
  apiKey: 'AIzaSyBMnJ7Z1NYjARTXSdUNL9UWs8wodU6ddiE',
  authDomain: 'skinid-df273.firebaseapp.com',
  projectId: 'skinid-df273',
  storageBucket: 'skinid-df273.firebasestorage.app',
  messagingSenderId: '489776624763',
  appId: '1:489776624763:web:76f0e682e559c0448b1ede',
  measurementId: 'G-425CLMQ7YP'
});

export const runtimeConfig = Object.freeze({
  apiBaseUrl: '/api',
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
