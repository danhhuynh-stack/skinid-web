/**
 * Image Upload & Compression Service for Admin
 * Supports client-side compression and WebP conversion
 */

export async function compressAndProcessImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn một file hình ảnh hợp lệ (PNG, JPG, WEBP).');
  }

  // Max 5MB raw
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Dung lượng ảnh gốc không được vượt quá 5MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File ảnh bị lỗi hoặc không hỗ trợ.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP data url
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve({
          dataUrl: webpDataUrl,
          width,
          height,
          fileName: file.name.replace(/\.[^.]+$/, '.webp'),
          sizeEstimateBytes: Math.round((webpDataUrl.length * 3) / 4)
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
