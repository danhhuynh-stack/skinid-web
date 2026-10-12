import { syncOrderToS3 } from '../worker/services/s3Service.js';

async function runLiveTest() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU TEST SỐNG ĐỒNG BỘ ĐƠN HÀNG SANG S3 POS 🚀');
  console.log('====================================================\n');

  const testOrder = {
    orderId: 'TEST_' + Date.now().toString().slice(-8),
    customer: {
      name: 'Nguyễn Thành Danh (Fieldman)',
      phone: '0901234567',
      address: '71 Trạng Trình, Phường 9, TP. Đà Lạt, Lâm Đồng'
    },
    items: [
      {
        sku: 'RILASTIL-D-CLAR',
        name: 'Serum Mờ Nám Rilastil D-Clar 30ml',
        quantity: 1,
        price: 1150000
      },
      {
        sku: 'DVAH-SARIKA',
        name: 'Nước Hoa DVAH Sarika 50ml',
        quantity: 1,
        price: 157000
      }
    ],
    subtotal: 1307000,
    discountAmount: 130700,
    couponCode: 'SKINID10',
    shippingFee: 0,
    total: 1176300,
    paymentMethod: 'bank_transfer', // Chuyển khoản Vietcombank
    note: 'Đơn test tự động từ SkinID sang S3 POS'
  };

  console.log('📦 1. Thông tin đơn hàng SkinID:');
  console.log(`   - Mã đơn SkinID: #${testOrder.orderId}`);
  console.log(`   - Khách hàng: ${testOrder.customer.name} (${testOrder.customer.phone})`);
  console.log(`   - Tổng tiền: ${testOrder.total.toLocaleString('vi-VN')} VND (Đã áp voucher SKINID10 -130.700đ)`);
  console.log(`   - Hình thức: Chuyển khoản Vietcombank (STK: 1063583549)\n`);

  console.log('⏳ 2. Đang kết nối tới API S3 (https://m.present.es3.vn)...');
  const startTime = Date.now();
  const result = await syncOrderToS3({
    orderId: testOrder.orderId,
    order: testOrder,
    env: {
      S3_BASE_URL: 'https://m.present.es3.vn',
      S3_USERNAME: 'fieldman@sb.es3.vn',
      S3_PASSWORD: 'hoZXttsmQVNxQ10k',
      S3_BRANCH_ID: 9147,
      S3_CASHIER_ID: 16668,
      S3_SYNC_ENABLED: true
    }
  });
  const duration = Date.now() - startTime;

  console.log(`\n🎉 3. KẾT QUẢ ĐỒNG BỘ (${duration}ms):`);
  console.log(`   - Trạng thái đồng bộ: ${result.success ? '🟢 THÀNH CÔNG (synced)' : '🔴 THẤT BẠI'}`);
  console.log(`   - Mã đơn S3 RequestId: ${result.s3OrderId}`);
  console.log(`   - Mã khách hàng tạo trên S3: ${result.s3CustomerId || 'Đã map'}`);
  console.log(`   - Phản hồi từ server S3:`, result.raw);

  console.log('\n====================================================');
  console.log('👉 HƯỚNG DẪN KIỂM TRA TRÊN WEB POS S3:');
  console.log('1. Vào web: https://present.es3.vn');
  console.log('2. Đăng nhập: fieldman@sb.es3.vn / hoZXttsmQVNxQ10k');
  console.log('3. Vào menu: "Bán hàng" -> "Đơn đặt hàng"');
  console.log(`4. Sẽ thấy đơn hàng "${testOrder.customer.name}" trị giá 1.176.300 VND nằm ngay đầu danh sách!`);
  console.log('====================================================\n');
}

runLiveTest();
