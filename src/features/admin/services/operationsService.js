import { firebaseServices } from '../../../infrastructure/firebase/index.js';

const { db, sdk } = firebaseServices;

export async function logAuditEvent({ action, module, targetId, targetName, actorEmail, details }) {
  try {
    const { collection, addDoc, serverTimestamp } = sdk.firestore;
    await addDoc(collection(db, 'auditLogs'), {
      action,
      module: module || 'OPERATIONS',
      targetId: targetId || '',
      targetName: targetName || '',
      actorEmail: actorEmail || 'system',
      details: details || '',
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Audit Log] Failed to record event:', err.message);
  }
}

// ===============================================================
// 1. ORDER STATE MACHINE & DELIVERY OPERATIONS
// ===============================================================

export const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'cancelled'],
  packing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'delivery_failed'],
  delivered: ['completed', 'returned'],
  completed: [],
  delivery_failed: ['shipping', 'returned', 'cancelled'],
  returned: ['refunded'],
  refunded: [],
  cancelled: []
};

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  packing: 'Đang đóng gói',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  completed: 'Hoàn tất',
  delivery_failed: 'Giao thất bại',
  returned: 'Khách trả hàng',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy đơn'
};

export function canTransitionOrderStatus(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = ORDER_STATUS_FLOW[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function validateStatusTransition(currentStatus, nextStatus) {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    const allowed = ORDER_STATUS_FLOW[currentStatus] || [];
    const allowedText = allowed.length > 0 
      ? allowed.map((s) => ORDER_STATUS_LABELS[s] || s).join(', ')
      : 'Không thể chuyển tiếp';
    throw new Error(`Không thể chuyển trạng thái từ "${ORDER_STATUS_LABELS[currentStatus] || currentStatus}" sang "${ORDER_STATUS_LABELS[nextStatus] || nextStatus}". Các bước hợp lệ: ${allowedText}.`);
  }
}

/**
 * Sinh HTML phiếu giao hàng chuẩn A5 / A6 cho đơn hàng
 */
export function generateDeliveryNoteHtml(order) {
  if (!order) return '';
  const orderCode = order.id?.startsWith('#') ? order.id : `#${order.id || 'ORD'}`;
  const dateStr = order.createdAt?.seconds 
    ? new Date(order.createdAt.seconds * 1000).toLocaleString('vi-VN')
    : order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
  
  const customer = order.customer || {};
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ name: order.note || 'Combo chăm sóc da tiêu chuẩn', quantity: 1, price: order.total || 0 }];

  const money = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);

  const isPaid = order.paymentStatus === 'paid';
  const codAmount = isPaid ? 0 : (order.total || 0);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Phiếu Giao Hàng - ${orderCode}</title>
  <style>
    @page { size: A5 portrait; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      font-size: 11px;
      margin: 0;
      padding: 12px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #be185d;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .company-info {
      font-size: 9px;
      color: #475569;
      margin-top: 2px;
    }
    .order-badge {
      text-align: right;
    }
    .order-code {
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
    }
    .grid-parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .section-title {
      font-weight: bold;
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
      display: block;
    }
    .party-content p {
      margin: 2px 0;
    }
    .table-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .table-items th {
      background: #0f172a;
      color: #fff;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      padding: 6px 8px;
      border: 1px solid #0f172a;
    }
    .table-items td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .totals-box {
      margin-left: auto;
      width: 240px;
      margin-bottom: 12px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 10px;
    }
    .totals-row.grand-total {
      font-size: 12px;
      font-weight: bold;
      border-top: 1px solid #0f172a;
      padding-top: 4px;
      margin-top: 4px;
      color: #be185d;
    }
    .payment-notice {
      border: 1px dashed #be185d;
      background: #fff1f2;
      padding: 8px;
      border-radius: 6px;
      margin-bottom: 14px;
      text-align: center;
    }
    .payment-notice strong {
      font-size: 12px;
      color: #9f1239;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
    }
    .signature-title {
      font-weight: bold;
      font-size: 10px;
      text-transform: uppercase;
      color: #334155;
    }
    .signature-space {
      height: 45px;
    }
    .terms {
      font-size: 8px;
      color: #64748b;
      margin-top: 16px;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      text-align: center;
    }
    .print-actions {
      position: fixed;
      bottom: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
    }
    .btn-print {
      background: #be185d;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(190,24,93,0.3);
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">SkinID.vn — Mỹ Phẩm Chính Hãng</div>
      <div class="company-info">CÔNG TY TNHH FIELDMAN • MST: 0319200638 • Hotline: 0924 093 461</div>
      <div class="company-info">Địa chỉ: 175 Phan Chu Trinh, Phường 13, Bình Thạnh, TP. Hồ Chí Minh</div>
    </div>
    <div class="order-badge">
      <div class="order-code">${orderCode}</div>
      <div style="font-size: 9px; color: #64748b;">${dateStr}</div>
    </div>
  </div>

  <div class="grid-parties">
    <div class="party-content">
      <span class="section-title">Đơn vị gửi</span>
      <p><strong>KHO VẬN SKINID VIỆT NAM</strong></p>
      <p>Hotline hỗ trợ giao hàng: 0924 093 461</p>
      <p>Website: https://skinid.vn</p>
    </div>
    <div class="party-content">
      <span class="section-title">Người nhận hàng</span>
      <p><strong>${customer.name || 'Khách hàng SkinID'}</strong></p>
      <p>SĐT: <strong>${customer.phone || 'Chưa cung cấp'}</strong></p>
      <p>Địa chỉ: ${customer.address || 'Giao tại quầy'}</p>
    </div>
  </div>

  <table class="table-items">
    <thead>
      <tr>
        <th class="text-center" style="width: 25px;">STT</th>
        <th>Tên sản phẩm & Phân loại</th>
        <th class="text-center" style="width: 50px;">Số lượng</th>
        <th class="text-right" style="width: 80px;">Đơn giá</th>
        <th class="text-right" style="width: 90px;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${it.name || it.title || it.sku || 'Sản phẩm SkinID'}</strong>
            ${it.sku ? `<div style="font-size: 8px; color: #64748b; font-family: monospace;">SKU: ${it.sku}</div>` : ''}
          </td>
          <td class="text-center"><strong>${it.quantity || 1}</strong></td>
          <td class="text-right">${money(it.price || (order.total / (it.quantity || 1)))}</td>
          <td class="text-right font-bold">${money((it.price || (order.total / (it.quantity || 1))) * (it.quantity || 1))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="totals-row">
      <span>Tạm tính hàng hóa:</span>
      <span>${money(order.subtotal || order.total)}</span>
    </div>
    ${order.discount ? `
      <div class="totals-row" style="color: #be185d;">
        <span>Giảm giá (Voucher):</span>
        <span>-${money(order.discount)}</span>
      </div>
    ` : ''}
    <div class="totals-row">
      <span>Phí vận chuyển:</span>
      <span>${order.shippingFee ? money(order.shippingFee) : '0 ₫ (Freeship)'}</span>
    </div>
    <div class="totals-row grand-total">
      <span>TỔNG TIỀN ĐƠN HÀNG:</span>
      <span>${money(order.total)}</span>
    </div>
  </div>

  <div class="payment-notice">
    ${isPaid ? `
      <span style="color: #059669; font-weight: bold; font-size: 11px;">✓ ĐÃ THANH TOÁN CHUYỂN KHOẢN (VIETQR / THẺ)</span>
      <div style="font-size: 10px; color: #047857; margin-top: 2px;">Nhân viên giao nhận KHÔNG THU THÊM BẤT KỲ KHOẢN TIỀN NÀO.</div>
    ` : `
      <span style="color: #dc2626; font-size: 10px; font-weight: bold;">HÌNH THỨC THU TIỀN KHI NHẬN HÀNG (COD)</span>
      <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px;">
        SỐ TIỀN CẦN THU: ${money(codAmount)}
      </div>
    `}
  </div>

  <div class="signatures">
    <div>
      <div class="signature-title">Người giao hàng</div>
      <div style="font-size: 8px; color: #94a3b8;">(Ký và ghi rõ họ tên)</div>
      <div class="signature-space"></div>
    </div>
    <div>
      <div class="signature-title">Người nhận hàng</div>
      <div style="font-size: 8px; color: #94a3b8;">(Ký và ghi rõ họ tên)</div>
      <div class="signature-space"></div>
    </div>
  </div>

  <div class="terms">
    Quý khách vui lòng đồng kiểm ngoại quan sản phẩm trước khi nhận hàng. SkinID hỗ trợ đổi trả trong vòng 7 ngày đối với hàng hóa còn nguyên tem niêm phong. Mọi thắc mắc xin gọi hotline: 0924 093 461.
  </div>

  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ In Phiếu (A5)</button>
  </div>
</body>
</html>`;
}

/**
 * Xuất danh sách đơn hàng sang file XML Spreadsheet chuẩn Microsoft Excel
 * Tuân thủ tiêu chuẩn thiết kế corporate-spreadsheet-styling
 */
export function exportOrdersToExcelXml(orders = [], reportTitle = 'BÁO CÁO QUẢN TRỊ ĐƠN HÀNG SKINID.VN') {
  const now = new Date().toLocaleString('vi-VN');
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const escapeXml = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const moneyFormat = (val) => Number(val) || 0;

  const rowsXml = orders.map((ord, idx) => {
    const isZebra = idx % 2 === 1;
    const styleId = isZebra ? 'ZebraRow' : 'DataRow';
    const ordDate = ord.createdAt?.seconds 
      ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString('vi-VN')
      : ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : '';
    
    const customer = ord.customer || {};
    const itemsSummary = (ord.items || [])
      .map(it => `${it.quantity || 1}x ${it.name || it.title || it.sku}`)
      .join('; ') || (ord.note || 'Combo SkinID');

    const paymentLabel = ord.paymentStatus === 'paid' ? 'Đã thanh toán' : ord.paymentStatus === 'refunded' ? 'Hoàn tiền' : 'Chưa thanh toán';
    const statusLabel = ORDER_STATUS_LABELS[ord.status] || ord.status || 'Chờ xử lý';

    return `
      <Row ss:StyleID="${styleId}">
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(ord.id)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(ordDate)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Left"><Data ss:Type="String">${escapeXml(customer.name || 'Khách vãng lai')}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(customer.phone || '')}</Data></Cell>
        <Cell ss:StyleID="${styleId}Left"><Data ss:Type="String">${escapeXml(customer.address || '')}</Data></Cell>
        <Cell ss:StyleID="${styleId}Left"><Data ss:Type="String">${escapeXml(itemsSummary)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Currency"><Data ss:Type="Number">${moneyFormat(ord.total)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(paymentLabel)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(statusLabel)}</Data></Cell>
        <Cell ss:StyleID="${styleId}Center"><Data ss:Type="String">${escapeXml(ord.s3SyncStatus === 'synced' ? 'Đã đồng bộ S3' : ord.s3SyncStatus === 'failed' ? 'Lỗi S3' : 'Chờ đồng bộ')}</Data></Cell>
      </Row>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <!-- Tầng 1: Title Banner Navy -->
  <Style ss:ID="TitleBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1B365D"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="15" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1B365D" ss:Pattern="Solid"/>
  </Style>
  <!-- Tầng 2: Subtitle Metadata -->
  <Style ss:ID="SubBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F4E78" ss:Italic="1"/>
   <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
  </Style>
  <!-- Tầng 4: Header Row Deep Blue -->
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#203764" ss:Pattern="Solid"/>
  </Style>
  <!-- Tầng 5: Data Rows (White & Zebra Slate) -->
  <Style ss:ID="DataRowLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="DataRowCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="DataRowCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0 &quot;₫&quot;"/>
  </Style>
  <Style ss:ID="ZebraRowLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ZebraRowCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ZebraRowCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0 &quot;₫&quot;"/>
  </Style>
  <!-- Tầng 6: Summary Row Warm Gold -->
  <Style ss:ID="TotalSummary">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#B45309"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#92400E" ss:Bold="1"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0 &quot;₫&quot;"/>
  </Style>
  <Style ss:ID="TotalLabel">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B45309"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#B45309"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#92400E" ss:Bold="1"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="DanhSachDonHang">
  <Table ss:DefaultRowHeight="22">
   <Column ss:Width="35"/>  <!-- STT -->
   <Column ss:Width="110"/> <!-- Mã đơn -->
   <Column ss:Width="75"/>  <!-- Ngày đặt -->
   <Column ss:Width="130"/> <!-- Khách hàng -->
   <Column ss:Width="95"/>  <!-- SĐT -->
   <Column ss:Width="200"/> <!-- Địa chỉ -->
   <Column ss:Width="240"/> <!-- Sản phẩm -->
   <Column ss:Width="105"/> <!-- Tổng tiền -->
   <Column ss:Width="95"/>  <!-- Thanh toán -->
   <Column ss:Width="95"/>  <!-- Trạng thái -->
   <Column ss:Width="100"/> <!-- Đồng bộ S3 -->

   <!-- Tầng 1: Title -->
   <Row ss:Height="34">
    <Cell ss:MergeAcross="10" ss:StyleID="TitleBanner"><Data ss:Type="String">${escapeXml(reportTitle)}</Data></Cell>
   </Row>

   <!-- Tầng 2: Metadata -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="10" ss:StyleID="SubBanner"><Data ss:Type="String">Đơn vị: CÔNG TY TNHH FIELDMAN • Xuất lúc: ${escapeXml(now)} • Tổng đơn: ${orders.length} (Hợp lệ: ${validOrders.length})</Data></Cell>
   </Row>

   <!-- Tầng 3: Dòng đệm -->
   <Row ss:Height="8"/>

   <!-- Tầng 4: Header Row -->
   <Row ss:Height="28">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">STT</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mã Đơn</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ngày Đặt</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Khách Hàng</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số Điện Thoại</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Địa Chỉ Giao Hàng</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chi Tiết Sản Phẩm</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tổng Tiền (VNĐ)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Thanh Toán</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Trạng Thái Đơn</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Đồng Bộ S3 POS</Data></Cell>
   </Row>

   <!-- Tầng 5: Data Rows -->
   ${rowsXml}

   <!-- Tầng 6: Total Summary -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="TotalLabel"><Data ss:Type="String">TỔNG CỘNG DOANH THU (KHÔNG TÍNH ĐƠN HỦY):</Data></Cell>
    <Cell ss:StyleID="TotalSummary"><Data ss:Type="Number">${moneyFormat(totalRevenue)}</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TotalLabel"><Data ss:Type="String">${validOrders.length} ĐƠN THÀNH CÔNG</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
}

// ===============================================================
// 2. CUSTOMER 360 & SMART RFM SEGMENTATION
// ===============================================================

export const RFM_SEGMENTS = {
  VIP: { label: 'Khách hàng VIP', badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', desc: 'Chi tiêu cao (≥ 5 triệu) hoặc ≥ 5 đơn hàng' },
  RETURNING: { label: 'Khách quay lại', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold', desc: 'Có từ 2 đơn hàng thành công trở lên' },
  NEW: { label: 'Khách hàng mới', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium', desc: 'Có 1 đơn hàng hoặc mới đăng ký < 30 ngày' },
  PROSPECT: { label: 'Tiềm năng (Đã soi da)', badge: 'bg-rose-100 text-rose-900 border-rose-300 font-semibold', desc: 'Đã thực hiện soi da AI nhưng chưa đặt đơn' },
  AT_RISK: { label: 'Nguy cơ rời bỏ', badge: 'bg-slate-200 text-slate-700 border-slate-300 font-medium', desc: 'Đơn hàng gần nhất cách đây hơn 90 ngày' }
};

export function calculateCustomer360Metrics(user, allOrders = [], allSkinReports = []) {
  if (!user) return null;
  const userIdentifier = user.id || user.uid;
  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhone = (user.phone || '').replace(/[\s.-]/g, '');

  // Lọc đơn hàng của khách
  const userOrders = allOrders.filter(ord => {
    if (ord.userId && ord.userId === userIdentifier) return true;
    if (userEmail && ord.customer?.email && ord.customer.email.toLowerCase().trim() === userEmail) return true;
    if (userPhone && ord.customer?.phone && ord.customer.phone.replace(/[\s.-]/g, '') === userPhone) return true;
    return false;
  });

  const validOrders = userOrders.filter(o => o.status !== 'cancelled');
  const cancelledOrders = userOrders.filter(o => o.status === 'cancelled');

  const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const orderCount = validOrders.length;
  const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

  // Ngày mua cuối cùng
  let lastOrderDate = null;
  if (validOrders.length > 0) {
    const sorted = [...validOrders].sort((a, b) => {
      const getMs = (o) => (o.createdAt?.seconds ? o.createdAt.seconds * 1000 : new Date(o.createdAt || 0).getTime());
      return getMs(b) - getMs(a);
    });
    lastOrderDate = sorted[0].createdAt;
  }

  // Lọc lịch sử soi da AI
  const userReports = allSkinReports.filter(rep => {
    return rep.userId === userIdentifier || (userEmail && rep.email === userEmail);
  });

  // Phân nhóm RFM
  let rfmKey = 'NEW';
  const nowMs = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const lastOrderMs = lastOrderDate?.seconds 
    ? lastOrderDate.seconds * 1000 
    : lastOrderDate ? new Date(lastOrderDate).getTime() : 0;

  if (totalSpent >= 5000000 || orderCount >= 5) {
    rfmKey = 'VIP';
  } else if (orderCount >= 2) {
    if (lastOrderMs > 0 && (nowMs - lastOrderMs > ninetyDaysMs)) {
      rfmKey = 'AT_RISK';
    } else {
      rfmKey = 'RETURNING';
    }
  } else if (orderCount === 1) {
    if (lastOrderMs > 0 && (nowMs - lastOrderMs > ninetyDaysMs)) {
      rfmKey = 'AT_RISK';
    } else {
      rfmKey = 'NEW';
    }
  } else {
    // 0 đơn hàng
    if (userReports.length > 0) {
      rfmKey = 'PROSPECT';
    } else {
      rfmKey = 'NEW';
    }
  }

  return {
    user,
    orders: userOrders,
    validOrders,
    cancelledCount: cancelledOrders.length,
    skinReports: userReports,
    totalSpent,
    orderCount,
    avgOrderValue,
    lastOrderDate,
    rfmSegment: RFM_SEGMENTS[rfmKey] || RFM_SEGMENTS.NEW,
    rfmKey
  };
}

/**
 * Ẩn danh hóa thông tin cá nhân (Quyền được lãng quên - Luật BV DLCN 91/2025/QH15)
 * Bảo toàn 100% số tiền, mã đơn và sản phẩm để kế toán hạch toán
 */
export async function anonymizeCustomerAccount(userId, actor = {}) {
  if (!userId) throw new Error('Cần cung cấp mã người dùng.');
  const { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } = sdk.firestore;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('Không tìm thấy tài khoản người dùng.');

  const userData = snap.data();
  const anonymizedTag = `[Đã ẩn danh theo yêu cầu]`;

  // 1. Cập nhật hồ sơ người dùng
  await setDoc(userRef, {
    name: anonymizedTag,
    phone: '[Đã ẩn danh]',
    address: '[Đã ẩn danh]',
    picture: null,
    isAnonymized: true,
    anonymizedAt: serverTimestamp(),
    anonymizedBy: actor.email || 'Admin'
  }, { merge: true });

  // 2. Ẩn danh hóa thông tin trong các đơn hàng liên kết (BẢO TOÀN DOANH THU & SẢN PHẨM)
  try {
    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
    for (const ordDoc of ordersSnap.docs) {
      await setDoc(doc(db, 'orders', ordDoc.id), {
        customer: {
          name: anonymizedTag,
          phone: '[Đã ẩn danh]',
          address: '[Đã ẩn danh]'
        },
        anonymized: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[Anonymize] Orders update partial warning:', err.message);
  }

  // 3. Ghi vết Audit Log
  await logAuditEvent({
    action: 'ANONYMIZE_CUSTOMER',
    module: 'CRM_PRIVACY',
    targetId: userId,
    targetName: userData.name || userData.email,
    actorEmail: actor.email || 'Admin',
    details: 'Ẩn danh hóa PII người dùng theo Luật BV Dữ liệu cá nhân, giữ nguyên số liệu kế toán.'
  }).catch(() => {});

  return { success: true, message: 'Đã ẩn danh hóa tài khoản và bảo toàn số liệu đơn hàng.' };
}

// ===============================================================
// 3. SKIN AI PRIVACY & MEDICAL COMPLIANCE
// ===============================================================

export const DISCLAIMER_MEDICAL_NOTICE = 'Kết quả phân tích từ AI mang tính chất tham khảo chăm sóc sắc đẹp, không thay thế chẩn đoán hoặc phác đồ điều trị y khoa.';

/**
 * Kiểm tra quyền xem ảnh khuôn mặt soi da của nhân sự
 * Chỉ cho phép chuyên viên tư vấn, bác sĩ da liễu và ban quản trị
 */
export function canViewSkinReportImage(userRole) {
  if (!userRole) return false;
  const allowedRoles = ['super_admin', 'admin', 'consultant', 'dermatologist'];
  return allowedRoles.includes(userRole);
}

// ===============================================================
// 4. ADVANCED PROMOTIONS & BULK COUPON GENERATOR
// ===============================================================

export function generateBulkCoupons({
  count = 10,
  prefix = 'SKINID-',
  discountType = 'percent',
  discountValue = 10,
  minOrderValue = 300000,
  expiresAt = null,
  maxUses = 1
}) {
  const coupons = [];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  for (let i = 0; i < count; i++) {
    let rand = '';
    for (let c = 0; c < 6; c++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `${prefix.trim().toUpperCase()}${rand}`;
    coupons.push({
      code,
      discountType,
      discountValue: Number(discountValue) || 10,
      minOrderValue: Number(minOrderValue) || 0,
      maxUses: Number(maxUses) || 1,
      usedCount: 0,
      active: true,
      expiresAt: expiresAt || null,
      isBulkGenerated: true,
      createdAtIso: new Date().toISOString()
    });
  }
  return coupons;
}

// ===============================================================
// 5. HONEST DASHBOARD METRICS (KHÔNG DÙNG SỐ GIẢ)
// ===============================================================

export function calculateHonestDashboardMetrics(orders = [], users = [], timeRange = '30d') {
  const now = new Date();
  let daysLimit = 30;
  if (timeRange === 'today') daysLimit = 1;
  else if (timeRange === '7d') daysLimit = 7;
  else if (timeRange === 'all') daysLimit = 365;

  const cutoffTime = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000).getTime();

  const filteredOrders = orders.filter((o) => {
    if (daysLimit === 365) return true;
    const t = o.createdAt?.seconds 
      ? o.createdAt.seconds * 1000 
      : o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return t >= cutoffTime;
  });

  const validOrders = filteredOrders.filter(o => o.status !== 'cancelled' && o.paymentStatus !== 'refunded');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = validOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancellationRate = filteredOrders.length > 0 
    ? Math.round((cancelledOrders.length / filteredOrders.length) * 100) 
    : 0;

  // Biểu đồ theo ngày (7 ngày gần nhất)
  const chartDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

    let dayRevenue = 0;
    let dayCount = 0;

    for (const ord of validOrders) {
      const ordDate = ord.createdAt?.seconds 
        ? new Date(ord.createdAt.seconds * 1000)
        : ord.createdAt ? new Date(ord.createdAt) : null;
      if (ordDate && ordDate.getDate() === d.getDate() && ordDate.getMonth() === d.getMonth()) {
        dayRevenue += (Number(ord.total) || 0);
        dayCount += 1;
      }
    }

    chartDays.push({
      date: dateLabel,
      amount: dayRevenue,
      orders: dayCount
    });
  }

  return {
    revenue: totalRevenue,
    ordersCount: totalOrders,
    cancelledCount: cancelledOrders.length,
    cancellationRate,
    avgOrderValue,
    chartDays
  };
}

/**
 * Hàng chờ các việc vận hành cần làm gấp (Operations To-Do Queue)
 */
export function getOperationsTodoItems(orders = [], products = [], contacts = []) {
  const items = [];
  const now = Date.now();

  // 1. Đơn pending quá 2 tiếng
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const pendingOrders = orders.filter(o => {
    if (o.status !== 'pending') return false;
    const t = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : new Date(o.createdAt || 0).getTime();
    return (now - t) > twoHoursMs;
  });
  if (pendingOrders.length > 0) {
    items.push({
      type: 'warning',
      title: `${pendingOrders.length} đơn hàng chờ xác nhận quá 2 giờ`,
      desc: 'Cần liên hệ khách hàng xác nhận đơn hoặc duyệt giao gấp để kịp SLA.',
      actionTab: 'orders'
    });
  }

  // 2. Đơn lỗi đồng bộ S3 POS
  const s3FailedOrders = orders.filter(o => o.s3SyncStatus === 'failed');
  if (s3FailedOrders.length > 0) {
    items.push({
      type: 'error',
      title: `${s3FailedOrders.length} đơn hàng lỗi đồng bộ sang S3 POS`,
      desc: 'Dữ liệu kho và hóa đơn bán lẻ chưa vào phần mềm quản lý kho S3.',
      actionTab: 'orders'
    });
  }

  // 3. Sản phẩm sắp hết kho (stock <= 5)
  const lowStockProducts = products.filter(p => Number(p.stock) <= 5 && Number(p.stock) >= 0);
  if (lowStockProducts.length > 0) {
    items.push({
      type: 'warning',
      title: `${lowStockProducts.length} sản phẩm sắp hết hàng (tồn ≤ 5)`,
      desc: `Bao gồm: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}${lowStockProducts.length > 3 ? '...' : ''}.`,
      actionTab: 'products'
    });
  }

  return items;
}
