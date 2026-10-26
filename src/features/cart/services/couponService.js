/**
 * Danh sách mã voucher hỗ trợ nội bộ SkinID.
 * Điều kiện kiểm tra khớp 100% với hiển thị tại Trang Khuyến Mại.
 */
export const AVAILABLE_COUPONS = {
  SKINID10: {
    code: 'SKINID10',
    description: 'Giảm 10% tổng đơn hàng (Tối đa 150.000đ cho đơn từ 200.000đ)',
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

let inMemoryFirestoreCoupons = {};

export function setRemoteCoupons(remoteVouchers = []) {
  if (!Array.isArray(remoteVouchers)) return;
  const map = {};
  remoteVouchers.forEach(v => {
    if (!v?.code || v.active === false) return;
    const normalizedCode = String(v.code).trim().toUpperCase();
    map[normalizedCode] = {
      code: normalizedCode,
      description: v.description || `Mã ưu đãi ${normalizedCode}`,
      type: v.type === 'percent' || v.type === 'percentage' ? 'percentage' : v.type === 'shipping' ? 'shipping' : 'fixed',
      value: Number(v.discountValue || v.value) || 0,
      minOrder: Number(v.minOrderValue || v.minOrder) || 0,
      maxDiscount: Number(v.maxDiscount) || 0
    };
  });
  inMemoryFirestoreCoupons = map;
}

export function getDynamicCoupons() {
  const merged = { ...AVAILABLE_COUPONS, ...inMemoryFirestoreCoupons };
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

  const allCoupons = getDynamicCoupons();
  const coupon = allCoupons[code];
  if (!coupon) {
    return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
  }

  const numericSubtotal = Number(subtotal) || 0;
  if (coupon.minOrder && numericSubtotal < coupon.minOrder) {
    const formattedMin = new Intl.NumberFormat('vi-VN').format(coupon.minOrder);
    return {
      valid: false,
      message: `Mã ${coupon.code} chỉ áp dụng cho đơn hàng từ ${formattedMin} đ.`
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
