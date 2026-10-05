import { auth } from '../firebase/index.js';
import { runtimeConfig } from '../../shared/config/runtime.js';

function createApiError(payload, status) {
  const error = new Error(payload?.message || 'Không thể hoàn tất yêu cầu.');
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

  try {
    const response = await fetch(`${runtimeConfig.apiBaseUrl.replace(/\/$/, '')}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw createApiError(payload, response.status);
    return payload;
  } catch (error) {
    if (error?.name !== 'AbortError') throw error;
    const timeoutError = new Error('Kết nối quá thời gian. Vui lòng thử lại.');
    timeoutError.code = 'request_timeout';
    throw timeoutError;
  } finally {
    clearTimeout(timeout);
  }
}
