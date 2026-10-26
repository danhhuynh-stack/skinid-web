import { validateCoupon, setRemoteCoupons, getDynamicCoupons } from '../src/features/cart/services/couponService.js';
import fs from 'fs';

console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐƠN VỊ CÁC HOTFIX ĐÃ VÁ...');

// 1. Kiểm tra logic SKINID10
const res1_fail = validateCoupon('SKINID10', 300000);
if (res1_fail.valid !== false || !res1_fail.message.includes('500.000')) {
  throw new Error(`SKINID10 đơn 300k phải fail nhưng kết quả là: ${JSON.stringify(res1_fail)}`);
}
console.log('✅ 1. SKINID10 chặn đúng đơn dưới 500k.');

const res1_pass = validateCoupon('SKINID10', 600000);
if (res1_pass.valid !== true || res1_pass.discount !== 50000) {
  throw new Error(`SKINID10 đơn 600k phải giảm 50k (bị chặn trần maxDiscount 50k) nhưng được giảm: ${res1_pass.discount}`);
}
console.log('✅ 2. SKINID10 đơn 600k giảm đúng 50.000đ (chặn trần maxDiscount chuẩn chỉnh).');

// 2. Kiểm tra logic WELCOME50
const res2_fail = validateCoupon('WELCOME50', 250000);
if (res2_fail.valid !== false) throw new Error('WELCOME50 không chặn đơn dưới 350k');
const res2_pass = validateCoupon('WELCOME50', 400000);
if (res2_pass.valid !== true || res2_pass.discount !== 50000) throw new Error('WELCOME50 đơn 400k tính sai');
console.log('✅ 3. WELCOME50 kiểm tra minOrder 350k và giảm đúng 50.000đ.');

// 3. Kiểm tra logic FREESHIP
const res3_fail = validateCoupon('FREESHIP', 300000, 30000);
if (res3_fail.valid !== false) throw new Error('FREESHIP không chặn đơn dưới 500k');
const res3_pass = validateCoupon('FREESHIP', 550000, 30000);
if (res3_pass.valid !== true || res3_pass.discount !== 30000) throw new Error('FREESHIP đơn 550k tính sai');
console.log('✅ 4. FREESHIP kiểm tra minOrder 500k và miễn phí 30.000đ tiền ship.');

// 4. Kiểm tra nạp Voucher động mới tạo từ Admin
setRemoteCoupons([
  {
    code: 'CHUYENGIA100',
    type: 'fixed',
    discountValue: 100000,
    minOrderValue: 800000,
    description: 'Voucher chuyên gia giảm 100k'
  }
]);
const res4_remote = validateCoupon('CHUYENGIA100', 900000);
if (res4_remote.valid !== true || res4_remote.discount !== 100000) {
  throw new Error(`Voucher mới từ Firestore không áp dụng được: ${JSON.stringify(res4_remote)}`);
}
console.log('✅ 5. Voucher mới toanh tạo từ Admin Firestore (CHUYENGIA100) đã được nạp và áp dụng thành công!');

// 5. Kiểm tra ký tự font trong ProductCard.jsx
const pCard = fs.readFileSync('D:\\skinid-web-extracted\\src\\features\\catalog\\ProductCard.jsx', 'utf8');
if (pCard.includes('^\'') || !pCard.includes('-{discount}%')) {
  throw new Error('ProductCard.jsx vẫn còn ký tự rác!');
}
console.log('✅ 6. ProductCard.jsx sạch bóng ký tự rác, hiển thị chuẩn -{discount}%.');

// 6. Kiểm tra router.jsx có ScrollRestoration
const routerCode = fs.readFileSync('D:\\skinid-web-extracted\\src\\app\\router.jsx', 'utf8');
if (!routerCode.includes('ScrollRestoration') || !routerCode.includes('RootLayout')) {
  throw new Error('router.jsx chưa có RootLayout với ScrollRestoration!');
}
console.log('✅ 7. router.jsx đã bọc RootLayout và ScrollRestoration (xử lý dứt điểm kẹt scroll).');

// 7. Kiểm tra worker/index.js có Firestore getDocument cho Edge SEO
const workerCode = fs.readFileSync('D:\\skinid-web-extracted\\worker\\index.js', 'utf8');
if (!workerCode.includes('getDocument(env, `products/${rawId}`)') && !workerCode.includes('getDocument(env, `products/${pId}`)')) {
  throw new Error('worker/index.js chưa có Firestore lookup cho Edge SEO!');
}
console.log('✅ 8. Cloudflare Worker đã tích hợp Firestore REST lookup cho Edge Dynamic SEO sản phẩm mới.');

console.log('🎉 TẤT CẢ 8 BÀI TEST UNIT ĐỀU ĐẠT 100%!');
