import { hasNonFreeshipItems } from './checkoutService.js';

/**
 * Danh sách mã voucher hỗ trợ nội bộ SkinID.
 * Khi triển khai chiến dịch, có thể bổ sung hoặc cập nhật hạn mức tại đây.
 */
export const AVAILABLE_COUPONS = {
  WELCOME50: {
    code: 'WELCOME50',
    name: 'WELCOME50',
    description: 'Giảm 50.000₫ cho đơn từ 300.000₫',
    type: 'fixed',
    value: 50000,
    minOrder: 300000,
    tag: 'Tân thủ'
  },
  SKINID10: {
    code: 'SKINID10',
    name: 'SKINID10',
    description: 'Giảm 10% đơn hàng (Tối đa 150.000₫, đơn từ 200k)',
    type: 'percentage',
    value: 10,
    minOrder: 200000,
    maxDiscount: 150000,
    tag: 'Hot Deal'
  },
  FREESHIP: {
    code: 'FREESHIP',
    name: 'FREESHIP',
    description: 'Miễn phí vận chuyển 30.000₫ (Không áp dụng Combo)',
    type: 'shipping',
    value: 30000,
    minOrder: 0,
    tag: 'Vận chuyển'
  }
};

export function getDynamicCoupons() {
  const merged = { ...AVAILABLE_COUPONS };
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('skinid_admin_vouchers');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((v) => {
            if (!v?.code || v.active === false) return;
            const normalizedCode = String(v.code).trim().toUpperCase();
            merged[normalizedCode] = {
              code: normalizedCode,
              description: v.description || `Mã giảm giá ${normalizedCode}`,
              type: v.type === 'percent' || v.type === 'percentage' ? 'percentage' : v.type === 'shipping' ? 'shipping' : 'fixed',
              value: Number(v.discountValue || v.value) || 0,
              minOrder: Number(v.minOrderValue || v.minOrder) || 0,
              maxDiscount: Number(v.maxDiscount) || 0
            };
          });
        }
      }
    }
  } catch {}
  return merged;
}

/**
 * Lấy danh sách các mã voucher khả dụng để hiển thị gợi ý
 */
export function getAvailableCoupons() {
  return Object.values(AVAILABLE_COUPONS);
}

/**
 * Kiểm tra tính hợp lệ và tính số tiền giảm giá của mã voucher.
 * @param {string} rawCode - Mã voucher người dùng nhập
 * @param {number} subtotal - Tổng tiền hàng trước giảm
 * @param {number} shippingFee - Phí vận chuyển hiện tại
 * @param {Array} items - Danh sách sản phẩm trong giỏ
 * @returns {{ valid: boolean, code?: string, discount?: number, message: string, missingAmount?: number }}
 */
export function validateCoupon(rawCode, subtotal = 0, shippingFee = 0, items = []) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Vui lòng nhập mã giảm giá.' };
  }

  const allCoupons = getDynamicCoupons();
  const coupon = allCoupons[code];
  if (!coupon) {
    return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hiệu lực.' };
  }

  const numericSubtotal = Number(subtotal) || 0;

  // Kiểm tra điều kiện đơn hàng tối thiểu
  if (coupon.minOrder && numericSubtotal < coupon.minOrder) {
    const missing = coupon.minOrder - numericSubtotal;
    const formattedMin = new Intl.NumberFormat('vi-VN').format(coupon.minOrder);
    const formattedMissing = new Intl.NumberFormat('vi-VN').format(missing);
    return {
      valid: false,
      message: `Mã ${coupon.code} chỉ áp dụng cho đơn từ ${formattedMin}₫ (còn thiếu ${formattedMissing}₫).`,
      missingAmount: missing
    };
  }

  // Trường hợp mã FREESHIP nhưng đơn chứa Combo (không áp dụng freeship)
  if (coupon.type === 'shipping' && hasNonFreeshipItems(items)) {
    return {
      valid: false,
      message: `Mã FREESHIP không áp dụng cho đơn hàng có chứa Combo ưu đãi đặc biệt.`
    };
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    const rawDiscount = Math.round((numericSubtotal * coupon.value) / 100);
    discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, numericSubtotal);
  } else if (coupon.type === 'shipping') {
    discount = Math.min(coupon.value, Number(shippingFee) || 0);
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount,
    description: coupon.description,
    message: `Đã áp dụng mã ${coupon.code} thành công!`
  };
}
