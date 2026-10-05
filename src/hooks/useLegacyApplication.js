import { useEffect } from 'react';

const externalScripts = {
  home: [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
  ],
  analysis: [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
  ]
};

function loadScript(src, marker) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-skinid-script="${marker}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', resolve, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.dataset.skinidScript = marker;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function useLegacyApplication(page) {
  useEffect(() => {
    let active = true;

    (async () => {
      await loadScript('https://unpkg.com/feather-icons', 'feather');
      for (const [index, src] of (externalScripts[page] ?? []).entries()) {
        await loadScript(src, `${page}-${index}`);
      }
      if (!active || document.querySelector('script[data-skinid-bootstrap]')) return;
      await loadScript(`/src/js/app/bootstrap.js?page=${page}&v=react-vite-2`, 'bootstrap');
    })().catch(() => console.error('[SkinID] Không thể tải lớp tương thích nghiệp vụ.'));

    return () => {
      active = false;
    };
  }, [page]);
}
