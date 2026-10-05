import { apiRequest } from '../../../infrastructure/http/apiClient.js';
import { firebaseServices } from '../../../infrastructure/firebase/index.js';

/**
 * Service to interact with the Skin Analysis Edge API (/api/analyze-skin) powered by Google Gemini.
 */

export async function fetchWeatherData() {
  try {
    const res = await fetch('https://wttr.in/?format=j1', { cache: 'no-store' });
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const current = data.current_condition?.[0];
    return {
      tempC: current?.temp_C || null,
      humidity: current?.humidity || null,
      uvIndex: current?.uvIndex || null,
      desc: current?.weatherDesc?.[0]?.value || ''
    };
  } catch {
    return { tempC: null, humidity: null, uvIndex: null, desc: '' };
  }
}

/**
 * Validates that the 3 angle images are provided.
 * @param {{ front?: string, left?: string, right?: string }} images
 */
export function validateCapturedImages(images = {}) {
  const missing = [];
  if (!images.front) missing.push('Chính diện');
  if (!images.left) missing.push('Góc nghiêng trái');
  if (!images.right) missing.push('Góc nghiêng phải');
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Submits captured 3-angle facial images to Cloudflare Worker API.
 * @param {{ images: { front: string, left: string, right: string }, skinType: string }} payload
 */
export async function analyzeSkin({ images, skinType = 'normal' }) {
  const normalizedImages = Array.isArray(images) ? images : [images.front, images.left, images.right];
  const validation = validateCapturedImages({
    front: normalizedImages[0], left: normalizedImages[1], right: normalizedImages[2]
  });
  if (!validation.isValid) {
    throw new Error(`Thiếu ảnh góc chụp: ${validation.missing.join(', ')}`);
  }

  const response = await apiRequest('/analyze-skin', {
    method: 'POST',
    body: JSON.stringify({ images: normalizedImages, skinType }),
    timeoutMs: 60000
  });
  return response?.analysis;
}

export async function saveSkinReport(reportData) {
  const userId = firebaseServices.auth.currentUser?.uid;
  if (!userId) throw new Error('Bạn cần đăng nhập để lưu báo cáo soi da.');
  const { addDoc, collection, serverTimestamp } = firebaseServices.sdk.firestore;
  const record = {
    dateFormatted: new Date().toLocaleString('vi-VN'),
    healthScore: Number(reportData.healthScore || 0),
    skinType: String(reportData.skinType || 'Da chưa xác định'),
    skinAge: Number(reportData.skinAge || 0),
    primaryConcerns: Array.isArray(reportData.primaryConcerns) ? reportData.primaryConcerns : [],
    overallGrade: String(reportData.overallGrade || 'B'),
    overallGradeComment: String(reportData.overallGradeComment || 'Làn da ở mức ổn định'),
    analysis3Angles: String(reportData.analysis3Angles || ''),
    metrics: reportData.metrics || {},
    fullAnalysis: reportData.fullAnalysis || null,
    recommendedRoutine: Array.isArray(reportData.recommendedRoutine) ? reportData.recommendedRoutine : [],
    recommendedRoutineProducts: Array.isArray(reportData.recommendedRoutineProducts) ? reportData.recommendedRoutineProducts : [],
    createdAt: serverTimestamp()
  };
  const reference = await addDoc(collection(firebaseServices.db, 'users', userId, 'skinReports'), record);
  document.dispatchEvent(new CustomEvent('skinid:history-changed'));
  return { id: reference.id, ...record, createdAt: new Date() };
}
