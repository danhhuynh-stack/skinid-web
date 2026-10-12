import { auth } from '../firebase/index.js';
import { runtimeConfig } from '../../shared/config/runtime.js';

const WORKER_FALLBACK_URL = 'https://skinid-web.hominhkhang01072005.workers.dev/api';

function createApiError(payload, status) {
  const message = payload?.message || (status === 404 ? 'Máy chủ xử lý đơn hàng đang chuyển hướng. Vui lòng thử lại.' : 'Không thể hoàn tất yêu cầu.');
  const error = new Error(message);
  error.code = payload?.code || `http_${status}`;
  error.status = status;
  return error;
}

export async function apiRequest(path, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    const error = new Error('Vui lòng đăng nhập trước khi tiếp tục.');
    error.code = 'unauthenticated';
    throw error;
  }

  const token = await user.getIdToken();
  const timeoutMs = Number(options.timeoutMs) || (path.includes('analyze') ? 60000 : 30000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const { timeoutMs: _ignored, headers, ...fetchOptions } = options;

  const baseUrls = [runtimeConfig.apiBaseUrl.replace(/\/$/, '')];
  if (!baseUrls[0].includes('workers.dev')) {
    baseUrls.push(WORKER_FALLBACK_URL);
  }

  try {
    let lastError = null;
    for (const baseUrl of baseUrls) {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(headers || {})
          }
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) return payload;
        if (response.status === 404 && baseUrls.indexOf(baseUrl) < baseUrls.length - 1) {
          continue;
        }
        throw createApiError(payload, response.status);
      } catch (err) {
        lastError = err;
        if (err?.name === 'AbortError') throw err;
        if (baseUrls.indexOf(baseUrl) < baseUrls.length - 1) continue;
        throw err;
      }
    }
    throw lastError;
  } catch (error) {
    if (error?.name !== 'AbortError') throw error;
    const timeoutError = new Error('Kết nối quá thời gian. Vui lòng thử lại.');
    timeoutError.code = 'request_timeout';
    throw timeoutError;
  } finally {
    clearTimeout(timeout);
  }
}
