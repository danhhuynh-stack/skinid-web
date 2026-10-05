import{r as e}from"./rolldown-runtime-hePW80VL.js";import{_ as t,a as n,c as r,d as i,f as a,l as o,o as s,s as c,t as l,u}from"./apiClient-CSX0qAlq.js";import{a as d,c as f,d as p,f as m,i as h,l as g,n as _,p as v,r as y,t as b}from"./app-D43yc_W4.js";import{a as x,n as S,r as C,t as w}from"./StorefrontModals-Dmzrawq5.js";import{t as ee}from"./usePageMetadata-Cmf2tgz6.js";import{t as T}from"./OfferBar-BqNJ_79b.js";var E=e(t()),D=[`Độ ẩm`,`Dầu thừa`,`Lỗ chân lông`,`Sắc tố UV`,`Sạm nám`,`Đàn hồi`,`Nhăn mắt`,`Rãnh cười`,`Đỏ da`,`Khuẩn mụn`,`Kết cấu`,`Quầng thâm`];function O(e){return new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0)}function k(e){if(!e)return new Date().toLocaleDateString(`vi-VN`);let t=new Date(e);return isNaN(t.getTime())?String(e):t.toLocaleDateString(`vi-VN`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`})}function A({user:e={},history:t=[],orders:n=[]}){let r=t[0]||{},i=Math.min(100,Math.max(0,Number(r.healthScore)||75)),a=r.skinAge||25,o=r.skinType||`Da hỗn hợp`,s=r.overallGrade||(i>=75?`A`:i>=60?`B`:`C`),c=r.overallGradeComment||(s===`A`?`Làn da khỏe mạnh, cấu trúc ổn định`:s===`B`?`Làn da ở mức ổn định, cần duy trì chu trình`:`Cần phác đồ phục hồi hàng rào bảo vệ`),l=r.analysis3Angles||r.fullAnalysis?.analysis3Angles||`Chỉ số sức khỏe đạt mức ổn định. Khuyên dùng chu trình dưỡng ẩm và phục hồi chuyên sâu.`,u=r.metrics||{},d=[Number(u.moisture)||60,100-(Number(u.sebum)||60),100-(Number(u.pores)||60),100-(Number(u.pigmentation)||50),100-(Number(u.melasma)||45),Number(u.elasticity)||65,100-(Number(u.eyeWrinkles)||40),100-(Number(u.nasolabialFolds)||45),100-(Number(u.redness)||40),100-(Number(u.acneBacteria)||45),Number(u.texture)||65,100-(Number(u.darkCircles)||45)],f=Array.isArray(r.recommendedRoutineProducts)&&r.recommendedRoutineProducts.length?r.recommendedRoutineProducts:[],p=e.name||e.displayName||`Khách hàng`,m=e.email||`Chưa cập nhật`,h=e.phone||`Chưa cập nhật`,g=e.birthday||`Chưa cập nhật`,_=e.gender||`Chưa cập nhật`,v=e.shippingAddress,y=v?.street?`${v.street}, ${v.ward||``}, ${v.district||``}, ${v.province||``}`:e.address||`Chưa cập nhật`,b=`SKN-${(e.id||e.uid||`USER`).slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,x=k(new Date);return`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bao-cao-ho-so-SkinID-${p.replace(/[^a-zA-Z0-9]/g,`_`)}</title>
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
        <div>Mã hồ sơ: <strong>${b}</strong></div>
        <div>Ngày xuất: <strong>${x}</strong></div>
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
            <td class="value">${p}</td>
            <td class="label">Địa chỉ Email</td>
            <td class="value">${m}</td>
          </tr>
          <tr>
            <td class="label">Số điện thoại</td>
            <td class="value">${h}</td>
            <td class="label">Ngày sinh / Giới tính</td>
            <td class="value">${g} · ${_}</td>
          </tr>
          <tr>
            <td class="label">Địa chỉ giao hàng</td>
            <td class="value" colspan="3">${y}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 2. Kết Quả Chẩn Đoán Làn Da Gần Nhất -->
    <section class="section">
      <div class="section-title">
        <span>2. Tổng Quan Chỉ Số Sức Khỏe Làn Da</span>
        <span style="font-size: 11px; text-transform: none; color: #8A7D84;">Phiên soi gần nhất (${k(r.timestamp||r.dateFormatted)})</span>
      </div>

      <div class="diagnostic-cards">
        <div class="diag-card">
          <small>Điểm Sức Khỏe</small>
          <strong>${i}/100</strong>
          <span>Xếp hạng: ${s}</span>
        </div>
        <div class="diag-card">
          <small>Phân Loại Da</small>
          <strong style="font-size: 15px; padding-top: 4px;">${o}</strong>
          <span>Đánh giá AI</span>
        </div>
        <div class="diag-card">
          <small>Tuổi Da Sinh Học</small>
          <strong>${a}</strong>
          <span>tuổi</span>
        </div>
        <div class="diag-card">
          <small>Tổng Phiên Đã Lưu</small>
          <strong>${t.length}</strong>
          <span>phiên theo dõi</span>
        </div>
      </div>

      <div class="assessment-box">
        <strong>Đánh giá khoa học từ AI 3 góc chụp: </strong>
        <span>${c}. ${l}</span>
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
          ${D.map((e,t)=>{let n=d[t]||60,r=n>=75?`Tốt · Khỏe mạnh`:n>=55?`Ổn định · Cần duy trì`:`Cần phục hồi ưu tiên`,i=n>=75?`#10B981`:n>=55?`#F59E0B`:`#E11D48`;return`<tr>
              <td><strong>${e}</strong></td>
              <td><span style="color: ${i}; font-weight: 800;">${n}/100</span></td>
              <td>
                <div class="bar-bg">
                  <div class="bar-fill" style="width: ${n}%; background: ${i};"></div>
                </div>
              </td>
              <td><span style="color: ${i}; font-weight: 600;">${r}</span></td>
            </tr>`}).join(``)}
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
    ${f.length?`
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
          ${f.map(e=>`<tr>
            <td><strong>${e.brand||`Rilastil`}</strong></td>
            <td>${e.name||`Sản phẩm gợi ý`}</td>
            <td>${e.volume||`--`}</td>
            <td class="price">${O(e.price)}</td>
          </tr>`).join(``)}
        </tbody>
      </table>
    </section>`:``}

    <!-- 6. Lịch Sử Phiên Soi Da Gần Đây -->
    ${t.length>1?`
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
          ${t.slice(0,5).map((e,n)=>`<tr>
            <td><strong>#${t.length-n}</strong></td>
            <td>${k(e.timestamp||e.dateFormatted)}</td>
            <td><strong style="color: #C8526B;">${e.healthScore||`--`}/100</strong></td>
            <td>${e.skinAge?e.skinAge+` tuổi`:`--`}</td>
            <td>${e.skinType||`Da hỗn hợp`}</td>
            <td>${e.overallGradeComment||e.overallGrade||`Ổn định`}</td>
          </tr>`).join(``)}
        </tbody>
      </table>
    </section>`:``}

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
</html>`}function j({user:e={},history:t=[],orders:n=[],scan:r=null}={}){let i=A({user:e,history:r?[r]:Array.isArray(t)?t:[],orders:Array.isArray(n)?n:[]}),a=window.open(``,`_blank`);if(a)return a.document.open(),a.document.write(i),a.document.close(),a.focus(),setTimeout(()=>{try{a.print()}catch(e){console.warn(`[SkinID Print] print error:`,e)}},500),!0;let o=document.createElement(`iframe`);o.style.position=`fixed`,o.style.right=`0`,o.style.bottom=`0`,o.style.width=`0`,o.style.height=`0`,o.style.border=`0`,document.body.appendChild(o);let s=o.contentWindow.document;return s.open(),s.write(i),s.close(),o.contentWindow.focus(),setTimeout(()=>{try{o.contentWindow.print()}catch(e){console.warn(`[SkinID Print] iframe print error:`,e)}setTimeout(()=>o.remove(),2500)},500),!0}function M(){let e=a.auth.currentUser?.uid;if(!e)throw Error(`Vui lòng đăng nhập để quản lý hồ sơ.`);return e}async function N(e){if(!e||![`image/jpeg`,`image/png`,`image/webp`].includes(e.type)||e.size>8388608)throw Error(`Vui lòng chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 8MB.`);let t=URL.createObjectURL(e);try{let e=new Image;e.src=t,await e.decode();let n=Math.min(e.naturalWidth,e.naturalHeight),r=document.createElement(`canvas`);return r.width=256,r.height=256,r.getContext(`2d`).drawImage(e,(e.naturalWidth-n)/2,(e.naturalHeight-n)/2,n,n,0,0,256,256),r.toDataURL(`image/jpeg`,.82)}finally{URL.revokeObjectURL(t)}}async function P(e){return i(M(),e)}async function te(e){let t=typeof e==`string`?e:await N(e);return u(M(),t)}async function ne(){return o(M())}async function re(){return r(M())}function ie(e){if(!e)throw Error(`Mã đơn hàng không hợp lệ.`);return M(),l(`/orders/${encodeURIComponent(e)}`,{method:`PATCH`,body:`{}`})}function ae(e,t){return c(e,t)}function oe(){let{user:e,history:t,orders:r,isAuthenticated:i,isLoading:a,logout:o,clearHistory:s,refreshSession:c}=n(),[l,u]=(0,E.useState)(!1),[d,f]=(0,E.useState)(null);return{user:e,history:t,orders:r,isAuthenticated:i,isLoading:a,isSaving:l,error:d,saveProfile:(0,E.useCallback)(async e=>{u(!0),f(null);try{let t=await P(e);return await c(),{success:!0,user:t}}catch(e){throw f(e.message||`Không thể lưu hồ sơ.`),e}finally{u(!1)}},[c]),changeAvatar:(0,E.useCallback)(async e=>{u(!0),f(null);try{let t=await te(e);return await c(),{success:!0,user:t}}catch(e){throw f(e.message||`Không thể cập nhật ảnh.`),e}finally{u(!1)}},[c]),updatePassword:(0,E.useCallback)(async(e,t)=>{u(!0),f(null);try{return await ae(e,t),{success:!0}}catch(e){throw f(e.message||`Không thể đổi mật khẩu.`),e}finally{u(!1)}},[]),downloadPdf:(0,E.useCallback)(()=>j({user:e,history:t,orders:r}),[e,t,r]),cancelOrder:(0,E.useCallback)(async e=>{u(!0),f(null);try{return await ie(e),await c(),{success:!0}}catch(e){throw f(e.message||`Không thể hủy đơn hàng.`),e}finally{u(!1)}},[c]),clearHistory:s,logout:o,fetchUserOrders:ne,fetchUserSkinReports:re}}var F=s();function I(e){return e<60?{score:`bg-gradient-to-br from-[#FF7893] to-[#BD3F5B] text-white shadow-[0_8px_20px_rgba(224,62,98,0.25)]`,chip:`bg-[#FFF2F4] text-[#BD3F5B]`}:e<75?{score:`bg-gradient-to-br from-[#FBBF24] to-[#D97706] text-white shadow-[0_8px_20px_rgba(217,119,6,0.22)]`,chip:`bg-[#FEF3C7] text-[#B45309]`}:{score:`bg-gradient-to-br from-[#34D399] to-[#059669] text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)]`,chip:`bg-[#ECFDF5] text-[#047857]`}}function L(e,t){document.dispatchEvent(new CustomEvent(`skinid:scan-detail-open`,{detail:{scanId:e,scanIndex:t}}))}function R({history:e=[]}){return e.length?(0,F.jsx)(`div`,{id:`timeline-scan-container`,className:`space-y-4`,children:e.map((t,n)=>{let r=Number(t.healthScore)||0,i=t.id??n,a=I(r),o=()=>L(i,n),s=e.length-n;return(0,F.jsxs)(`article`,{className:`profile-history-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer group`,onClick:o,onKeyDown:e=>{e.target===e.currentTarget&&(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),o())},role:`button`,tabIndex:0,"aria-label":`Mở chi tiết phiên soi da ${s}`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-5 min-w-0`,children:[(0,F.jsxs)(`div`,{className:`${a.score} w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 group-hover:scale-105 transition-transform duration-300`,children:[(0,F.jsx)(`span`,{className:`text-2xl leading-none font-black`,children:r}),(0,F.jsx)(`span`,{className:`text-[9px] font-extrabold tracking-widest uppercase opacity-90 mt-0.5`,children:`ĐIỂM`})]}),(0,F.jsxs)(`div`,{className:`min-w-0`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2 mb-1.5`,children:[(0,F.jsxs)(`h4`,{className:`font-extrabold text-[#282326] text-base group-hover:text-[#E06D81] transition-colors`,children:[`Phiên Soi Da #`,s]}),n===0&&(0,F.jsxs)(`span`,{className:`bg-[#FFF0F4] text-[#E06D81] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1`,children:[(0,F.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-[#E06D81]`}),`Mới nhất`]}),(0,F.jsx)(`span`,{className:`text-xs font-bold px-3 py-0.5 rounded-full ${a.chip}`,children:t.skinType||`Chưa xác định`})]}),(0,F.jsxs)(`p`,{className:`text-xs text-[#6F686B] flex items-center gap-2 flex-wrap`,children:[(0,F.jsx)(`span`,{children:t.dateFormatted||`Gần đây`}),(0,F.jsx)(`span`,{children:`·`}),(0,F.jsxs)(`span`,{children:[`Tuổi da AI: `,(0,F.jsxs)(`strong`,{className:`text-[#282326] font-bold`,children:[t.skinAge||`--`,` tuổi`]})]})]})]})]}),(0,F.jsxs)(`div`,{className:`action-group flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#F0ECEE] flex-shrink-0`,onClick:e=>e.stopPropagation(),children:[(0,F.jsxs)(`button`,{type:`button`,onClick:()=>j({scan:t}),className:`profile-action profile-action--quiet profile-action--compact`,title:`Xuất báo cáo PDF phiên này`,children:[(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5 text-[#E06D81]`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,F.jsx)(`path`,{d:`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z`}),(0,F.jsx)(`polyline`,{points:`14 2 14 8 20 8`})]}),(0,F.jsx)(`span`,{children:`Xuất PDF`})]}),(0,F.jsxs)(`a`,{href:`https://zalo.me/0924093461`,target:`_blank`,rel:`noreferrer`,className:`profile-action profile-action--consult profile-action--compact`,children:[(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,F.jsx)(`path`,{d:`M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z`}),(0,F.jsx)(`path`,{d:`M8 9h8M8 13h5`})]}),(0,F.jsx)(`span`,{children:`Tư vấn dược sĩ`})]}),(0,F.jsxs)(`button`,{type:`button`,onClick:o,className:`profile-action profile-action--primary profile-action--compact`,children:[(0,F.jsx)(`span`,{children:`Xem chi tiết`}),(0,F.jsx)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})]})]})]},t.id||`${t.dateFormatted||`scan`}-${n}`)})}):(0,F.jsx)(`div`,{id:`timeline-scan-container`,className:`space-y-4`,children:(0,F.jsxs)(`div`,{className:`text-center py-10 text-[#6F686B]`,children:[(0,F.jsxs)(`div`,{className:`profile-empty-illustration mx-auto`,"aria-hidden":`true`,children:[(0,F.jsx)(`span`,{className:`profile-empty-illustration__face`}),(0,F.jsx)(`span`,{className:`profile-empty-illustration__spark profile-empty-illustration__spark--one`,children:`✦`}),(0,F.jsx)(`span`,{className:`profile-empty-illustration__spark profile-empty-illustration__spark--two`,children:`✦`})]}),(0,F.jsx)(`p`,{className:`font-extrabold text-base text-[#282326] mt-4`,children:`Chưa có dữ liệu phiên soi da nào`}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed`,children:`Thực hiện soi da 3 góc với công nghệ AI thị giác để khám phá 12 chỉ số cấu trúc và routine dược mỹ phẩm cá nhân hóa.`}),(0,F.jsx)(`a`,{href:`/skin-analysis`,className:`profile-btn profile-btn--primary`,children:`Bắt đầu Soi Da AI Ngay`})]})})}var z=760,B=280,V={top:32,right:28,bottom:52,left:48};function H(e,t=0){let n=Number(e);return Number.isFinite(n)?n:t}function U(e,t,n){let r=z-V.left-V.right,i=B-V.top-V.bottom;return{x:n<=1?V.left+r/2:V.left+t/(n-1)*r,y:V.top+(1-Math.min(100,Math.max(0,e))/100)*i}}function W(e){return String(e||``).split(` `)[0]||`--/--`}function G({history:e}){if(!e.length)return(0,F.jsxs)(`div`,{className:`profile-empty-state`,children:[(0,F.jsxs)(`div`,{className:`profile-empty-illustration`,"aria-hidden":`true`,children:[(0,F.jsx)(`span`,{className:`profile-empty-illustration__face`}),(0,F.jsx)(`span`,{className:`profile-empty-illustration__spark profile-empty-illustration__spark--one`,children:`✦`}),(0,F.jsx)(`span`,{className:`profile-empty-illustration__spark profile-empty-illustration__spark--two`,children:`✦`})]}),(0,F.jsx)(`strong`,{children:`Hành trình làn da bắt đầu từ lần soi đầu tiên`}),(0,F.jsx)(`span`,{children:`Thực hiện phân tích để theo dõi thay đổi qua từng lần chăm sóc.`}),(0,F.jsx)(`a`,{href:`/skin-analysis`,className:`profile-btn profile-btn--primary`,children:`Bắt đầu soi da`})]});let t=[...e].reverse(),n=t.map((e,n)=>U(H(e.healthScore),n,t.length)),r=t.map((e,n)=>U(H(e.skinAge),n,t.length)),i=Math.max(1,Math.ceil(t.length/6)),a=B-V.bottom,o=[`${n[0].x},${a}`,...n.map(e=>`${e.x},${e.y}`),`${n[n.length-1].x},${a}`].join(` `);return(0,F.jsxs)(`div`,{className:`h-full w-full flex flex-col justify-between`,role:`img`,"aria-label":`Biểu đồ điểm sức khỏe da và tuổi da AI theo thời gian`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center gap-6 text-xs font-bold mb-3`,"aria-hidden":`true`,children:[(0,F.jsxs)(`span`,{className:`flex items-center gap-2 text-[#E06D81]`,children:[(0,F.jsx)(`span`,{className:`w-3 h-3 rounded-full bg-gradient-to-r from-[#FF7893] to-[#E06D81] shadow-[0_0_8px_rgba(224,109,129,0.5)]`}),`Điểm sức khỏe làn da (0 - 100)`]}),(0,F.jsxs)(`span`,{className:`flex items-center gap-2 text-[#282326]`,children:[(0,F.jsx)(`span`,{className:`w-5 border-t-2 border-dashed border-[#282326]`}),`Tuổi da ước tính AI`]})]}),(0,F.jsxs)(`svg`,{viewBox:`0 0 ${z} ${B}`,className:`w-full h-[calc(100%-36px)] overflow-visible`,"aria-hidden":`true`,children:[(0,F.jsxs)(`defs`,{children:[(0,F.jsxs)(`linearGradient`,{id:`scoreStrokeGrad`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,F.jsx)(`stop`,{offset:`0%`,stopColor:`#FF7893`}),(0,F.jsx)(`stop`,{offset:`50%`,stopColor:`#E06D81`}),(0,F.jsx)(`stop`,{offset:`100%`,stopColor:`#BD3F5B`})]}),(0,F.jsxs)(`linearGradient`,{id:`scoreAreaGrad`,x1:`0%`,y1:`0%`,x2:`0%`,y2:`100%`,children:[(0,F.jsx)(`stop`,{offset:`0%`,stopColor:`#E06D81`,stopOpacity:`0.22`}),(0,F.jsx)(`stop`,{offset:`100%`,stopColor:`#E06D81`,stopOpacity:`0.0`})]}),(0,F.jsx)(`filter`,{id:`scoreGlow`,x:`-20%`,y:`-20%`,width:`140%`,height:`140%`,children:(0,F.jsx)(`feDropShadow`,{dx:`0`,dy:`4`,stdDeviation:`4`,floodColor:`#E06D81`,floodOpacity:`0.25`})})]}),[0,25,50,75,100].map(e=>{let{y:t}=U(e,0,1);return(0,F.jsxs)(`g`,{children:[(0,F.jsx)(`line`,{x1:V.left,x2:z-V.right,y1:t,y2:t,stroke:`#F0ECEE`,strokeWidth:`1`,strokeDasharray:e===0?`none`:`4 4`}),(0,F.jsx)(`text`,{x:V.left-12,y:t+4,textAnchor:`end`,className:`fill-[#6F686B] text-[10px] font-semibold`,children:e})]},e)}),n.length>1&&(0,F.jsx)(`polygon`,{points:o,fill:`url(#scoreAreaGrad)`}),(0,F.jsx)(`polyline`,{points:n.map(({x:e,y:t})=>`${e},${t}`).join(` `),fill:`none`,stroke:`url(#scoreStrokeGrad)`,strokeWidth:`3.5`,strokeLinecap:`round`,strokeLinejoin:`round`,filter:`url(#scoreGlow)`}),(0,F.jsx)(`polyline`,{points:r.map(({x:e,y:t})=>`${e},${t}`).join(` `),fill:`none`,stroke:`#282326`,strokeWidth:`2`,strokeDasharray:`5 5`,strokeLinecap:`round`,strokeLinejoin:`round`}),n.map((e,n)=>(0,F.jsxs)(`g`,{className:`cursor-pointer group`,children:[(0,F.jsx)(`circle`,{cx:e.x,cy:e.y,r:`8`,fill:`#E06D81`,opacity:`0.15`}),(0,F.jsx)(`circle`,{cx:e.x,cy:e.y,r:`5`,fill:`#FFFFFF`,stroke:`#E06D81`,strokeWidth:`2.5`}),(n%i===0||n===t.length-1)&&(0,F.jsxs)(`text`,{x:e.x,y:264,textAnchor:`middle`,className:`fill-[#6F686B] text-[10px] font-bold`,children:[`Lần `,n+1,` · `,W(t[n].dateFormatted)]})]},t[n].id||n)),r.map((e,n)=>(0,F.jsx)(`circle`,{cx:e.x,cy:e.y,r:`3`,fill:`#282326`},`age-${t[n].id||n}`))]})]})}function K({history:e=[]}){let t=e[0],n=e.reduce((e,t)=>Math.max(e,H(t.healthScore)),0);return(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)(`div`,{className:`profile-stats mb-8`,children:[(0,F.jsxs)(`div`,{className:`profile-stat`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#BD3F5B] uppercase tracking-wider`,children:`Tổng Phiên Soi`}),(0,F.jsx)(`span`,{className:`w-8 h-8 rounded-full bg-[#FFF0F4] text-[#E06D81] flex items-center justify-center`,children:(0,F.jsx)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`path`,{d:`M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6`})})})]}),(0,F.jsx)(`h3`,{className:`text-3xl font-black text-[#282326] tracking-tight`,children:e.length}),(0,F.jsx)(`span`,{className:`text-[11px] text-[#6F686B] mt-1`,children:`Dữ liệu phân tích lưu trữ`})]}),(0,F.jsxs)(`div`,{className:`profile-stat`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#1B6CA8] uppercase tracking-wider`,children:`Điểm Cao Nhất`}),(0,F.jsx)(`span`,{className:`w-8 h-8 rounded-full bg-[#EEF7FF] text-[#1B6CA8] flex items-center justify-center`,children:(0,F.jsx)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`})})})]}),(0,F.jsxs)(`h3`,{className:`text-3xl font-black text-[#E06D81] tracking-tight`,children:[n,(0,F.jsx)(`span`,{className:`text-sm font-bold text-[#6F686B]`,children:`/100`})]}),(0,F.jsx)(`span`,{className:`text-[11px] text-[#6F686B] mt-1`,children:`Đỉnh cao phục hồi`})]}),(0,F.jsxs)(`div`,{className:`profile-stat`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#0D7A53] uppercase tracking-wider`,children:`Tuổi Da Gần Nhất`}),(0,F.jsx)(`span`,{className:`w-8 h-8 rounded-full bg-[#F0FAF5] text-[#0D7A53] flex items-center justify-center`,children:(0,F.jsx)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,F.jsx)(`path`,{d:`M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z`})})})]}),(0,F.jsx)(`h3`,{className:`text-3xl font-black text-[#0D7A53] tracking-tight`,children:t?.skinAge?`${t.skinAge} tuổi`:`--`}),(0,F.jsx)(`span`,{className:`text-[11px] text-[#6F686B] mt-1`,children:`Đo đạc từ thị giác máy tính`})]}),(0,F.jsxs)(`div`,{className:`profile-stat`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#B3630A] uppercase tracking-wider`,children:`Thể Trạng Da`}),(0,F.jsx)(`span`,{className:`w-8 h-8 rounded-full bg-[#FFF7ED] text-[#B3630A] flex items-center justify-center`,children:(0,F.jsxs)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,F.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,F.jsx)(`path`,{d:`M8 14s1.5 2 4 2 4-2 4-2`}),(0,F.jsx)(`line`,{x1:`9`,y1:`9`,x2:`9.01`,y2:`9`}),(0,F.jsx)(`line`,{x1:`15`,y1:`9`,x2:`15.01`,y2:`9`})]})})]}),(0,F.jsx)(`h3`,{className:`text-lg font-black text-[#282326] truncate tracking-tight`,children:t?.skinType||`Chưa soi da`}),(0,F.jsx)(`span`,{className:`text-[11px] text-[#6F686B] mt-1`,children:`Tình trạng ghi nhận phiên mới`})]})]}),(0,F.jsxs)(`div`,{className:`profile-surface p-7 sm:p-9 mb-8`,children:[(0,F.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F0ECEE]`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`h2`,{className:`text-xl font-extrabold text-[#282326] tracking-tight flex items-center gap-2`,children:[(0,F.jsx)(`span`,{className:`w-2.5 h-2.5 rounded-full bg-[#E06D81] shadow-[0_0_8px_rgba(224,109,129,0.5)]`}),`Biểu Đồ Tiến Trình Sức Khỏe Làn Da`]}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] mt-1`,children:`Quan sát nhịp độ thay đổi qua từng mốc thời gian để tối ưu hóa routine dưỡng chất.`})]}),(0,F.jsx)(`span`,{className:`self-start sm:self-auto text-xs font-bold text-[#BD3F5B] bg-[#FFF2F4] px-3.5 py-1 rounded-full`,children:`Dữ liệu tham khảo AI`})]}),(0,F.jsx)(`div`,{className:`profile-chart-area h-64 sm:h-72 w-full`,children:(0,F.jsx)(G,{history:e})})]})]})}var q={pending:{label:`Chờ xác nhận`,className:`bg-[#FEF3C7] text-[#92400E] border-0`},confirmed:{label:`Đã xác nhận`,className:`bg-[#CCFBF1] text-[#115E59] border-0`},shipping:{label:`Đang giao hàng`,className:`bg-[#DBEAFE] text-[#1E40AF] border-0`},delivered:{label:`Đã giao thành công`,className:`bg-[#D1FAE5] text-[#065F46] border-0`},completed:{label:`Hoàn tất`,className:`bg-[#D1FAE5] text-[#065F46] border-0`},cancelled:{label:`Đã hủy`,className:`bg-[#FEE2E2] text-[#991B1B] border-0`}},J=e=>new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0);function se(e,t){try{if(typeof e?.toDate==`function`)return e.toDate().toLocaleString(`vi-VN`);if(e instanceof Date)return e.toLocaleString(`vi-VN`);if(e?.seconds)return new Date(e.seconds*1e3).toLocaleString(`vi-VN`);if(e)return new Date(e).toLocaleString(`vi-VN`)}catch{return t||`Gần đây`}return t||`Gần đây`}function ce({item:e}){let t=f(e.productId),n=Number(e.quantity)||1,r=Number(e.price)||(Number(e.lineTotal)||0)/n,i=h(e.image||t?.image||`/images/products/placeholder.jpg`,t?.brandSlug);return(0,F.jsxs)(`div`,{className:`flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0 text-xs`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-3 min-w-0`,children:[(0,F.jsx)(`img`,{src:i,alt:e.name||t?.name||`Sản phẩm`,className:`w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 flex-shrink-0 border border-gray-100`,onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src=h(`/images/products/placeholder.jpg`)}}),(0,F.jsxs)(`div`,{className:`min-w-0`,children:[(0,F.jsx)(`p`,{className:`font-bold text-gray-800 truncate`,children:e.name||t?.name||`Sản phẩm`}),(0,F.jsxs)(`p`,{className:`text-gray-400 text-[11px]`,children:[`SL: `,n,` × `,J(r)]})]})]}),(0,F.jsx)(`strong`,{className:`text-gray-900 flex-shrink-0`,children:J(e.lineTotal||r*n)})]})}function le({order:e,onCancel:t,onReorder:n,cancellingId:r}){let[i,a]=(0,E.useState)(!1),o=q[e.status]||q.pending,s=[`pending`,`confirmed`].includes(e.status),c=e.customer||{},l=String(e.id||``).slice(0,8).toUpperCase(),u=r===e.id,d=e.items||[],f=d.reduce((e,t)=>e+(Number(t.quantity)||1),0);return(0,F.jsxs)(`article`,{className:`profile-order-card p-5 sm:p-6 space-y-4`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,F.jsxs)(`strong`,{className:`text-sm sm:text-base font-black text-gray-900`,children:[`#`,l]}),(0,F.jsx)(`span`,{className:`text-[11px] font-bold px-3 py-0.5 rounded-full border ${o.className}`,children:o.label})]}),(0,F.jsx)(`p`,{className:`text-xs text-gray-400 mt-0.5`,children:se(e.createdAt,e.dateFormatted)})]}),(0,F.jsxs)(`div`,{className:`text-right`,children:[(0,F.jsx)(`span`,{className:`text-[11px] text-gray-400 block`,children:`Tổng thanh toán`}),(0,F.jsx)(`span`,{className:`text-base sm:text-lg font-black text-brand-primary`,children:J(e.total||e.subtotal)})]})]}),(0,F.jsxs)(`div`,{className:`bg-gray-50/60 rounded-2xl p-3.5 space-y-2`,children:[(0,F.jsxs)(`p`,{className:`text-xs text-gray-600`,children:[(0,F.jsx)(`strong`,{children:c.name||`Khách hàng`}),c.phone?` (${c.phone})`:``,` — `,c.address||`Chưa có địa chỉ`]}),(0,F.jsxs)(`p`,{className:`text-[11px] text-gray-500`,children:[e.paymentMethod===`cod`?`COD (Thanh toán khi nhận hàng)`:`Chuyển khoản ngân hàng`,` ·`,` `,(0,F.jsx)(`span`,{className:e.paymentStatus===`paid`?`text-teal-600 font-bold`:`text-gray-500`,children:e.paymentStatus===`paid`?`Đã thanh toán`:`Chưa thanh toán`})]})]}),(0,F.jsxs)(`details`,{className:`profile-order-items`,children:[(0,F.jsxs)(`summary`,{children:[(0,F.jsxs)(`span`,{children:[(0,F.jsx)(`strong`,{children:`Mặt hàng trong đơn`}),(0,F.jsxs)(`small`,{children:[d.length,` mặt hàng · `,f,` sản phẩm`]})]}),(0,F.jsx)(`svg`,{"aria-hidden":`true`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,F.jsx)(`path`,{d:`m6 9 6 6 6-6`})})]}),(0,F.jsx)(`div`,{className:`profile-order-items__list`,children:d.length?d.map((e,t)=>(0,F.jsx)(ce,{item:e},`${e.productId||`item`}-${t}`)):(0,F.jsx)(`p`,{className:`text-xs text-gray-500 py-3`,children:`Chưa có thông tin mặt hàng.`})})]}),(0,F.jsxs)(`div`,{className:`pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3`,children:[(0,F.jsxs)(`span`,{className:`text-xs text-gray-400`,children:[`Phí vận chuyển: `,Number(e.shippingFee)===0?(0,F.jsx)(`strong`,{className:`text-teal-600`,children:`Miễn phí`}):J(e.shippingFee)]}),(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-end gap-2`,children:[(0,F.jsx)(`button`,{type:`button`,onClick:()=>n(e),className:`profile-action profile-action--primary`,children:`Mua lại`}),s&&!i&&(0,F.jsx)(`button`,{type:`button`,onClick:()=>a(!0),className:`profile-action profile-action--danger`,children:`Hủy đơn`}),s&&i&&(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(`button`,{type:`button`,onClick:()=>a(!1),disabled:u,className:`profile-action profile-action--quiet`,children:`Giữ đơn`}),(0,F.jsx)(`button`,{type:`button`,onClick:()=>t(e.id),disabled:u,className:`profile-action profile-action--danger`,children:u?`Đang hủy…`:`Xác nhận hủy`})]})]})]})]})}function ue({orders:e=[],isLoading:t=!1,onCancel:n}){let{addToCart:r,openCart:i}=d(),[a,o]=m(),[s]=(0,E.useState)(()=>a.get(`placed`)),[c,l]=(0,E.useState)(null),[u,f]=(0,E.useState)(``);(0,E.useEffect)(()=>{if(!s||!a.has(`placed`))return;let e=new URLSearchParams(a);e.delete(`placed`),e.set(`tab`,`orders`),o(e,{replace:!0})},[s,a,o]);let p=async e=>{l(e),f(``);try{await n(e)}catch(e){f(e.message||`Không thể hủy đơn hàng.`)}finally{l(null)}},h=e=>{for(let t of e.items||[])t.productId&&r(t.productId,Number(t.quantity)||1);i()};return t&&!e.length?(0,F.jsxs)(`div`,{className:`text-center py-10 text-gray-400`,children:[(0,F.jsx)(`div`,{className:`w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2`}),(0,F.jsx)(`p`,{className:`text-xs`,children:`Đang tải danh sách đơn hàng...`})]}):(0,F.jsxs)(`div`,{className:`space-y-4`,children:[s&&(0,F.jsx)(`div`,{className:`order-success-banner`,role:`status`,children:(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`strong`,{children:`Đặt hàng thành công`}),(0,F.jsxs)(`p`,{children:[`Mã đơn #`,s,` đã được tiếp nhận. SkinID sẽ sớm xác nhận với bạn.`]})]})}),u&&(0,F.jsx)(`div`,{role:`alert`,className:`rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700`,children:u}),e.length?e.map(e=>(0,F.jsx)(le,{order:e,onCancel:p,onReorder:h,cancellingId:c},e.id)):(0,F.jsxs)(`div`,{className:`profile-empty-panel text-center py-12 px-4`,children:[(0,F.jsx)(`div`,{className:`w-16 h-16 mx-auto mb-4 rounded-3xl bg-brand-blush/60 text-brand-primary flex items-center justify-center shadow-sm text-3xl`,"aria-hidden":`true`,children:`▣`}),(0,F.jsx)(`h4`,{className:`font-black text-gray-800 text-base mb-1`,children:`Chưa Có Đơn Hàng Nào`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-400 max-w-sm mx-auto mb-6`,children:`Bạn chưa thực hiện đơn đặt hàng nào tại SkinID. Khám phá các sản phẩm dược mỹ phẩm chính hãng ngay!`}),(0,F.jsx)(`a`,{href:`/products`,className:`profile-btn profile-btn--primary`,children:`Khám phá sản phẩm ngay →`})]})]})}var de=e(v());function fe(e={}){let t=Array.isArray(e.recommendedRoutineProducts)&&e.recommendedRoutineProducts.length?e.recommendedRoutineProducts.filter(Boolean):[];if(!t.length&&Array.isArray(e.recommendedRoutine)&&e.recommendedRoutine.length&&(t=e.recommendedRoutine.map(e=>g.find(t=>t.id===e)).filter(Boolean)),t.length<3){let n=String(e.skinType||``).toLowerCase(),r=n.includes(`dầu`)||n.includes(`mụn`)||n.includes(`nhờn`),i=n.includes(`khô`)||n.includes(`căng`),a=n.includes(`lão`)||n.includes(`nám`)||Number(e.skinAge)>=30,o=`rilastil-1774`,s=`rilastil-525`,c=`rilastil-1857`,l=`rilastil-2067`;r?(o=`rilastil-1805`,s=`rilastil-1831`,c=`rilastil-1856`,l=`rilastil-1528`):a?(o=`rilastil-2098`,s=`rilastil-2101`,c=`rilastil-1562`,l=`rilastil-1564`):i&&(o=`rilastil-1774`,s=`rilastil-525`,c=`rilastil-1860`,l=`rilastil-2067`),t=[o,s,c,l].map(e=>g.find(t=>t.id===e)||t.find(t=>t.id===e)).filter(Boolean)}let n=t[0]||g[0],r=t[1]||g[2],i=t[2]||t.find(e=>e.name?.toLowerCase().includes(`chống nắng`))||g[4],a=t[3]||t[t.length-1]||g[1],o=[{step:1,title:`Làm sạch & Cân bằng pH`,desc:`Loại bỏ dầu nhờn đêm qua, làm sạch dịu nhẹ và cân bằng màng ẩm tự nhiên.`,product:n},{step:2,title:`Tinh chất chuyên sâu & Cấp ẩm`,desc:`Thẩm thấu sâu vào tầng trung bì, phục hồi cấu trúc và cấp nước tế bào.`,product:r},{step:3,title:`Bảo vệ phổ rộng (SPF 50+)`,desc:`Ngăn ngừa tia UVA/UVB, ánh sáng xanh và chống oxy hóa bề mặt da.`,product:i}],s=[{step:1,title:`Làm sạch sâu & Tẩy trang`,desc:`Hút sạch bụi mịn PM2.5, bã nhờn và cặn kem chống nắng tích tụ cả ngày.`,product:n},{step:2,title:`Phục hồi chuyên sâu & Tái tạo`,desc:`Tăng sinh collagen, phục hồi hàng rào sinh học và tái tạo tế bào trong giấc ngủ.`,product:r},{step:3,title:`Khóa ẩm & Màng Lipid`,desc:`Củng cố màng lipid ceramide, khóa chặt dưỡng chất và chống mất nước xuyên biểu bì.`,product:a}];return{products:[...new Map([n,r,i,a].filter(Boolean).map(e=>[e.id,e])).values()],morningSteps:o,eveningSteps:s}}var pe={moisture:{name:`Độ ẩm bề mặt`,why:`Hàng rào lipid lớp sừng suy yếu làm nước bốc hơi nhanh, khiến da thô ráp và giảm độ căng mọng.`,shouldDo:`Ưu tiên Hyaluronic Acid, Panthenol và kem dưỡng giàu Ceramide để cấp và khóa ẩm.`,avoid:`Tránh nước quá nóng và chất làm sạch sulfate mạnh làm mất màng acid bảo vệ da.`},sebum:{name:`Mức bã nhờn`,why:`Tuyến bã nhờn có thể tăng hoạt động do thiếu nước bề mặt, hormone hoặc nhiệt độ môi trường.`,shouldDo:`Dùng Niacinamide 2–5%, BHA phù hợp và dưỡng ẩm dạng gel không gây bít tắc.`,avoid:`Tránh thấm dầu liên tục hoặc kem dưỡng quá nặng dễ gây phản ứng tiết dầu bù.`},pores:{name:`Kích thước lỗ chân lông`,why:`Bã nhờn và tế bào chết làm giãn miệng nang lông; collagen nâng đỡ cũng suy giảm theo thời gian.`,shouldDo:`Làm sạch kép buổi tối, BHA định kỳ và Peptide hỗ trợ độ săn chắc.`,avoid:`Không tự cạy nặn hoặc dùng gel lột mạnh gây tổn thương thành nang lông.`},pigmentation:{name:`Sắc tố & Sạm nám`,why:`Melanin tăng do tia UV hoặc tăng sắc tố sau viêm, làm màu da kém đồng đều.`,shouldDo:`Dùng chống nắng SPF 50+ và hoạt chất như Vitamin C, Tranexamic Acid hoặc Alpha Arbutin.`,avoid:`Tránh phơi nắng không che chắn và sản phẩm lột tẩy trắng cấp tốc.`},elasticity:{name:`Độ đàn hồi & Săn chắc`,why:`Collagen và Elastin suy giảm do tuổi tác, stress oxy hóa và tác hại của gốc tự do.`,shouldDo:`Cân nhắc Retinoid phù hợp vào buổi tối và Peptide hỗ trợ nguyên bào sợi.`,avoid:`Hạn chế thức khuya và chế độ ăn nhiều đường gây đường hóa collagen.`}},Y=e=>new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0);function X(e,t){let n=Number.parseInt(e,10);return Number.isFinite(n)?n:t}function me(e){let t=e.metrics||{},n=e.fullAnalysis||{},r=(e,r)=>X(t[e]??n[e],r),i=r(`moisture`,60),a=r(`sebum`,60),o=r(`pores`,60),s=r(`pigmentation`,50),c=r(`elasticity`,65),l=X(e.healthScore,70),u=i,d=Math.max(10,100-a),f=Math.max(10,100-o),p=Math.max(10,100-s),m=c;return{health:[u,d,f,p,r(`melasma`,Math.max(15,p-10)),m,r(`eyeWrinkles`,Math.round(m*.95)),r(`nasolabialFolds`,Math.round(m*.9)),r(`redness`,Math.round(u*.7+25)),r(`acneBacteria`,Math.round(d*.8+15)),r(`texture`,Math.round((u+f)/2)),r(`darkCircles`,Math.round((l+p)/2))].map(e=>Math.min(100,Math.max(0,e))),core:[{id:`moisture`,rawScore:i,healthScore:u},{id:`sebum`,rawScore:a,healthScore:d},{id:`pores`,rawScore:o,healthScore:f},{id:`pigmentation`,rawScore:s,healthScore:p},{id:`elasticity`,rawScore:c,healthScore:m}]}}function Z(e){return e>=75?{bar:`bg-emerald-500`,text:`text-emerald-600`,bg:`bg-emerald-50`,label:`Tốt`}:e>=60?{bar:`bg-teal-500`,text:`text-teal-600`,bg:`bg-teal-50`,label:`Khá`}:e>=40?{bar:`bg-amber-400`,text:`text-amber-600`,bg:`bg-amber-50`,label:`Cần chú ý`}:{bar:`bg-rose-500`,text:`text-rose-600`,bg:`bg-rose-50`,label:`Cần cải thiện`}}function he({values:e}){let t=(t,n=1)=>{let r=-Math.PI/2+t*(Math.PI*2/e.length);return[150+Math.cos(r)*94*n,150+Math.sin(r)*94*n]},n=n=>e.map((e,r)=>t(r,n).join(`,`)).join(` `),r=e.map((e,n)=>t(n,e/100).join(`,`)).join(` `);return(0,F.jsxs)(`svg`,{viewBox:`0 0 300 300`,className:`w-full h-full max-w-[340px] overflow-visible`,role:`img`,"aria-label":`Biểu đồ radar mười hai chỉ số cấu trúc da`,children:[(0,F.jsx)(`defs`,{children:(0,F.jsxs)(`radialGradient`,{id:`radarFill`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,F.jsx)(`stop`,{offset:`0%`,stopColor:`#E06D81`,stopOpacity:`0.32`}),(0,F.jsx)(`stop`,{offset:`100%`,stopColor:`#E06D81`,stopOpacity:`0.08`})]})}),[.25,.5,.75,1].map(e=>(0,F.jsx)(`polygon`,{points:n(e),fill:`none`,stroke:`#F0ECEE`,strokeWidth:`1`,strokeDasharray:`3 3`},e)),e.map((e,n)=>{let[r,i]=t(n);return(0,F.jsx)(`line`,{x1:150,y1:150,x2:r,y2:i,stroke:`#F0ECEE`,strokeWidth:`1`},D[n])}),(0,F.jsx)(`polygon`,{points:r,fill:`url(#radarFill)`,stroke:`#E06D81`,strokeWidth:`2.5`}),e.map((e,n)=>{let[r,i]=t(n,e/100),[a,o]=t(n,1.28);return(0,F.jsxs)(`g`,{children:[(0,F.jsx)(`circle`,{cx:r,cy:i,r:`3.5`,fill:`#E06D81`,stroke:`#FFFFFF`,strokeWidth:`2`}),(0,F.jsx)(`text`,{x:a,y:o+3,textAnchor:`middle`,className:`fill-[#6F686B] text-[8px] font-bold`,children:D[n]})]},`metric-${D[n]}`)})]})}function ge({scan:e}){let{addToCart:t,openCart:n}=d(),[r,i]=(0,E.useState)(`all`),[a,o]=(0,E.useState)(!1),{products:s,morningSteps:c,eveningSteps:l}=(0,E.useMemo)(()=>fe(e),[e]),u=e=>{e?.id&&(t(e.id,1),n())},f=()=>{s.forEach(e=>{e?.id&&t(e.id,1)}),o(!0),setTimeout(()=>o(!1),2e3),n()},p=s.reduce((e,t)=>e+(Number(t.price)||0),0);return(0,F.jsxs)(`section`,{className:`profile-report-section profile-report-routine p-6 sm:p-8 space-y-6`,children:[(0,F.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECEE]`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1`,children:`Cá nhân hóa phác đồ`}),(0,F.jsxs)(`h4`,{className:`font-extrabold text-[#282326] text-lg sm:text-xl flex flex-wrap items-center gap-2.5`,children:[(0,F.jsx)(`span`,{children:`Chu Trình Chăm Sóc Đề Xuất`}),(0,F.jsx)(`span`,{className:`text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full bg-[#FFF0F4] text-[#E06D81]`,children:`Tham khảo từ AI`})]}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] mt-1`,children:`Sáu bước sáng & tối được chọn lọc từ 12 chỉ số cấu trúc thực tế của phiên này.`})]}),(0,F.jsxs)(`div`,{className:`profile-routine-tabs flex items-center gap-1.5 self-start sm:self-auto`,role:`tablist`,"aria-label":`Lọc routine theo thời điểm`,children:[(0,F.jsx)(`button`,{type:`button`,onClick:()=>i(`all`),role:`tab`,"aria-selected":r===`all`,className:`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${r===`all`?`bg-white text-[#282326] shadow-xs`:`text-[#6F686B] hover:text-[#282326]`}`,children:`Tất cả`}),(0,F.jsx)(`button`,{type:`button`,onClick:()=>i(`morning`),role:`tab`,"aria-selected":r===`morning`,className:`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${r===`morning`?`bg-white text-[#C45E28] shadow-xs`:`text-[#6F686B] hover:text-[#C45E28]`}`,children:`☀ Sáng`}),(0,F.jsx)(`button`,{type:`button`,onClick:()=>i(`evening`),role:`tab`,"aria-selected":r===`evening`,className:`profile-routine-tab text-xs font-bold transition-all cursor-pointer ${r===`evening`?`bg-white text-[#8B3D59] shadow-xs`:`text-[#6F686B] hover:text-[#8B3D59]`}`,children:`☾ Tối`})]})]}),(0,F.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-6`,children:[(r===`all`||r===`morning`)&&(0,F.jsxs)(`div`,{className:`rounded-3xl p-5 sm:p-6 space-y-4 bg-gradient-to-br from-[#FFF9F6] via-[#FFFAF7] to-white border-0 shadow-[0_12px_32px_rgba(196,94,40,0.06)]`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between pb-3 border-b border-[#FFE2D1]/60`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,F.jsx)(`span`,{className:`w-7 h-7 rounded-full bg-[#FFEADF] text-[#C45E28] flex items-center justify-center text-xs font-bold`,children:`☀️`}),(0,F.jsx)(`h5`,{className:`font-extrabold text-[#C45E28] text-xs sm:text-sm uppercase tracking-wider`,children:`Buổi Sáng · Bảo Vệ & Cấp Ẩm`})]}),(0,F.jsx)(`span`,{className:`text-[11px] font-bold text-[#D17646] bg-[#FFF0E8] px-2.5 py-0.5 rounded-full`,children:`3 bước`})]}),(0,F.jsx)(`div`,{className:`space-y-3.5`,children:c.map(e=>(0,F.jsxs)(`div`,{className:`bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(52,35,41,0.04)] hover:shadow-[0_8px_24px_rgba(196,94,40,0.08)] transition-all`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2.5 mb-1.5`,children:[(0,F.jsx)(`span`,{className:`w-5 h-5 rounded-full bg-[#FFEAE0] text-[#C45E28] font-black text-[10px] flex items-center justify-center flex-shrink-0`,children:e.step}),(0,F.jsx)(`strong`,{className:`text-xs font-extrabold text-[#282326]`,children:e.title})]}),(0,F.jsx)(`p`,{className:`text-[11px] text-[#6F686B] mb-2.5 pl-7.5 leading-relaxed`,children:e.desc}),e.product&&(0,F.jsxs)(`div`,{className:`flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF9F7] ml-7.5 border-0`,children:[(0,F.jsx)(`img`,{src:h(e.product.image||`/images/products/placeholder.jpg`,e.product.brandSlug),alt:``,className:`w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-2xs flex-shrink-0`}),(0,F.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,F.jsx)(`span`,{className:`text-[9px] font-extrabold text-[#C45E28] uppercase tracking-wider`,children:e.product.brand||`Rilastil`}),(0,F.jsx)(`h6`,{className:`text-[11px] font-bold text-[#282326] truncate`,children:e.product.name}),(0,F.jsx)(`span`,{className:`text-xs font-black text-[#C45E28]`,children:Y(e.product.price)})]}),(0,F.jsx)(`button`,{type:`button`,onClick:()=>u(e.product),className:`profile-action profile-action--mini profile-action--morning flex-shrink-0`,children:`Thêm`})]})]},`m-${e.step}`))})]}),(r===`all`||r===`evening`)&&(0,F.jsxs)(`div`,{className:`rounded-3xl p-5 sm:p-6 space-y-4 bg-gradient-to-br from-[#FDF8FB] via-[#FCF5F8] to-white border-0 shadow-[0_12px_32px_rgba(139,61,89,0.06)]`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between pb-3 border-b border-[#F2D7E2]/60`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,F.jsx)(`span`,{className:`w-7 h-7 rounded-full bg-[#F9E6EE] text-[#8B3D59] flex items-center justify-center text-xs font-bold`,children:`🌙`}),(0,F.jsx)(`h5`,{className:`font-extrabold text-[#8B3D59] text-xs sm:text-sm uppercase tracking-wider`,children:`Buổi Tối · Phục Hồi & Tái Tạo`})]}),(0,F.jsx)(`span`,{className:`text-[11px] font-bold text-[#9D4D6B] bg-[#FAEDF3] px-2.5 py-0.5 rounded-full`,children:`3 bước`})]}),(0,F.jsx)(`div`,{className:`space-y-3.5`,children:l.map(e=>(0,F.jsxs)(`div`,{className:`bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(52,35,41,0.04)] hover:shadow-[0_8px_24px_rgba(139,61,89,0.08)] transition-all`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2.5 mb-1.5`,children:[(0,F.jsx)(`span`,{className:`w-5 h-5 rounded-full bg-[#FCE8F1] text-[#8B3D59] font-black text-[10px] flex items-center justify-center flex-shrink-0`,children:e.step}),(0,F.jsx)(`strong`,{className:`text-xs font-extrabold text-[#282326]`,children:e.title})]}),(0,F.jsx)(`p`,{className:`text-[11px] text-[#6F686B] mb-2.5 pl-7.5 leading-relaxed`,children:e.desc}),e.product&&(0,F.jsxs)(`div`,{className:`flex items-center gap-3 p-2.5 rounded-xl bg-[#FDF7FA] ml-7.5 border-0`,children:[(0,F.jsx)(`img`,{src:h(e.product.image||`/images/products/placeholder.jpg`,e.product.brandSlug),alt:``,className:`w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-2xs flex-shrink-0`}),(0,F.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,F.jsx)(`span`,{className:`text-[9px] font-extrabold text-[#8B3D59] uppercase tracking-wider`,children:e.product.brand||`Rilastil`}),(0,F.jsx)(`h6`,{className:`text-[11px] font-bold text-[#282326] truncate`,children:e.product.name}),(0,F.jsx)(`span`,{className:`text-xs font-black text-[#8B3D59]`,children:Y(e.product.price)})]}),(0,F.jsx)(`button`,{type:`button`,onClick:()=>u(e.product),className:`profile-action profile-action--mini profile-action--evening flex-shrink-0`,children:`Thêm`})]})]},`e-${e.step}`))})]})]}),(0,F.jsxs)(`div`,{className:`rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-br from-[#FFF1F4] via-[#FFF8F9] to-white shadow-[0_16px_40px_rgba(224,109,129,0.08)]`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1`,children:`Hiệu quả tái tạo rõ nét sau 28 ngày`}),(0,F.jsxs)(`h5`,{className:`font-extrabold text-base text-[#282326]`,children:[`Trọn bộ `,s.length,` sản phẩm theo phác đồ`]}),(0,F.jsxs)(`p`,{className:`text-xs text-[#6F686B] mt-0.5`,children:[`Tổng phác đồ: `,(0,F.jsx)(`strong`,{className:`text-base font-black text-[#E06D81]`,children:Y(p)})]})]}),(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 w-full sm:w-auto`,children:[(0,F.jsxs)(`button`,{type:`button`,onClick:f,className:`profile-action profile-action--primary profile-action--large w-full sm:w-auto`,children:[(0,F.jsxs)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,F.jsx)(`path`,{d:`M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z`}),(0,F.jsx)(`line`,{x1:`3`,y1:`6`,x2:`21`,y2:`6`}),(0,F.jsx)(`path`,{d:`M16 10a4 4 0 0 1-8 0`})]}),(0,F.jsx)(`span`,{children:a?`Đã thêm trọn bộ vào giỏ!`:`Thêm trọn bộ vào giỏ hàng`})]}),(0,F.jsxs)(`a`,{href:`https://zalo.me/0924093461`,target:`_blank`,rel:`noreferrer`,className:`profile-action profile-action--consult profile-action--large w-full sm:w-auto`,children:[(0,F.jsxs)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,F.jsx)(`path`,{d:`M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z`}),(0,F.jsx)(`path`,{d:`M8 9h8M8 13h5`})]}),(0,F.jsx)(`span`,{children:`Nhờ dược sĩ tư vấn`})]})]})]})]})}function _e({history:e=[]}){let[t,n]=(0,E.useState)(null),r=(0,E.useRef)(null),i=(0,E.useRef)(null),a=(0,E.useCallback)(()=>{n(null),requestAnimationFrame(()=>i.current?.focus?.())},[]);(0,E.useEffect)(()=>{let e=e=>{i.current=document.activeElement,n(e.detail||null)};return document.addEventListener(`skinid:scan-detail-open`,e),()=>document.removeEventListener(`skinid:scan-detail-open`,e)},[]);let o=(0,E.useMemo)(()=>{if(!t)return-1;let n=e.findIndex(e=>e.id!=null&&String(e.id)===String(t.scanId));return n>=0?n:Number(t.scanIndex)},[e,t]),s=o>=0?e[o]:null;if((0,E.useEffect)(()=>{if(!s)return;let e=document.body.style.overflow;document.body.style.overflow=`hidden`;let t=requestAnimationFrame(()=>r.current?.focus()),n=e=>{e.key===`Escape`&&a()};return document.addEventListener(`keydown`,n),()=>{cancelAnimationFrame(t),document.body.style.overflow=e,document.removeEventListener(`keydown`,n)}},[a,s]),!s)return null;let c=Math.min(100,Math.max(10,X(s.healthScore,70))),l=String(s.overallGrade||(c>=75?`A`:c>=60?`B`:`C`)).toUpperCase(),u=s.overallGradeComment||(l===`A`?`Làn da khỏe mạnh, cấu trúc ổn định`:l===`B`?`Làn da ở mức ổn định, cần duy trì chu trình`:`Cần phác đồ phục hồi hàng rào bảo vệ`),d=s.fullAnalysis||{},f=s.analysis3Angles||d.analysis3Angles||`Phân tích AI cho thấy chỉ số sức khỏe da đạt ${c}/100.`,p=me(s),m=D.map((e,t)=>({name:e,score:p.health[t]})).sort((e,t)=>e.score-t.score),h=Array.isArray(s.primaryConcerns)&&s.primaryConcerns.length?s.primaryConcerns:[`Niacinamide`,`Hyaluronic Acid`,`Ceramide`],g=c<60?`#E06D81`:c<75?`#F59E0B`:`#10B981`;return(0,de.createPortal)((0,F.jsx)(`div`,{className:`profile-report-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto`,onMouseDown:e=>{e.target===e.currentTarget&&a()},role:`dialog`,"aria-modal":`true`,"aria-labelledby":`scan-detail-title`,children:(0,F.jsxs)(`div`,{className:`profile-report-modal bg-white max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col my-auto skinid-enter`,children:[(0,F.jsxs)(`div`,{className:`profile-report-header sticky top-0 flex items-center justify-between z-20`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`span`,{className:`text-[10px] font-extrabold text-[#E06D81] uppercase tracking-wider block`,children:`Báo cáo soi da cá nhân`}),(0,F.jsxs)(`h3`,{id:`scan-detail-title`,className:`font-extrabold text-[#282326] text-base sm:text-lg`,children:[`Phiên Soi Da #`,e.length-o]}),(0,F.jsxs)(`p`,{className:`text-xs text-[#6F686B]`,children:[`Thời gian: `,s.dateFormatted||`Vừa xong`]})]}),(0,F.jsx)(`button`,{ref:r,type:`button`,onClick:a,className:`profile-report-close`,"aria-label":`Đóng`,children:(0,F.jsx)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,children:(0,F.jsx)(`path`,{d:`M6 6l12 12M18 6L6 18`})})})]}),(0,F.jsxs)(`div`,{className:`p-6 space-y-6 flex-grow`,children:[(0,F.jsxs)(`div`,{className:`profile-report-summary p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8`,children:[(0,F.jsxs)(`div`,{className:`relative w-36 h-36 flex-shrink-0`,children:[(0,F.jsxs)(`svg`,{className:`w-full h-full -rotate-90`,viewBox:`0 0 36 36`,children:[(0,F.jsx)(`path`,{strokeWidth:`3`,stroke:`#F0ECEE`,fill:`none`,d:`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`}),(0,F.jsx)(`path`,{strokeDasharray:`${c}, 100`,strokeWidth:`3`,strokeLinecap:`round`,stroke:g,fill:`none`,d:`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`})]}),(0,F.jsxs)(`div`,{className:`absolute inset-0 flex flex-col items-center justify-center`,children:[(0,F.jsx)(`span`,{className:`text-4xl font-black text-[#282326] tracking-tight`,children:c}),(0,F.jsx)(`span`,{className:`text-[10px] text-[#6F686B] font-extrabold uppercase tracking-wider mt-0.5`,children:`Sức khỏe`})]})]}),(0,F.jsxs)(`div`,{className:`flex-1 text-center sm:text-left space-y-2.5`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center sm:justify-start gap-2.5`,children:[(0,F.jsx)(`h4`,{className:`text-2xl font-black text-[#282326] tracking-tight`,children:s.skinType||`Da chưa xác định`}),(0,F.jsxs)(`span`,{className:`px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#FFF0F4] text-[#E06D81]`,children:[`Tuổi da AI: `,s.skinAge||25,` tuổi`]})]}),(0,F.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-extrabold bg-[#F0FAF5] text-[#0D7A53]`,children:[(0,F.jsx)(`strong`,{className:`text-sm font-black`,children:l}),(0,F.jsx)(`span`,{children:u})]}),(0,F.jsx)(`p`,{className:`text-xs sm:text-sm text-[#6F686B] leading-relaxed pt-1`,children:f})]})]}),(0,F.jsxs)(`section`,{className:`profile-report-section profile-report-metrics p-6 sm:p-8 space-y-6`,children:[(0,F.jsxs)(`div`,{className:`flex flex-col md:flex-row items-center gap-8`,children:[(0,F.jsx)(`div`,{className:`w-full md:w-1/2 h-[300px] flex items-center justify-center`,children:(0,F.jsx)(he,{values:p.health})}),(0,F.jsxs)(`div`,{className:`w-full md:w-1/2 space-y-3.5`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block`,children:`Sinh học tế bào da`}),(0,F.jsx)(`h4`,{className:`font-extrabold text-[#282326] text-lg`,children:`Cấu Trúc Đa Tầng Của Làn Da`}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] leading-relaxed`,children:`Vùng co vào tâm biểu hiện rào cản cần được tập trung bù ẩm, củng cố hàng rào lipid và phục hồi mô đệm.`}),m.slice(0,2).map((e,t)=>(0,F.jsxs)(`div`,{className:`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold ${t?`bg-[#FEF3C7] text-[#B45309]`:`bg-[#FFF0F4] text-[#BD3F5B]`}`,children:[(0,F.jsx)(`strong`,{children:e.name}),` (`,e.score,`/100) cần được theo dõi sát trong routine 28 ngày.`]},e.name)),(0,F.jsx)(`div`,{className:`flex flex-wrap gap-2 pt-1`,children:h.map(e=>(0,F.jsx)(`span`,{className:`bg-[#FFF0F4] text-[#E06D81] text-xs font-extrabold px-3 py-1 rounded-full`,children:e},e))})]})]}),(0,F.jsxs)(`div`,{className:`mt-6 pt-6 border-t border-[#F0ECEE]`,children:[(0,F.jsx)(`h5`,{className:`font-extrabold text-xs sm:text-sm text-[#282326] mb-4`,children:`Chi Tiết 12 Chỉ Số Cấu Trúc Đa Tầng`}),(0,F.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4`,children:p.health.map((e,t)=>{let n=Z(e);return(0,F.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,F.jsxs)(`div`,{className:`flex justify-between text-xs`,children:[(0,F.jsx)(`span`,{className:`font-semibold text-[#282326]`,children:D[t]}),(0,F.jsxs)(`strong`,{className:n.text,children:[e,`/100`]})]}),(0,F.jsx)(`div`,{className:`w-full bg-[#F0ECEE] rounded-full h-2 overflow-hidden`,children:(0,F.jsx)(`div`,{className:`${n.bar} h-2 rounded-full transition-all duration-700`,style:{width:`${e}%`}})})]},D[t])})})]})]}),(0,F.jsxs)(`section`,{className:`profile-report-section profile-report-core p-6 sm:p-8 space-y-4`,children:[(0,F.jsxs)(`div`,{className:`mb-2`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-extrabold text-[#E06D81] uppercase tracking-wider block mb-1`,children:`Đánh giá chuyên sâu`}),(0,F.jsx)(`h4`,{className:`font-extrabold text-[#282326] text-lg`,children:`Đánh Giá Chi Tiết 5 Chỉ Số Cốt Lõi`})]}),(0,F.jsx)(`div`,{className:`space-y-3`,children:p.core.map(e=>{let t=pe[e.id],n=d.detailedAdvice?.[e.id]||{},r=Z(e.healthScore);return(0,F.jsxs)(`details`,{className:`rounded-2xl overflow-hidden p-1 transition-all`,children:[(0,F.jsxs)(`summary`,{className:`p-4 cursor-pointer list-none flex items-center justify-between select-none`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,F.jsx)(`span`,{className:`w-2.5 h-2.5 rounded-full ${r.bar}`}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`p`,{className:`font-extrabold text-[#282326] text-sm`,children:t.name}),(0,F.jsxs)(`p`,{className:`${r.text} text-xs font-bold`,children:[e.rawScore,`% · `,r.label]})]})]}),(0,F.jsx)(`span`,{className:`text-[#6F686B] text-lg font-bold`,children:`⌄`})]}),(0,F.jsxs)(`div`,{className:`p-4 pt-2 text-xs text-[#6F686B] space-y-2 border-t border-[#F0ECEE]/60`,children:[(0,F.jsxs)(`p`,{children:[(0,F.jsx)(`strong`,{className:`text-[#282326]`,children:`Vì sao? `}),n.why||t.why]}),(0,F.jsxs)(`p`,{children:[(0,F.jsx)(`strong`,{className:`text-[#282326]`,children:`Nên làm: `}),n.shouldDo||t.shouldDo]}),(0,F.jsxs)(`p`,{children:[(0,F.jsx)(`strong`,{className:`text-[#282326]`,children:`Cần tránh: `}),n.avoid||t.avoid]})]})]},e.id)})})]}),(0,F.jsx)(ge,{scan:s})]}),(0,F.jsxs)(`div`,{className:`profile-report-footer sticky bottom-0 flex flex-wrap items-center justify-between gap-3 z-20`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,F.jsxs)(`button`,{type:`button`,onClick:()=>j({scan:s}),className:`profile-action profile-action--quiet`,children:[(0,F.jsxs)(`svg`,{className:`w-4 h-4 text-[#FF7893]`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,F.jsx)(`path`,{d:`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z`}),(0,F.jsx)(`polyline`,{points:`14 2 14 8 20 8`}),(0,F.jsx)(`line`,{x1:`16`,y1:`13`,x2:`8`,y2:`13`}),(0,F.jsx)(`line`,{x1:`16`,y1:`17`,x2:`8`,y2:`17`})]}),(0,F.jsx)(`span`,{children:`Xuất Báo Cáo PDF`})]}),(0,F.jsx)(`a`,{href:`/skin-analysis`,className:`profile-action profile-action--secondary`,children:`Soi da mới`})]}),(0,F.jsx)(`button`,{type:`button`,onClick:a,className:`profile-action profile-action--ghost`,children:`Đóng`})]})]})}),document.body)}function Q(e){try{let t=typeof e?.createdAt?.toDate==`function`?e.createdAt.toDate():new Date(e?.createdAt);if(!Number.isNaN(t.getTime()))return t.toLocaleDateString(`vi-VN`,{month:`2-digit`,year:`numeric`})}catch{return`SkinID`}return`SkinID`}function ve({user:e,historyCount:t,isLoading:n,onAvatarChange:r}){let i=(0,E.useRef)(null),[a,o]=(0,E.useState)(!1),s=e?.name||`Thành viên SkinID`,c=e?.picture&&!a;return(0,E.useEffect)(()=>o(!1),[e?.picture]),(0,F.jsxs)(`section`,{className:`profile-hero p-7 sm:p-9 mb-8 relative overflow-hidden`,children:[(0,F.jsx)(`div`,{className:`absolute -right-12 -top-12 w-64 h-64 bg-[#FFD6DE]/40 rounded-full blur-3xl pointer-events-none`}),(0,F.jsx)(`div`,{className:`absolute right-1/3 -bottom-10 w-52 h-52 bg-[#DBF1FF]/45 rounded-full blur-2xl pointer-events-none`}),(0,F.jsxs)(`div`,{className:`relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6`,children:[(0,F.jsxs)(`div`,{className:`flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left`,children:[(0,F.jsxs)(`div`,{className:`profile-avatar-shell`,children:[c?(0,F.jsx)(`img`,{src:e.picture,alt:`Ảnh đại diện của ${s}`,referrerPolicy:`no-referrer`,className:`profile-avatar`,onError:()=>o(!0)}):(0,F.jsx)(`div`,{className:`profile-avatar profile-avatar--fallback`,children:s.trim().charAt(0).toUpperCase()||`U`}),(0,F.jsx)(`input`,{ref:i,id:`profile-avatar-input`,type:`file`,accept:`image/jpeg,image/png,image/webp`,className:`hidden`,onChange:r}),(0,F.jsx)(`button`,{type:`button`,className:`profile-avatar-edit`,onClick:()=>i.current?.click(),"aria-label":`Thay đổi ảnh đại diện`,title:`Thay đổi ảnh đại diện`,children:(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`path`,{d:`M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z`}),(0,F.jsx)(`circle`,{cx:`12`,cy:`13`,r:`4`})]})})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2 min-h-[34px]`,children:[n?(0,F.jsx)(`span`,{className:`inline-block animate-pulse bg-rose-100/70 rounded-full h-8 w-44`}):(0,F.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-extrabold tracking-tight text-[#282326]`,children:s}),e&&(0,F.jsxs)(`span`,{className:`profile-provider-badge`,children:[(0,F.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-[#E06D81]`}),e.provider===`google`?`Google Account`:`Thành viên SkinID`]})]}),(0,F.jsx)(`p`,{className:`text-xs sm:text-sm text-[#6F686B] mb-3.5 min-h-[20px]`,children:e?.email||``}),(0,F.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-[#6F686B] font-medium`,children:[(0,F.jsxs)(`span`,{className:`profile-meta-pill`,children:[(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5 text-[#E06D81]`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`,ry:`2`}),(0,F.jsx)(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`}),(0,F.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`}),(0,F.jsx)(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`})]}),`Tham gia: `,(0,F.jsx)(`strong`,{className:`text-[#282326] font-bold`,children:Q(e)})]}),(0,F.jsxs)(`span`,{className:`profile-meta-pill`,children:[(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5 text-[#E06D81]`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,F.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`})]}),`Đã soi da: `,(0,F.jsxs)(`strong`,{className:`text-[#E06D81] font-extrabold`,children:[t,` phiên`]})]})]})]})]}),(0,F.jsxs)(`a`,{href:`/skin-analysis`,className:`profile-btn profile-btn--primary w-full sm:w-auto justify-center self-center md:self-start`,children:[(0,F.jsxs)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`path`,{d:`M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z`}),(0,F.jsx)(`circle`,{cx:`12`,cy:`13`,r:`4`})]}),(0,F.jsx)(`span`,{children:`Soi Da AI Mới`})]})]})]})}function $(e){let t=e?.shippingAddress||{};return{name:e?.name||``,email:e?.email||``,phone:e?.phone||``,birthday:e?.birthday||``,gender:e?.gender||`Nữ`,provinceCode:String(t.provinceCode||``),wardCode:String(t.wardCode||``),line1:t.line1||(e?.shippingAddress?``:e?.address||``),skinTypeBaseline:e?.skinTypeBaseline||`Chưa xác định`,mainConcern:e?.mainConcern||`Lỗ chân lông to & Sợi bã nhờn`}}function ye({user:e,isSaving:t,onSave:n}){let[r,i]=(0,E.useState)(()=>$(e)),[a,o]=(0,E.useState)(()=>JSON.stringify($(e))),[s,c]=(0,E.useState)([]),[l,u]=(0,E.useState)(!1),[d,f]=(0,E.useState)(null);(0,E.useEffect)(()=>{let t=$(e);i(t),o(JSON.stringify(t))},[e]),(0,E.useEffect)(()=>{let t=!0;if(!r.provinceCode){c([]);return}return u(!0),_(r.provinceCode).then(e=>{t&&c(e)}).catch(()=>{if(!t)return;let n=e?.shippingAddress;c(n?.wardCode?[{code:n.wardCode,name:n.wardName||`Phường/xã đã lưu`}]:[])}).finally(()=>{t&&u(!1)}),()=>{t=!1}},[r.provinceCode,e?.shippingAddress]);let p=(0,E.useMemo)(()=>JSON.stringify(r)!==a,[r,a]),m=e=>t=>{f(null),i(n=>({...n,[e]:t.target.value}))};return(0,F.jsxs)(`div`,{className:`profile-surface profile-identity-surface p-6 sm:p-8`,children:[(0,F.jsxs)(`div`,{className:`pb-5 mb-8 border-b border-[#F0ECEE]`,children:[(0,F.jsx)(`h2`,{className:`text-xl font-extrabold text-[#282326] tracking-tight`,children:`Thông Tin Định Danh`}),(0,F.jsx)(`p`,{className:`text-xs text-[#797074] mt-1`,children:`Cập nhật thông tin để SkinID cá nhân hóa gợi ý chu trình chăm sóc da khoa học`})]}),(0,F.jsxs)(`form`,{id:`form-edit-profile`,onSubmit:async e=>{e.preventDefault(),f(null);try{let e=b({line1:r.line1,provinceCode:r.provinceCode,wardCode:r.wardCode,wards:s});await n({name:r.name.trim(),phone:r.phone.trim(),birthday:r.birthday,gender:r.gender,address:e.fullAddress,shippingAddress:e,skinTypeBaseline:r.skinTypeBaseline,mainConcern:r.mainConcern}),o(JSON.stringify(r)),f({type:`success`,text:`Hồ sơ cá nhân đã được lưu thành công.`})}catch(e){f({type:`error`,text:e.message||`Không thể lưu hồ sơ.`})}},className:`space-y-6`,children:[(0,F.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-name`,children:`Họ và tên *`}),(0,F.jsx)(`input`,{type:`text`,id:`prof-name`,required:!0,value:r.name,onChange:m(`name`),placeholder:`Nguyễn Văn A`})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-email`,children:`Địa chỉ Email`}),(0,F.jsxs)(`div`,{className:`profile-readonly-field`,children:[(0,F.jsxs)(`svg`,{className:`w-4 h-4`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`rect`,{x:`3`,y:`11`,width:`18`,height:`11`,rx:`2`,ry:`2`}),(0,F.jsx)(`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`})]}),(0,F.jsx)(`input`,{type:`email`,id:`prof-email`,value:r.email,readOnly:!0,"aria-readonly":`true`,title:`Email đăng nhập không thể thay đổi tại đây`})]}),(0,F.jsx)(`p`,{className:`profile-field-note`,children:`Đã xác thực qua tài khoản · Không thể chỉnh sửa tại trang hồ sơ`})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-phone`,children:`Số điện thoại liên hệ`}),(0,F.jsx)(`input`,{type:`tel`,id:`prof-phone`,value:r.phone,onChange:m(`phone`),placeholder:`0901234567`})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-birthday`,children:`Ngày sinh`}),(0,F.jsx)(`input`,{type:`date`,id:`prof-birthday`,value:r.birthday,onChange:m(`birthday`)})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-gender`,children:`Giới tính`}),(0,F.jsxs)(`select`,{id:`prof-gender`,value:r.gender,onChange:m(`gender`),children:[(0,F.jsx)(`option`,{value:`Nữ`,children:`Nữ`}),(0,F.jsx)(`option`,{value:`Nam`,children:`Nam`}),(0,F.jsx)(`option`,{value:`Khác`,children:`Khác`})]})]}),(0,F.jsxs)(`div`,{className:`sm:col-span-2`,children:[(0,F.jsx)(`label`,{children:`Địa chỉ nhận hàng mặc định`}),(0,F.jsxs)(`div`,{className:`profile-address-grid`,children:[(0,F.jsxs)(`select`,{id:`prof-province`,value:r.provinceCode,onChange:e=>{f(null),i(t=>({...t,provinceCode:e.target.value,wardCode:``}))},"aria-label":`Tỉnh hoặc thành phố`,children:[(0,F.jsx)(`option`,{value:``,children:`Chọn tỉnh/thành`}),y.map(e=>(0,F.jsx)(`option`,{value:e.code,children:e.name},e.code))]}),(0,F.jsxs)(`select`,{id:`prof-ward`,value:r.wardCode,onChange:m(`wardCode`),"aria-label":`Phường hoặc xã`,disabled:!r.provinceCode||l,children:[(0,F.jsx)(`option`,{value:``,children:l?`Đang tải phường/xã…`:r.provinceCode?`Chọn phường/xã`:`Chọn tỉnh/thành trước`}),s.map(e=>(0,F.jsx)(`option`,{value:e.code,children:e.name},e.code))]}),(0,F.jsx)(`input`,{type:`text`,id:`prof-address`,value:r.line1,onChange:m(`line1`),placeholder:`Số nhà, tên tòa nhà, tên đường…`,autoComplete:`street-address`})]}),(0,F.jsx)(`p`,{className:`profile-field-note`,children:`Được đồng bộ hai chiều với địa chỉ tại bước thanh toán.`})]})]}),(0,F.jsxs)(`div`,{className:`pt-8 mt-4 border-t border-[#F0ECEE]`,children:[(0,F.jsx)(`h3`,{className:`text-base font-extrabold text-[#282326] tracking-tight mb-1`,children:`Hồ Sơ Thể Trạng Làn Da`}),(0,F.jsx)(`p`,{className:`text-xs text-[#797074] mb-5`,children:`Giúp AI đối chiếu giữa kết quả soi da và cảm nhận thực tế của bạn`}),(0,F.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-skintype`,children:`Loại da bạn tự nhận định:`}),(0,F.jsxs)(`select`,{id:`prof-skintype`,value:r.skinTypeBaseline,onChange:m(`skinTypeBaseline`),children:[(0,F.jsx)(`option`,{value:`Chưa xác định`,children:`Chưa xác định (Chờ AI phân tích)`}),(0,F.jsx)(`option`,{value:`Da dầu`,children:`Da dầu`}),(0,F.jsx)(`option`,{value:`Da hỗn hợp thiên dầu`,children:`Da hỗn hợp thiên dầu`}),(0,F.jsx)(`option`,{value:`Da khô`,children:`Da khô / Thiếu ẩm`}),(0,F.jsx)(`option`,{value:`Da nhạy cảm`,children:`Da nhạy cảm`}),(0,F.jsx)(`option`,{value:`Da thường`,children:`Da thường`})]})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{htmlFor:`prof-main-concern`,children:`Vấn đề da cần ưu tiên:`}),(0,F.jsxs)(`select`,{id:`prof-main-concern`,value:r.mainConcern,onChange:m(`mainConcern`),children:[(0,F.jsx)(`option`,{value:`Mụn bọc & Mụn viêm`,children:`Mụn bọc & Mụn viêm`}),(0,F.jsx)(`option`,{value:`Thâm mụn & Sắc tố không đều`,children:`Thâm mụn & Sắc tố không đều`}),(0,F.jsx)(`option`,{value:`Lỗ chân lông to & Sợi bã nhờn`,children:`Lỗ chân lông to & Sợi bã nhờn`}),(0,F.jsx)(`option`,{value:`Lão hóa & Nếp nhăn`,children:`Lão hóa & Nếp nhăn`}),(0,F.jsx)(`option`,{value:`Khô ráp & Bong tróc`,children:`Khô ráp & Bong tróc`}),(0,F.jsx)(`option`,{value:`Mẩn đỏ & Giãn mao mạch`,children:`Mẩn đỏ & Giãn mao mạch`})]})]})]})]}),d&&(0,F.jsx)(`div`,{role:d.type===`error`?`alert`:`status`,className:`rounded-2xl px-5 py-3.5 text-xs font-semibold ${d.type===`error`?`bg-rose-50 text-rose-700 border border-rose-100`:`bg-emerald-50 text-emerald-700 border border-emerald-100`}`,children:d.text}),(0,F.jsxs)(`div`,{id:`profile-save-bar`,className:`profile-save-bar ${p?``:`hidden`}`,"aria-live":`polite`,children:[(0,F.jsxs)(`p`,{children:[(0,F.jsx)(`strong`,{children:`Bạn có thay đổi chưa lưu`}),(0,F.jsx)(`span`,{children:`Kiểm tra lại thông tin trước khi cập nhật.`})]}),(0,F.jsx)(`button`,{id:`profile-save-button`,type:`submit`,disabled:t,className:`profile-btn profile-btn--primary disabled:opacity-50`,children:t?`Đang lưu…`:`Lưu thay đổi`})]})]})]})}function be(){let e=p(),[t,n]=m(),[r,i]=(0,E.useState)(null),[a,o]=(0,E.useState)({current:``,next:``,confirmation:``}),[s,c]=(0,E.useState)(null),{changeAvatar:l,cancelOrder:u,clearHistory:d,downloadPdf:f,history:h,isAuthenticated:g,isLoading:_,isSaving:v,logout:y,orders:b,saveProfile:D,user:O,updatePassword:k}=oe();ee({title:`Hồ Sơ Cá Nhân & Lịch Sử Soi Da | SkinID.vn`,description:`Quản lý hồ sơ cá nhân và lịch sử soi da tại SkinID.vn.`});let A=[`profile`,`history`,`orders`,`settings`],j=t.get(`tab`),M=A.includes(j)?j:`profile`;(0,E.useEffect)(()=>{!_&&!g&&e(`/?auth=1`,{replace:!0})},[g,_,e]);let N=e=>{let r=new URLSearchParams(t);e===`profile`?r.delete(`tab`):r.set(`tab`,e),n(r,{replace:!0})};return(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(T,{}),(0,F.jsx)(x,{}),(0,F.jsxs)(`div`,{className:`profile-page min-h-screen flex flex-col`,children:[(0,F.jsxs)(`main`,{className:`profile-main container`,children:[(0,F.jsxs)(`header`,{className:`profile-page-heading`,children:[(0,F.jsx)(`span`,{children:`KHÔNG GIAN CỦA BẠN`}),(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`h1`,{children:[`Chăm da có nhịp.`,(0,F.jsx)(`br`,{}),(0,F.jsx)(`em`,{children:`Lưu giữ từng thay đổi.`})]}),(0,F.jsx)(`p`,{children:`Hồ sơ, kết quả soi da và đơn hàng được sắp xếp trong một hành trình nhẹ nhàng, rõ ràng và riêng tư.`})]})]}),(0,F.jsx)(ve,{user:O,historyCount:h.length,isLoading:_,onAvatarChange:async e=>{let t=e.target.files?.[0];if(e.target.value=``,t)try{await l(t),i({type:`success`,text:`Ảnh đại diện đã được cập nhật.`})}catch(e){i({type:`error`,text:e.message||`Không thể cập nhật ảnh đại diện.`})}}}),r&&(0,F.jsx)(`div`,{role:r.type===`error`?`alert`:`status`,className:`mb-6 rounded-2xl px-4 py-3 text-xs font-semibold ${r.type===`error`?`bg-rose-50 text-rose-700`:`bg-emerald-50 text-emerald-700`}`,children:r.text}),(0,F.jsx)(`div`,{className:`profile-tabs flex overflow-x-auto no-scrollbar mb-8`,role:`tablist`,"aria-label":`Khu vực hồ sơ`,children:[[`profile`,`Hồ sơ cá nhân`],[`history`,`Lịch sử soi da`],[`orders`,`Đơn hàng`],[`settings`,`Cài đặt`]].map(([e,t])=>(0,F.jsx)(`button`,{id:`profile-tab-${e}`,type:`button`,role:`tab`,"aria-controls":`profile-panel-${e}`,onClick:()=>N(e),"aria-selected":M===e,className:`tab-btn ${M===e?`active`:``} flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 flex items-center justify-center gap-2`,children:t},e))}),M===`profile`&&(0,F.jsx)(`div`,{id:`profile-panel-profile`,role:`tabpanel`,"aria-labelledby":`profile-tab-profile`,className:`profile-tab-panel space-y-8`,children:(0,F.jsx)(ye,{user:O,isSaving:v,onSave:D})}),M===`history`&&(0,F.jsxs)(`div`,{id:`profile-panel-history`,role:`tabpanel`,"aria-labelledby":`profile-tab-history`,className:`profile-tab-panel space-y-8`,children:[(0,F.jsx)(K,{history:h}),(0,F.jsxs)(`div`,{className:`profile-surface p-6 sm:p-8`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between mb-6 pb-4 border-b border-gray-100`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`h2`,{className:`text-lg font-black text-gray-900`,children:`Nhật Ký Các Phiên Soi Da Chi Tiết`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-500`,children:`Toàn bộ hồ sơ báo cáo và chu trình chăm sóc da đã được AI phân tích tham khảo`})]}),(0,F.jsx)(`a`,{href:`/skin-analysis`,className:`text-xs font-bold text-brand-primary hover:underline flex items-center gap-1`,children:`+ Soi da mới`})]}),(0,F.jsx)(R,{history:h})]})]}),M===`orders`&&(0,F.jsx)(`div`,{id:`profile-panel-orders`,role:`tabpanel`,"aria-labelledby":`profile-tab-orders`,className:`profile-tab-panel space-y-5`,children:(0,F.jsxs)(`div`,{className:`profile-surface p-6 sm:p-8`,children:[(0,F.jsxs)(`div`,{className:`pb-4 mb-5 border-b border-gray-100`,children:[(0,F.jsx)(`h2`,{className:`text-lg font-black text-gray-900`,children:`Đơn Hàng Của Tôi`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-500`,children:`Theo dõi trạng thái xác nhận, giao hàng và thanh toán của mọi đơn mua.`})]}),(0,F.jsx)(ue,{orders:b,isLoading:_,onCancel:u})]})}),M===`settings`&&(0,F.jsxs)(`div`,{id:`profile-panel-settings`,role:`tabpanel`,"aria-labelledby":`profile-tab-settings`,className:`profile-tab-panel space-y-8`,children:[(0,F.jsxs)(`div`,{className:`profile-surface p-6 sm:p-8`,children:[(0,F.jsxs)(`div`,{className:`pb-4 mb-6 border-b border-gray-100`,children:[(0,F.jsx)(`h2`,{className:`text-lg font-black text-gray-900`,children:`Bảo Mật & Mật Khẩu`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-500`,children:`Thay đổi mật khẩu đăng nhập tài khoản Email cá nhân`})]}),O?.provider===`google`?(0,F.jsx)(`div`,{className:`profile-google-notice`,children:(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`strong`,{children:`Mật khẩu do Google quản lý`}),(0,F.jsx)(`p`,{children:`Tài khoản này đăng nhập qua Google nên không sử dụng mật khẩu riêng của SkinID.`})]})}):(0,F.jsxs)(`form`,{id:`form-change-password`,onSubmit:async e=>{if(e.preventDefault(),c(null),a.next!==a.confirmation){c({type:`error`,text:`Mật khẩu mới và xác nhận mật khẩu không trùng khớp.`});return}try{await k(a.current,a.next),o({current:``,next:``,confirmation:``}),c({type:`success`,text:`Mật khẩu đã được thay đổi thành công.`})}catch(e){c({type:`error`,text:e.message||`Không thể đổi mật khẩu.`})}},className:`space-y-4 max-w-lg`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{className:`block text-xs font-bold text-gray-700 mb-1.5`,children:`Mật khẩu hiện tại`}),(0,F.jsx)(`input`,{type:`password`,value:a.current,onChange:e=>o(t=>({...t,current:e.target.value})),required:!0,placeholder:`••••••••`,className:`w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all`})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{className:`block text-xs font-bold text-gray-700 mb-1.5`,children:`Mật khẩu mới (Tối thiểu 6 ký tự)`}),(0,F.jsx)(`input`,{type:`password`,value:a.next,onChange:e=>o(t=>({...t,next:e.target.value})),required:!0,minLength:6,placeholder:`Tối thiểu 6 ký tự`,className:`w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all`})]}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`label`,{className:`block text-xs font-bold text-gray-700 mb-1.5`,children:`Xác nhận mật khẩu mới`}),(0,F.jsx)(`input`,{type:`password`,value:a.confirmation,onChange:e=>o(t=>({...t,confirmation:e.target.value})),required:!0,minLength:6,placeholder:`Nhập lại mật khẩu mới`,className:`w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all`})]}),(0,F.jsx)(`button`,{type:`submit`,disabled:v,className:`profile-btn profile-btn--secondary disabled:opacity-50`,children:v?`Đang cập nhật…`:`Cập nhật Mật Khẩu`}),s&&(0,F.jsx)(`div`,{role:s.type===`error`?`alert`:`status`,className:`rounded-xl px-4 py-3 text-xs font-semibold ${s.type===`error`?`bg-rose-50 text-rose-700`:`bg-emerald-50 text-emerald-700`}`,children:s.text})]})]}),(0,F.jsxs)(`div`,{className:`profile-surface p-6 sm:p-8`,children:[(0,F.jsxs)(`div`,{className:`pb-4 mb-6 border-b border-gray-100`,children:[(0,F.jsx)(`h2`,{className:`text-lg font-black text-gray-900`,children:`Quyền riêng tư & dữ liệu`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-500`,children:`Bạn có thể tải báo cáo PDF hoặc xóa lịch sử soi da khỏi tài khoản.`})]}),(0,F.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 gap-5`,children:[(0,F.jsxs)(`div`,{className:`profile-data-card flex flex-col justify-between bg-gradient-to-br from-[#FFF0F4] via-[#FFFFFF] to-[#FFF5F7] shadow-[0_12px_32px_rgba(224,109,129,0.08)]`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2 text-[#282326] font-extrabold text-sm mb-2`,children:[(0,F.jsx)(`span`,{className:`w-7 h-7 rounded-full bg-[#FFF0F4] text-[#E06D81] flex items-center justify-center flex-shrink-0`,children:(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`path`,{d:`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z`}),(0,F.jsx)(`polyline`,{points:`14 2 14 8 20 8`}),(0,F.jsx)(`line`,{x1:`16`,y1:`13`,x2:`8`,y2:`13`}),(0,F.jsx)(`line`,{x1:`16`,y1:`17`,x2:`8`,y2:`17`}),(0,F.jsx)(`polyline`,{points:`10 9 9 9 8 9`})]})}),`Xuất Báo Cáo PDF`]}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] mb-5 leading-relaxed`,children:`Tải về báo cáo hồ sơ cá nhân, 12 chỉ số cấu trúc da và phác đồ dược mỹ phẩm đề xuất định dạng PDF sắc nét.`})]}),(0,F.jsxs)(`button`,{type:`button`,onClick:f,className:`profile-btn profile-btn--primary self-start flex items-center gap-2`,children:[(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,F.jsx)(`polyline`,{points:`7 10 12 15 17 10`}),(0,F.jsx)(`line`,{x1:`12`,y1:`15`,x2:`12`,y2:`3`})]}),`Tải Xuống Báo Cáo PDF`]})]}),(0,F.jsxs)(`div`,{className:`profile-data-card flex flex-col justify-between bg-gradient-to-br from-[#FFF0F0] via-[#FFFFFF] to-[#FFF5F5] shadow-[0_12px_32px_rgba(180,35,24,0.06)]`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2 text-[#B42318] font-extrabold text-sm mb-2`,children:[(0,F.jsx)(`span`,{className:`w-7 h-7 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center flex-shrink-0`,children:(0,F.jsxs)(`svg`,{className:`w-3.5 h-3.5`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,F.jsx)(`polyline`,{points:`3 6 5 6 21 6`}),(0,F.jsx)(`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})]})}),`Xóa Lịch Sử Soi Da`]}),(0,F.jsx)(`p`,{className:`text-xs text-[#6F686B] mb-5 leading-relaxed`,children:`Xóa vĩnh viễn các báo cáo soi da đã lưu. Hồ sơ, giỏ hàng và đơn mua vẫn được bảo toàn nguyên vẹn.`})]}),(0,F.jsx)(`button`,{type:`button`,onClick:async()=>{try{await d()&&i({type:`success`,text:`Lịch sử soi da đã được xóa.`})}catch(e){i({type:`error`,text:e.message||`Không thể xóa lịch sử soi da.`})}},className:`profile-btn profile-btn--danger self-start`,children:`Xóa lịch sử soi da`})]})]})]}),(0,F.jsx)(`div`,{className:`profile-surface p-6 sm:p-8`,children:(0,F.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4`,children:[(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`h2`,{className:`text-lg font-black text-gray-900`,children:`Phiên Đăng Nhập`}),(0,F.jsx)(`p`,{className:`text-xs text-gray-500`,children:`Đăng xuất tài khoản khỏi trình duyệt này để bảo mật thông tin cá nhân.`})]}),(0,F.jsx)(`button`,{type:`button`,onClick:async()=>{try{await y()}finally{e(`/`,{replace:!0})}},className:`profile-btn profile-btn--secondary self-start sm:self-auto`,children:(0,F.jsx)(`span`,{children:`Đăng xuất tài khoản`})})]})})]})]}),(0,F.jsx)(_e,{history:h})]}),(0,F.jsx)(C,{}),(0,F.jsx)(S,{}),(0,F.jsx)(w,{})]})}export{be as default};