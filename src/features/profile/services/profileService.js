import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import { apiRequest } from '../../../infrastructure/http/apiClient.js';
import { authService } from '../../auth/index.js';

function currentUserId() {
  const userId = firebaseServices.auth.currentUser?.uid;
  if (!userId) throw new Error('Vui lòng đăng nhập để quản lý hồ sơ.');
  return userId;
}

async function imageFileToDataUrl(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    throw new Error('Vui lòng chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 8MB.');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.getContext('2d').drawImage(
      image,
      (image.naturalWidth - size) / 2,
      (image.naturalHeight - size) / 2,
      size,
      size,
      0,
      0,
      256,
      256
    );
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function updateUserProfile(profileData) {
  return authService.updateUserProfile(currentUserId(), profileData);
}

export async function uploadAvatar(file) {
  const picture = typeof file === 'string' ? file : await imageFileToDataUrl(file);
  return authService.updateProfilePicture(currentUserId(), picture);
}

export async function fetchUserOrders() {
  return authService.fetchOrders(currentUserId());
}

export async function fetchUserSkinReports() {
  return authService.fetchHistory(currentUserId());
}

export function cancelUserOrder(orderId) {
  if (!orderId) throw new Error('Mã đơn hàng không hợp lệ.');
  currentUserId();
  return apiRequest(`/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: '{}' });
}

export function changeUserPassword(currentPassword, newPassword) {
  return authService.changePassword(currentPassword, newPassword);
}

export { exportUserPdfReport } from './profilePdfExport.js';

