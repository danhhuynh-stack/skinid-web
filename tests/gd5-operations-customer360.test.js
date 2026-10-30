import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORDER_STATUS_FLOW,
  canTransitionOrderStatus,
  validateStatusTransition,
  generateDeliveryNoteHtml,
  exportOrdersToExcelXml,
  calculateCustomer360Metrics,
  canViewSkinReportImage,
  generateBulkCoupons,
  calculateHonestDashboardMetrics,
  getOperationsTodoItems,
  DISCLAIMER_MEDICAL_NOTICE
} from '../src/features/admin/services/operationsService.js';

test('GD5: Order State Machine - Quản lý vòng đời đơn hàng & Chặn nhảy cóc', () => {
  // 1. Luồng chuyển trạng thái hợp lệ
  assert.equal(canTransitionOrderStatus('pending', 'confirmed'), true);
  assert.equal(canTransitionOrderStatus('confirmed', 'packing'), true);
  assert.equal(canTransitionOrderStatus('packing', 'shipping'), true);
  assert.equal(canTransitionOrderStatus('shipping', 'delivered'), true);
  assert.equal(canTransitionOrderStatus('delivered', 'completed'), true);
  assert.equal(canTransitionOrderStatus('delivered', 'returned'), true);
  assert.equal(canTransitionOrderStatus('returned', 'refunded'), true);

  // 2. Nhánh hủy hợp lệ
  assert.equal(canTransitionOrderStatus('pending', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('confirmed', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('packing', 'cancelled'), true);

  // 3. Chặn nhảy cóc bất hợp lệ
  assert.equal(canTransitionOrderStatus('pending', 'completed'), false);
  assert.equal(canTransitionOrderStatus('shipping', 'pending'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'completed'), false);
  assert.equal(canTransitionOrderStatus('completed', 'shipping'), false);

  assert.throws(
    () => validateStatusTransition('pending', 'completed'),
    /Không thể chuyển trạng thái/
  );
});

test('GD5: Phiếu giao hàng A5/A6 - Đầy đủ thông tin pháp nhân & Cam kết đồng kiểm', () => {
  const mockOrder = {
    id: 'ORD-987654',
    createdAt: { seconds: 1793330000 },
    customer: {
      name: 'Nguyễn Thị Thu Hà',
      phone: '0901234567',
      address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM'
    },
    items: [
      { name: 'Kem dưỡng ẩm phục hồi Rilastil Aqua', quantity: 2, price: 450000, sku: 'RIL-525' }
    ],
    subtotal: 900000,
    shippingFee: 0,
    discount: 50000,
    total: 850000,
    paymentStatus: 'paid'
  };

  const html = generateDeliveryNoteHtml(mockOrder);

  // Kiểm tra kích thước và quy chuẩn in
  assert.match(html, /@page \{ size: A5 portrait;/);
  // Thông tin pháp nhân Fieldman
  assert.match(html, /CÔNG TY TNHH FIELDMAN/);
  assert.match(html, /MST: 0319200638/);
  assert.match(html, /0924 093 461/);
  // Thông tin người nhận
  assert.match(html, /Nguyễn Thị Thu Hà/);
  assert.match(html, /0901234567/);
  assert.match(html, /72 Lê Thánh Tôn/);
  // Sản phẩm
  assert.match(html, /Kem dưỡng ẩm phục hồi Rilastil Aqua/);
  assert.match(html, /RIL-525/);
  // Cam kết
  assert.match(html, /đồng kiểm ngoại quan sản phẩm/);
  assert.match(html, /ĐÃ THANH TOÁN CHUYỂN KHOẢN/);
});

test('GD5: Xuất Excel chuẩn Executive Grade - Tuân thủ corporate-spreadsheet-styling', () => {
  const mockOrders = [
    {
      id: 'ORD-001',
      createdAt: { seconds: 1793330000 },
      customer: { name: 'Trần Văn A', phone: '0912345678', address: 'Hà Nội' },
      items: [{ name: 'Serum B5', quantity: 1 }],
      total: 650000,
      paymentStatus: 'paid',
      status: 'completed',
      s3SyncStatus: 'synced'
    },
    {
      id: 'ORD-002',
      createdAt: { seconds: 1793331000 },
      customer: { name: 'Lê Thị B', phone: '0987654321', address: 'Đà Nẵng' },
      items: [{ name: 'Sữa rửa mặt', quantity: 2 }],
      total: 500000,
      paymentStatus: 'unpaid',
      status: 'cancelled',
      s3SyncStatus: 'pending'
    }
  ];

  const xml = exportOrdersToExcelXml(mockOrders, 'BÁO CÁO THỬ NGHIỆM');

  // Kiểm tra 6 tầng bố cục corporate-spreadsheet-styling
  assert.match(xml, /TitleBanner/); // Tầng 1: Navy #1B365D
  assert.match(xml, /#1B365D/);
  assert.match(xml, /SubBanner/);   // Tầng 2: Ice Blue #D9E1F2
  assert.match(xml, /#D9E1F2/);
  assert.match(xml, /TableHeader/); // Tầng 4: Deep Blue #203764
  assert.match(xml, /#203764/);
  assert.match(xml, /ZebraRow/);    // Tầng 5: Zebra Striping #F8FAFC
  assert.match(xml, /TotalSummary/); // Tầng 6: Warm Gold #FEF3C7
  assert.match(xml, /#FEF3C7/);

  // Kiểm tra tính toán: Không tính đơn hủy ORD-002 (500k) vào tổng doanh thu
  // Tổng doanh thu phải là 650.000đ
  assert.match(xml, />650000</);
  assert.match(xml, /1 ĐƠN THÀNH CÔNG/);
});

test('GD5: Customer 360 & Phân nhóm Smart RFM - Phân loại chuẩn xác và loại trừ đơn hủy', () => {
  const mockUserVIP = { id: 'u1', name: 'Chị Lan', email: 'lan@gmail.com' };
  const mockOrdersVIP = [
    { userId: 'u1', total: 3000000, status: 'completed' },
    { userId: 'u1', total: 2500000, status: 'completed' },
    { userId: 'u1', total: 1000000, status: 'cancelled' } // Bị hủy, không tính vào LTV
  ];

  const vipMetrics = calculateCustomer360Metrics(mockUserVIP, mockOrdersVIP, []);
  assert.equal(vipMetrics.totalSpent, 5500000);
  assert.equal(vipMetrics.orderCount, 2);
  assert.equal(vipMetrics.cancelledCount, 1);
  assert.equal(vipMetrics.avgOrderValue, 2750000);
  assert.equal(vipMetrics.rfmKey, 'VIP');

  // Khách hàng Prospect (đã soi da nhưng 0 đơn)
  const mockUserProspect = { id: 'u2', name: 'Bạn Nam', email: 'nam@gmail.com' };
  const mockReportsProspect = [{ userId: 'u2', skinScore: 78, skinType: 'oily' }];
  const prospectMetrics = calculateCustomer360Metrics(mockUserProspect, [], mockReportsProspect);
  assert.equal(prospectMetrics.totalSpent, 0);
  assert.equal(prospectMetrics.orderCount, 0);
  assert.equal(prospectMetrics.rfmKey, 'PROSPECT');
});

test('GD5: Quyền xem ảnh soi da & Cảnh báo Y khoa - RBAC chặt chẽ cho ảnh nhạy cảm', () => {
  // Chỉ chuyên gia, tư vấn viên và admin được xem ảnh
  assert.equal(canViewSkinReportImage('super_admin'), true);
  assert.equal(canViewSkinReportImage('admin'), true);
  assert.equal(canViewSkinReportImage('consultant'), true);
  assert.equal(canViewSkinReportImage('dermatologist'), true);

  // Marketing, CSKH thường, kho vận, khách hàng bị chặn 100%
  assert.equal(canViewSkinReportImage('marketing'), false);
  assert.equal(canViewSkinReportImage('sales'), false);
  assert.equal(canViewSkinReportImage('warehouse'), false);
  assert.equal(canViewSkinReportImage('customer'), false);
  assert.equal(canViewSkinReportImage(''), false);

  assert.match(DISCLAIMER_MEDICAL_NOTICE, /không thay thế chẩn đoán/);
});

test('GD5: Sinh hàng loạt mã Voucher ngẫu nhiên - 100% duy nhất, single-use', () => {
  const bulk = generateBulkCoupons({
    count: 25,
    prefix: 'DEAL50-',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 250000,
    maxUses: 1
  });

  assert.equal(bulk.length, 25);
  const codesSet = new Set(bulk.map(c => c.code));
  assert.equal(codesSet.size, 25); // Không trùng lặp

  for (const c of bulk) {
    assert.match(c.code, /^DEAL50-[2-9A-Z]{6}$/);
    assert.equal(c.maxUses, 1);
    assert.equal(c.discountValue, 50000);
    assert.equal(c.active, true);
    assert.equal(c.isBulkGenerated, true);
  }
});

test('GD5: Dashboard trung thực - Không dùng số giả, khớp 100% S3 POS', () => {
  const mockOrders = [
    {
      id: 'o1',
      total: 1000000,
      status: 'completed',
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    },
    {
      id: 'o2',
      total: 500000,
      status: 'shipping',
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    },
    {
      id: 'o3',
      total: 2000000,
      status: 'cancelled', // Bị hủy
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    }
  ];

  const metrics = calculateHonestDashboardMetrics(mockOrders, [], '30d');

  // Doanh thu chỉ tính o1 (1tr) + o2 (500k) = 1.500.000đ. Đơn o3 (2tr) bị loại trừ hoàn toàn!
  assert.equal(metrics.revenue, 1500000);
  assert.equal(metrics.ordersCount, 2);
  assert.equal(metrics.cancelledCount, 1);
  assert.equal(metrics.cancellationRate, 33); // 1 / 3 = 33%
  assert.equal(metrics.avgOrderValue, 750000); // 1.500.000 / 2 = 750.000đ

  // Kiểm tra trường hợp 0 đơn hàng: Doanh thu là 0đ, không bịa ra 95-258 triệu mock data
  const emptyMetrics = calculateHonestDashboardMetrics([], [], '30d');
  assert.equal(emptyMetrics.revenue, 0);
  assert.equal(emptyMetrics.ordersCount, 0);
  assert.equal(emptyMetrics.cancelledCount, 0);
});

test('GD5: Operations To-Do Queue - Báo động kịp thời các đơn quá hạn & lỗi S3', () => {
  const now = Date.now();
  const mockOrders = [
    {
      id: 'o_old',
      status: 'pending',
      createdAt: { seconds: Math.floor((now - 3 * 3600 * 1000) / 1000) } // Quá 3 tiếng
    },
    {
      id: 'o_s3_err',
      status: 'confirmed',
      s3SyncStatus: 'failed',
      createdAt: { seconds: Math.floor(now / 1000) }
    }
  ];
  const mockProducts = [
    { id: 'p1', name: 'Serum B5', stock: 2 } // Tồn kho ≤ 5
  ];

  const todos = getOperationsTodoItems(mockOrders, mockProducts, []);
  assert.equal(todos.length, 3);
  assert.match(todos[0].title, /chờ xác nhận quá 2 giờ/);
  assert.match(todos[1].title, /lỗi đồng bộ sang S3 POS/);
  assert.match(todos[2].title, /sản phẩm sắp hết hàng/);
});
