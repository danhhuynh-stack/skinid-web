import { detailedMetricNames } from './metricNames.js';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(value) || 0);
}

function formatDate(isoOrDateString) {
  if (!isoOrDateString) return new Date().toLocaleDateString('vi-VN');
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return String(isoOrDateString);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateReportHtml({ user = {}, history = [], orders = [] }) {
  const latestScan = history[0] || {};
  const healthScore = Math.min(100, Math.max(0, Number(latestScan.healthScore) || 75));
  const skinAge = latestScan.skinAge || 25;
  const skinType = latestScan.skinType || 'Da hỗn hợp';
  const grade = latestScan.overallGrade || (healthScore >= 75 ? 'A' : healthScore >= 60 ? 'B' : 'C');
  const gradeComment = latestScan.overallGradeComment || (grade === 'A'
    ? 'Làn da khỏe mạnh, cấu trúc ổn định'
    : grade === 'B' ? 'Làn da ở mức ổn định, cần duy trì chu trình' : 'Cần phác đồ phục hồi hàng rào bảo vệ');
  const assessment = latestScan.analysis3Angles || latestScan.fullAnalysis?.analysis3Angles || 'Chỉ số sức khỏe đạt mức ổn định. Khuyên dùng chu trình dưỡng ẩm và phục hồi chuyên sâu.';
  
  const rawMetrics = latestScan.metrics || {};
  const metricValues = [
    Number(rawMetrics.moisture) || 60,
    100 - (Number(rawMetrics.sebum) || 60),
    100 - (Number(rawMetrics.pores) || 60),
    100 - (Number(rawMetrics.pigmentation) || 50),
    100 - (Number(rawMetrics.melasma) || 45),
    Number(rawMetrics.elasticity) || 65,
    100 - (Number(rawMetrics.eyeWrinkles) || 40),
    100 - (Number(rawMetrics.nasolabialFolds) || 45),
    100 - (Number(rawMetrics.redness) || 40),
    100 - (Number(rawMetrics.acneBacteria) || 45),
    Number(rawMetrics.texture) || 65,
    100 - (Number(rawMetrics.darkCircles) || 45)
  ];

  const products = Array.isArray(latestScan.recommendedRoutineProducts) && latestScan.recommendedRoutineProducts.length
    ? latestScan.recommendedRoutineProducts
    : [];

  const userName = user.name || user.displayName || 'Khách hàng';
  const userEmail = user.email || 'Chưa cập nhật';
  const userPhone = user.phone || 'Chưa cập nhật';
  const userBirthday = user.birthday || 'Chưa cập nhật';
  const userGender = user.gender || 'Chưa cập nhật';
  const shipping = user.shippingAddress;
  const userAddress = shipping?.street
    ? `${shipping.street}, ${shipping.ward || ''}, ${shipping.district || ''}, ${shipping.province || ''}`
    : (user.address || 'Chưa cập nhật');

  const reportId = `SKN-${(user.id || user.uid || 'USER').slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const exportDateFormatted = formatDate(new Date());

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bao-cao-ho-so-SkinID-${userName.replace(/[^a-zA-Z0-9]/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #261F23;
      background: #FFFFFF;
      font-size: 13px;
      line-height: 1.5;
    }
    .no-print {
      position: sticky;
      top: 0;
      background: #2D1B23;
      color: #FFFFFF;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .no-print button {
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      border: 0;
      border-radius: 8px;
      padding: 8px 18px;
      transition: all 0.2s;
    }
    .btn-print {
      background: #E06D81;
      color: #FFFFFF;
    }
    .btn-print:hover {
      background: #C8526B;
    }
    .btn-close {
      background: rgba(255,255,255,0.15);
      color: #FFFFFF;
      margin-left: 8px;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
    .report-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 28px;
    }
    /* Header */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #E06D81;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #261F23;
      letter-spacing: -0.5px;
      margin: 0 0 4px;
    }
    .brand-title span {
      color: #E06D81;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #7A6F75;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #5D5257;
      line-height: 1.6;
    }
    .meta-box strong {
      color: #261F23;
    }
    .meta-badge {
      display: inline-block;
      background: #FFF0F3;
      color: #C8526B;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      border: 1px solid #FFD4DE;
      margin-top: 4px;
    }

    /* Section styling */
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #C8526B;
      border-left: 3px solid #E06D81;
      padding-left: 8px;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Profile grid */
    .profile-table {
      width: 100%;
      border-collapse: collapse;
      background: #FFFDFD;
      border: 1px solid #F0E4E7;
      border-radius: 8px;
      overflow: hidden;
      font-size: 12px;
    }
    .profile-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #F5ECEE;
    }
    .profile-table td.label {
      width: 22%;
      color: #7A6F75;
      font-weight: 600;
      background: #FFF8F9;
    }
    .profile-table td.value {
      width: 28%;
      color: #261F23;
      font-weight: 700;
    }

    /* Diagnostic highlight cards */
    .diagnostic-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .diag-card {
      background: #FFF9FA;
      border: 1px solid #FFE4EB;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .diag-card small {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      color: #8C7C83;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .diag-card strong {
      display: block;
      font-size: 20px;
      font-weight: 900;
      color: #C8526B;
    }
    .diag-card span {
      font-size: 11px;
      font-weight: 600;
      color: #382E33;
    }

    .assessment-box {
      background: #FFF5F7;
      border: 1px solid #FFDDE5;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 12px;
      color: #4A3E44;
      line-height: 1.6;
    }
    .assessment-box strong {
      color: #C8526B;
    }

    /* 12 Metrics grid */
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .metrics-table th {
      background: #FDF4F6;
      color: #8C4758;
      text-align: left;
      padding: 6px 10px;
      font-weight: 700;
      border-bottom: 1px solid #F0DCE2;
    }
    .metrics-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #F5EBEF;
    }
    .bar-bg {
      background: #F2EBEE;
      border-radius: 999px;
      height: 6px;
      width: 100%;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: #E06D81;
      border-radius: 999px;
    }

    /* Routine Steps */
    .routine-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .routine-box {
      border: 1px solid #F0DCE2;
      border-radius: 10px;
      padding: 12px;
      background: #FFFBFB;
    }
    .routine-box h4 {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #C8526B;
      border-bottom: 1px solid #FFE4EB;
      padding-bottom: 6px;
    }
    .step-item {
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.4;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-num {
      display: inline-block;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      background: #E06D81;
      color: #FFF;
      font-weight: 800;
      font-size: 9px;
      border-radius: 50%;
      margin-right: 6px;
    }
    .step-name {
      font-weight: 700;
      color: #2D1B23;
    }
    .step-desc {
      color: #7D7077;
      display: block;
      margin-left: 24px;
      font-size: 10.5px;
    }

    /* Products Table */
    .products-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 6px;
    }
    .products-table th {
      background: #FDF4F6;
      color: #8C4758;
      text-align: left;
      padding: 7px 10px;
      font-weight: 700;
      border-bottom: 1px solid #F0DCE2;
    }
    .products-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #F5EBEF;
      vertical-align: middle;
    }
    .products-table td.price {
      font-weight: 800;
      color: #C8526B;
      text-align: right;
    }

    /* Footer */
    .report-footer {
      margin-top: 26px;
      padding-top: 14px;
      border-top: 1px dashed #E0CBD1;
      font-size: 10.5px;
      color: #8A7D84;
      line-height: 1.6;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    .footer-stamp {
      border: 2px solid #E06D81;
      border-radius: 8px;
      padding: 6px 12px;
      text-align: center;
      color: #C8526B;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      background: #FFF8F9;
    }
  </style>
</head>
<body>

  <div class="no-print">
    <div>
      <strong>Xem Trước Báo Cáo Phân Tích Da SkinID</strong>
      <span style="font-size: 11px; opacity: 0.8; margin-left: 8px;">(Sử dụng chức năng In của trình duyệt để lưu tệp PDF chất lượng cao)</span>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">In Báo Cáo / Lưu PDF</button>
      <button class="btn-close" onclick="window.close()">Đóng</button>
    </div>
  </div>

  <div class="report-container">
    <!-- Header -->
    <header class="report-header">
      <div>
        <h1 class="brand-title">SkinID<span>.vn</span></h1>
        <div class="brand-subtitle">Hệ Thống Phân Tích Da Bằng Trí Tuệ Nhân Tạo & Dược Mỹ Phẩm Chính Hãng</div>
      </div>
      <div class="meta-box">
        <div>Mã hồ sơ: <strong>${reportId}</strong></div>
        <div>Ngày xuất: <strong>${exportDateFormatted}</strong></div>
        <div class="meta-badge">Xác thực chuẩn Nghị định 13/2023/NĐ-CP</div>
      </div>
    </header>

    <!-- 1. Thông Tin Khách Hàng -->
    <section class="section">
      <div class="section-title">1. Thông Tin Hồ Sơ Khách Hàng</div>
      <table class="profile-table">
        <tbody>
          <tr>
            <td class="label">Họ và tên</td>
            <td class="value">${userName}</td>
            <td class="label">Địa chỉ Email</td>
            <td class="value">${userEmail}</td>
          </tr>
          <tr>
            <td class="label">Số điện thoại</td>
            <td class="value">${userPhone}</td>
            <td class="label">Ngày sinh / Giới tính</td>
            <td class="value">${userBirthday} · ${userGender}</td>
          </tr>
          <tr>
            <td class="label">Địa chỉ giao hàng</td>
            <td class="value" colspan="3">${userAddress}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 2. Kết Quả Chẩn Đoán Làn Da Gần Nhất -->
    <section class="section">
      <div class="section-title">
        <span>2. Tổng Quan Chỉ Số Sức Khỏe Làn Da</span>
        <span style="font-size: 11px; text-transform: none; color: #8A7D84;">Phiên soi gần nhất (${formatDate(latestScan.timestamp || latestScan.dateFormatted)})</span>
      </div>

      <div class="diagnostic-cards">
        <div class="diag-card">
          <small>Điểm Sức Khỏe</small>
          <strong>${healthScore}/100</strong>
          <span>Xếp hạng: ${grade}</span>
        </div>
        <div class="diag-card">
          <small>Phân Loại Da</small>
          <strong style="font-size: 15px; padding-top: 4px;">${skinType}</strong>
          <span>Đánh giá AI</span>
        </div>
        <div class="diag-card">
          <small>Tuổi Da Sinh Học</small>
          <strong>${skinAge}</strong>
          <span>tuổi</span>
        </div>
        <div class="diag-card">
          <small>Tổng Phiên Đã Lưu</small>
          <strong>${history.length}</strong>
          <span>phiên theo dõi</span>
        </div>
      </div>

      <div class="assessment-box">
        <strong>Đánh giá khoa học từ AI 3 góc chụp: </strong>
        <span>${gradeComment}. ${assessment}</span>
      </div>
    </section>

    <!-- 3. Bảng 12 Chỉ Số Cấu Trúc Đa Tầng -->
    <section class="section">
      <div class="section-title">3. Đánh Giá 12 Chỉ Số Cấu Trúc Đa Tầng Của Làn Da</div>
      <table class="metrics-table">
        <thead>
          <tr>
            <th style="width: 25%;">Chỉ Số Cấu Trúc</th>
            <th style="width: 15%;">Điểm Số</th>
            <th style="width: 35%;">Thanh Đo Sinh Học</th>
            <th style="width: 25%;">Đánh Giá Tham Khảo</th>
          </tr>
        </thead>
        <tbody>
          ${detailedMetricNames.map((name, i) => {
            const val = metricValues[i] || 60;
            const status = val >= 75 ? 'Tốt · Khỏe mạnh' : val >= 55 ? 'Ổn định · Cần duy trì' : 'Cần phục hồi ưu tiên';
            const color = val >= 75 ? '#10B981' : val >= 55 ? '#F59E0B' : '#E11D48';
            return `<tr>
              <td><strong>${name}</strong></td>
              <td><span style="color: ${color}; font-weight: 800;">${val}/100</span></td>
              <td>
                <div class="bar-bg">
                  <div class="bar-fill" style="width: ${val}%; background: ${color};"></div>
                </div>
              </td>
              <td><span style="color: ${color}; font-weight: 600;">${status}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </section>

    <!-- 4. Phác Đồ Chăm Sóc Sáng & Tối -->
    <section class="section">
      <div class="section-title">4. Chu Trình Chăm Sóc Da Gợi Ý (Tham Khảo Chu Kỳ 28 Ngày)</div>
      <div class="routine-grid">
        <div class="routine-box">
          <h4>☀️ Buổi Sáng · Bảo Vệ & Cấp Ẩm</h4>
          <div class="step-item">
            <span class="step-num">1</span><span class="step-name">Làm sạch & Cân bằng pH</span>
            <span class="step-desc">Loại bỏ dầu thừa đêm qua, giữ màng ẩm tự nhiên mềm mịn.</span>
          </div>
          <div class="step-item">
            <span class="step-num">2</span><span class="step-name">Tinh chất chuyên sâu & Cấp ẩm</span>
            <span class="step-desc">Thẩm thấu sâu khắc phục vấn đề da hàng đầu (HA, Niacinamide).</span>
          </div>
          <div class="step-item">
            <span class="step-num">3</span><span class="step-name">Bảo vệ phổ rộng (SPF 50+)</span>
            <span class="step-desc">Ngăn ngừa tác hại tia UVA/UVB, ánh sáng xanh và gốc tự do.</span>
          </div>
        </div>

        <div class="routine-box">
          <h4>🌙 Buổi Tối · Phục Hồi & Tái Tạo</h4>
          <div class="step-item">
            <span class="step-num">1</span><span class="step-name">Làm sạch sâu & Tẩy trang</span>
            <span class="step-desc">Hút sạch bụi mịn PM2.5, bã nhờn và cặn kem chống nắng tích tụ.</span>
          </div>
          <div class="step-item">
            <span class="step-num">2</span><span class="step-name">Tinh chất phục hồi & Tái tạo</span>
            <span class="step-desc">Kích thích tái tạo tế bào biểu bì mới trong giấc ngủ.</span>
          </div>
          <div class="step-item">
            <span class="step-num">3</span><span class="step-name">Khóa ẩm & Màng Lipid</span>
            <span class="step-desc">Củng cố hàng rào ceramide, chống mất nước qua biểu bì.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Sản Phẩm Khuyên Dùng -->
    ${products.length ? `
    <section class="section">
      <div class="section-title">5. Danh Mục Dược Mỹ Phẩm Gợi Ý Cho Làn Da</div>
      <table class="products-table">
        <thead>
          <tr>
            <th style="width: 15%;">Hãng</th>
            <th style="width: 55%;">Tên Sản Phẩm</th>
            <th style="width: 15%;">Dung Tích</th>
            <th style="width: 15%; text-align: right;">Đơn Giá</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `<tr>
            <td><strong>${p.brand || 'Rilastil'}</strong></td>
            <td>${p.name || 'Sản phẩm gợi ý'}</td>
            <td>${p.volume || '--'}</td>
            <td class="price">${formatVnd(p.price)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>` : ''}

    <!-- 6. Lịch Sử Phiên Soi Da Gần Đây -->
    ${history.length > 1 ? `
    <section class="section">
      <div class="section-title">6. Lịch Sử Tiến Trình Các Phiên Soi Da</div>
      <table class="products-table">
        <thead>
          <tr>
            <th>Phiên</th>
            <th>Thời Gian</th>
            <th>Điểm Số</th>
            <th>Tuổi Da</th>
            <th>Phân Loại</th>
            <th>Đánh Giá</th>
          </tr>
        </thead>
        <tbody>
          ${history.slice(0, 5).map((scan, idx) => `<tr>
            <td><strong>#${history.length - idx}</strong></td>
            <td>${formatDate(scan.timestamp || scan.dateFormatted)}</td>
            <td><strong style="color: #C8526B;">${scan.healthScore || '--'}/100</strong></td>
            <td>${scan.skinAge ? scan.skinAge + ' tuổi' : '--'}</td>
            <td>${scan.skinType || 'Da hỗn hợp'}</td>
            <td>${scan.overallGradeComment || scan.overallGrade || 'Ổn định'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>` : ''}

    <!-- Footer -->
    <footer class="report-footer">
      <div>
        <div><strong>Hệ thống Phân tích Da & Dược Mỹ Phẩm SkinID.vn</strong></div>
        <div>Phân phối chính hãng Rilastil & TWON (Công ty TNHH FieldMan)</div>
        <div>Tư vấn Dược sĩ 1:1 qua Zalo: <strong>0924 093 461</strong> · Website: <strong>https://skinid.vn</strong></div>
        <div style="margin-top: 4px; font-size: 10px; color: #9A8E95;">* Lưu ý quan trọng: Kết quả phân tích từ AI mang tính chất khoa học tham khảo, không phải chẩn đoán y khoa và không thay thế phác đồ điều trị của bác sĩ da liễu.</div>
      </div>
      <div class="footer-stamp">
        <div>SkinID.vn</div>
        <div style="font-size: 8.5px; opacity: 0.85;">PHÂN TÍCH AI</div>
      </div>
    </footer>
  </div>

</body>
</html>`;
}

export function exportUserPdfReport({ user = {}, history = [], orders = [], scan = null } = {}) {
  const reportHistory = scan
    ? [scan]
    : (Array.isArray(history) ? history : []);
  const reportOrders = Array.isArray(orders) ? orders : [];
  const html = generateReportHtml({ user, history: reportHistory, orders: reportOrders });
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (err) {
        console.warn('[SkinID Print] print error:', err);
      }
    }, 500);
    return true;
  }

  // Fallback if popup is blocked
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow.print();
    } catch (err) {
      console.warn('[SkinID Print] iframe print error:', err);
    }
    setTimeout(() => iframe.remove(), 2500);
  }, 500);
  return true;
}
