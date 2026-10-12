/**
 * Danh sách mã voucher hỗ trợ nội bộ SkinID.
 * Khi triển khai chiến dịch, có thể bổ sung hoặc cập nhật hạn mức tại đây.
 */
export const AVAILABLE_COUPONS = {
  SKINID10: {
    code: 'SKINID10',
    description: 'Giảm 10% tổng đơn hàng',
    type: 'percentage',
    value: 10,
    minOrder: 200000,
    maxDiscount: 150000
  },
  WELCOME50: {
    code: 'WELCOME50',
    description: 'Giảm 50.000đ cho đơn từ 300.000đ',
    type: 'fixed',
    value: 50000,
    minOrder: 300000
  },
  FREESHIP: {
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển (Tối đa 30.000đ)',
    type: 'shipping',
    value: 30000,
    minOrder: 0
  }
};

/**
 * Kiểm tra tính hợp lệ và tính số tiền giảm giá của mã voucher.
 * @param {string} rawCode - Mã voucher người dùng nhập
 * @param {number} subtotal - Tổng tiền hàng trước giảm
 * @param {number} shippingFee - Phí vận chuyển hiện tại
 * @returns {{ valid: boolean, code?: string, discount?: number, message: string }}
 */
export function validateCoupon(rawCode, subtotal = 0, shippingFee = 0) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Vui lòng nhập mã giảm giá.' };
  }

  const coupon = AVAILABLE_COUPONS[code];
  if (!coupon) {
    return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
  }

  const numericSubtotal = Number(subtotal) || 0;
  if (coupon.minOrder && numericSubtotal < coupon.minOrder) {
    const formattedMin = new Intl.NumberFormat('vi-VN').format(coupon.minOrder);
    return {
      valid: false,
      message: `Mã ${coupon.code} chỉ áp dụng cho đơn hàng từ ${formattedMin} ₫.`
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
    discount,
    description: coupon.description,
    message: `Đã áp dụng mã ${coupon.code} thành công!`
  };
}
