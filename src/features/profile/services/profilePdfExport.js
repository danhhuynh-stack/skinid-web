import { detailedMetricNames } from './metricNames.js';

const reportLogoUrl = new URL('../../../assets/images/logo.png', import.meta.url).href;
const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const present = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const score = (value) => present(value) && Number.isFinite(Number(value)) ? Math.round(Math.min(100, Math.max(0, Number(value)))) : null;
const text = (value, fallback = 'Không có dữ liệu') => escapeHtml(present(value) ? value : fallback);
function dateValue(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value.seconds != null) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value, time = true) {
  const date = dateValue(value);
  return date ? new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
    ...(time ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(date) : (present(value) ? String(value) : 'Không có dữ liệu');
}
function scanDate(scan) { return scan.timestamp || scan.createdAt || scan.dateFormatted; }
function addressFromUser(user) {
  const address = user.shippingAddress || {};
  return address.fullAddress || user.address || [address.line1 || address.street, address.wardName || address.ward, address.districtName || address.district, address.provinceName || address.province].filter(present).join(', ');
}

export function generateReportHtml({ user = {}, history = [], logoUrl = reportLogoUrl, exportedAt = new Date() } = {}) {
  user = user || {};
  const scans = (Array.isArray(history) ? history : []).filter(Boolean).slice().sort((a, b) => (dateValue(scanDate(b))?.getTime() || 0) - (dateValue(scanDate(a))?.getTime() || 0));
  const latest = scans[0] || {};
  const health = score(latest.healthScore);
  const metrics = latest.metrics || latest.fullAnalysis?.metrics || {};
  const metricKeys = ['moisture', 'sebum', 'pores', 'pigmentation', 'melasma', 'elasticity', 'eyeWrinkles', 'nasolabialFolds', 'redness', 'acneBacteria', 'texture', 'darkCircles'];
  const positiveMetrics = new Set(['moisture', 'elasticity', 'texture']);
  const products = Array.isArray(latest.recommendedRoutineProducts) ? latest.recommendedRoutineProducts.filter(Boolean) : [];
  const name = user.name || user.displayName || 'Thành viên SkinID';
  const reportId = `SKN-${String(user.id || user.uid || 'USER').slice(-6).toUpperCase()}-${(dateValue(exportedAt)?.getTime() || Date.now()).toString(36).toUpperCase()}`;
  const profileRows = [
    ['Họ và tên', name], ['Email', user.email], ['Số điện thoại', user.phone || user.phoneNumber],
    ['Ngày sinh', user.birthday ? formatDate(user.birthday, false) : ''],
    ['Giới tính', user.gender], ['Địa chỉ', addressFromUser(user)]
  ].filter(([, value]) => present(value));
  const extraPage = products.length > 0 || scans.length > 1;
  const totalPages = extraPage ? 3 : 2;
  const pageFooter = (page) => `<footer class="page-footer"><span>SkinID.vn · Chăm sóc theo cách của bạn</span><span>${text(reportId)} · ${page} / ${totalPages}</span></footer>`;
  const metricRows = metricKeys.map((key, index) => {
    const raw = score(metrics[key]);
    const balanced = raw === null ? null : positiveMetrics.has(key) ? raw : 100 - raw;
    const tone = balanced === null ? 'muted' : balanced >= 75 ? 'good' : balanced >= 55 ? 'moderate' : 'attention';
    const status = balanced === null ? 'Không có dữ liệu' : balanced >= 75 ? 'Tốt' : balanced >= 55 ? 'Cần duy trì' : 'Cần chú ý';
    return `<tr><td>${text(detailedMetricNames[index])}</td><td class="number">${raw === null ? '-' : `${raw}/100`}</td><td><div class="bar"><i class="${tone}" style="width:${raw ?? 0}%"></i></div></td><td><span class="status ${tone}">${status}</span></td></tr>`;
  }).join('');
  const routine = (title, subtitle, steps) => `<div class="routine-card"><span class="eyebrow">${title}</span><h3>${subtitle}</h3><ol>${steps.map(step => `<li>${step}</li>`).join('')}</ol></div>`;
  const productRows = products.map(product => `<tr><td><span class="product-brand">${text(product.brand, '')}</span><strong>${text(product.name, 'Sản phẩm gợi ý')}</strong></td><td>${text(product.volume, '-')}</td><td class="number">${present(product.price) ? text(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price) || 0)) : '-'}</td></tr>`).join('');
  const historyRows = scans.slice(0, 5).map(scan => `<tr><td>${text(formatDate(scanDate(scan)))}</td><td class="number">${score(scan.healthScore) === null ? '-' : `${score(scan.healthScore)}/100`}</td><td>${text(scan.skinType)}</td></tr>`).join('');
  const assessment = latest.analysis3Angles || latest.fullAnalysis?.analysis3Angles;
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SkinID - Báo cáo làn da - ${text(name)}</title><style>
  @page{size:A4 portrait;margin:12mm 14mm}*{box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact}
  body{margin:0;background:#f5f1f2;color:#30252a;font:12px/1.6 "Segoe UI",Arial,sans-serif}h1,h2,h3,p{margin:0}h1{font-size:34px;line-height:1.15;letter-spacing:-1px}h2{font-size:18px;line-height:1.3}h3{font-size:16px;line-height:1.4}strong{font-weight:650}
  .toolbar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 24px;background:#30232a;color:white}.toolbar small{display:block;color:#e2cbd3}.toolbar button{padding:10px 20px;border:0;border-radius:99px;font:600 12px "Segoe UI",sans-serif;cursor:pointer;background:#e46183;color:#fff}.toolbar .close{background:#53444b;margin-left:8px}
  .page{display:flow-root;width:182mm;min-height:270mm;margin:24px auto;padding:0 0 14mm;background:#fff;position:relative;box-shadow:0 8px 30px #30252a12}.page-content{padding:9mm 8mm 0}.report-header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid #f0dce4}.logo{width:118px;height:60px;object-fit:contain}.metadata{text-align:right;font-size:10px;color:#7d6c74}.metadata strong{color:#40313a}.eyebrow{display:block;color:#c04e72;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase}
  .intro{position:relative;padding:25px 0 23px}.intro h1{margin:8px 0 12px}.intro h1 em{color:#d25277;font-style:normal}.intro p{color:#807079;max-width:440px}.customer{border:1px solid #efdfe5;border-radius:16px;padding:18px 20px;background:#fffbfc}.customer-title{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px}.customer-title h2{font-size:16px}.customer-title span{font-size:10px;color:#927b86}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}.field small{display:block;color:#8b7781;font-size:10px}.field strong{display:block;overflow-wrap:anywhere}.field:last-child{grid-column:1/-1}
  section{margin-top:24px}.section-heading{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}.section-heading b{color:#d56184;font-size:11px;letter-spacing:1px}.section-heading h2{flex:1}.section-heading small{font-size:10px;color:#8b7781}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.summary-card{padding:17px 14px;background:#fff2f6;border-radius:16px;border:1px solid #f5dce5}.summary-card small{font-size:10px;color:#866572}.summary-card strong{display:block;color:#c34870;font-size:26px;line-height:1.3;margin:8px 0}.summary-card span{color:#6d535f;font-size:10px}.skin-type{margin-top:12px;padding:14px 18px;border-radius:12px;background:#faf7f8}.skin-type small{color:#967783;font-size:10px;display:block;margin-bottom:3px}.assessment{padding:18px 20px;border-left:3px solid #e27694;background:#fff9fb;border-radius:0 14px 14px 0;white-space:pre-line;overflow-wrap:anywhere}.assessment p+p{margin-top:8px}.note{font-size:10px;color:#88727d;margin-top:14px;line-height:1.65}
  .page-footer{position:absolute;bottom:7mm;left:8mm;right:8mm;border-top:1px solid #eadce2;padding-top:8px;display:flex;justify-content:space-between;gap:12px;color:#9a808c;font-size:9px}.continuation{margin:20px 0 18px}.continuation h2{font-size:24px;margin-top:6px}.table{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}.table thead{display:table-header-group}.table th{padding:10px 12px;background:#f8eef2;color:#8b4c65;text-align:left;font-size:10px}.table td{padding:8px 12px;border-bottom:1px solid #f2e9ed;overflow-wrap:anywhere;vertical-align:middle}.table tbody tr:nth-child(even){background:#fffbfc}.table tr{break-inside:avoid}.number{white-space:nowrap;font-variant-numeric:tabular-nums}.bar{height:5px;border-radius:10px;background:#f2e6eb;overflow:hidden}.bar i{display:block;height:100%;background:#db6588}.bar i.good{background:#5a9a88}.bar i.moderate{background:#bb9367}.bar i.attention{background:#db6588}.status{font-size:10px;color:#a44464}.status.good{color:#397564}.status.moderate{color:#937047}.status.muted{color:#94848c}
  .routine-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.routine-card{padding:18px;background:#fff6f9;border:1px solid #f2dce5;border-radius:16px;break-inside:avoid}.routine-card:last-child{background:#f8f5fa}.routine-card h3{margin:4px 0 12px}.routine-card ol{margin:0;padding-left:18px;font-size:11px;color:#68505d}.routine-card li{padding-left:4px;margin-bottom:8px}.product-brand{display:block;color:#ba5375;font-size:10px;text-transform:uppercase;letter-spacing:.5px}.table td strong{font-size:11px}.contact{padding:18px;background:#fff6f9;border-radius:14px}.contact h3{margin-bottom:8px}.contact p{font-size:11px;color:#745963}
  @media screen{.page{border-top:4px solid #e4829e}}@media screen and (max-width:720px){.toolbar{flex-wrap:wrap}.page{width:100%;margin:16px 0}.page-content{padding:20px}.page-footer{position:static;margin:26px 20px 0}.summary{gap:6px}.summary-card{padding:12px 8px}.summary-card strong{font-size:22px}.section-heading{flex-wrap:wrap}.table th,.table td{padding:8px 5px}}
  @media print{body{background:white;font-size:11px}.table td{padding:7px 12px}.contact{padding:10px 14px;margin-top:14px}.contact h3{font-size:14px;margin-bottom:4px}.note{margin-top:10px}.intro{padding:18px 0}.intro h1{font-size:30px}.customer{padding:14px 16px}.customer-title{margin-bottom:8px}.profile-grid{gap:7px 20px}.summary-card{padding:12px 14px}section{margin-top:18px}.toolbar{display:none}.page{width:auto;min-height:270mm;margin:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}.page-content{padding:0}.page-footer{left:0;right:0;bottom:0}section{break-inside:auto}.section-heading{break-after:avoid}.customer,.summary,.skin-type,.routine-grid,.contact{break-inside:avoid}.assessment{orphans:3;widows:3}}
  </style></head><body>
  <div class="toolbar"><div><strong>Báo cáo làn da cá nhân · SkinID</strong><small>Chọn “Lưu dưới dạng PDF” trong cửa sổ in để tải báo cáo A4.</small></div><div><button onclick="window.print()">In / Lưu PDF</button><button class="close" onclick="window.close()">Đóng</button></div></div>
  <article class="page"><div class="page-content"><header class="report-header"><img class="logo" src="${text(logoUrl)}" alt="SkinID"><div class="metadata">Mã báo cáo <strong>${text(reportId)}</strong><br>Ngày xuất ${text(formatDate(exportedAt))}<br>Báo cáo cá nhân · Thông tin riêng tư</div></header>
  <div class="intro"><span class="eyebrow">SKIN JOURNAL / NHẬT KÝ LÀN DA</span><h1>Hiểu làn da.<br><em>Chăm sóc chính mình.</em></h1><p>Kết quả soi da và gợi ý chăm sóc dành cho ${text(name)}.</p></div>
  <div class="customer"><div class="customer-title"><h2>Hồ sơ của bạn</h2><span>Thông tin từ tài khoản SkinID</span></div><div class="profile-grid">${profileRows.map(([label,value]) => `<div class="field"><small>${label}</small><strong>${text(value)}</strong></div>`).join('')}</div></div>
  <section><div class="section-heading"><b>01</b><h2>Tổng quan làn da</h2><small>${text(formatDate(scanDate(latest)))}</small></div><div class="summary"><div class="summary-card"><small>ĐIỂM SỨC KHỎE</small><strong>${health ?? '-'}</strong><span>${health === null ? 'Không có dữ liệu' : '/ 100 điểm'}</span></div><div class="summary-card"><small>TUỔI DA ƯỚC TÍNH</small><strong>${text(latest.skinAge, '-')}</strong><span>Ước tính từ AI</span></div><div class="summary-card"><small>PHIÊN TRONG BÁO CÁO</small><strong>${scans.length}</strong><span>Phiên soi da đã lưu</span></div></div><div class="skin-type"><small>PHÂN LOẠI DA</small><strong>${text(latest.skinType)}</strong></div></section>
  <section><div class="section-heading"><b>02</b><h2>Lắng nghe làn da của bạn</h2></div><div class="assessment">${latest.overallGradeComment ? `<p><strong>${text(latest.overallGradeComment)}</strong></p>` : ''}<p>${text(assessment, 'Phiên này chưa lưu phần nhận xét chi tiết.')}</p></div><p class="note">Kết quả AI mang tính tham khảo, không thay thế chẩn đoán hoặc tư vấn của bác sĩ da liễu.</p></section>
  </div>${pageFooter(1)}</article>
  <article class="page"><div class="page-content"><div class="continuation"><span class="eyebrow">SKIN DETAILS / CHĂM SÓC MỖI NGÀY</span><h2>Những điều làn da đang cần</h2></div><section><div class="section-heading"><b>03</b><h2>12 chỉ số làn da</h2></div><table class="table"><thead><tr><th style="width:27%">Chỉ số</th><th style="width:16%">Mức ghi nhận</th><th style="width:30%">Thang đo 0 - 100</th><th>Nhận xét</th></tr></thead><tbody>${metricRows}</tbody></table><p class="note">Điểm hiển thị là mức ghi nhận trong phiên soi: độ ẩm, đàn hồi và kết cấu cao hơn là tích cực; các chỉ số còn lại cao hơn thể hiện vấn đề rõ hơn. Thanh đo không phải xác suất chẩn đoán.</p></section>
  <section><div class="section-heading"><b>04</b><h2>Gợi ý nhịp chăm sóc</h2></div><div class="routine-grid">${routine('AM / BUỔI SÁNG', 'Dịu nhẹ & bảo vệ', ['Làm sạch dịu nhẹ.', 'Dưỡng ẩm phù hợp với làn da.', 'Chống nắng theo hướng dẫn sản phẩm.'])}${routine('PM / BUỔI TỐI', 'Làm sạch & dưỡng ẩm', ['Tẩy trang và làm sạch.', 'Dùng sản phẩm chăm sóc đã phù hợp với da.', 'Dưỡng ẩm để kết thúc chu trình.'])}</div><p class="note">Đây là chu trình tham khảo. Điều chỉnh theo mức dung nạp của da và hướng dẫn sử dụng từng sản phẩm.</p></section>
  ${!extraPage ? '<section class="contact"><h3>Chăm sóc theo cách của bạn.</h3><p>SkinID.vn · Công ty TNHH FieldMan<br>Liên hệ hỗ trợ: 0924 093 461</p></section>' : ''}</div>${pageFooter(2)}</article>
  ${extraPage ? `<article class="page"><div class="page-content"><div class="continuation"><span class="eyebrow">YOUR CARE / HÀNH TRÌNH CỦA BẠN</span><h2>Tiếp nối nhịp chăm sóc</h2></div>${products.length ? `<section><div class="section-heading"><b>05</b><h2>Sản phẩm được lưu trong phiên soi</h2></div><table class="table"><thead><tr><th style="width:64%">Thương hiệu / Sản phẩm</th><th style="width:14%">Dung tích</th><th style="width:22%">Giá tham khảo</th></tr></thead><tbody>${productRows}</tbody></table><p class="note">Giá là thông tin được lưu tại thời điểm soi da; giá mua thực tế hiển thị trên website.</p></section>` : ''}${scans.length > 1 ? `<section><div class="section-heading"><b>06</b><h2>Các phiên soi gần đây</h2></div><table class="table"><thead><tr><th style="width:30%">Thời gian</th><th style="width:16%">Điểm</th><th>Phân loại da</th></tr></thead><tbody>${historyRows}</tbody></table></section>` : ''}<section class="contact"><h3>Chăm sóc theo cách của bạn.</h3><p>SkinID.vn · Công ty TNHH FieldMan<br>Liên hệ hỗ trợ: 0924 093 461</p></section><p class="note">Kết quả AI mang tính tham khảo, không thay thế chẩn đoán hoặc tư vấn của bác sĩ da liễu.</p></div>${pageFooter(3)}</article>` : ''}
  </body></html>`;
}

async function printWhenReady(target) {
  await target.document.fonts?.ready;
  await Promise.all([...target.document.images].map(image => image.decode().catch(() => {})));
  target.focus();
  target.print();
}

export function exportUserPdfReport({ user = {}, history = [], scan = null } = {}) {
  const html = generateReportHtml({ user, history: scan ? [scan] : history });
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWhenReady(printWindow).catch(error => console.warn('[SkinID Print]', error));
    return true;
  }
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  iframe.contentWindow.addEventListener('afterprint', () => iframe.remove(), { once: true });
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();
  printWhenReady(iframe.contentWindow).catch(error => { iframe.remove(); console.warn('[SkinID Print]', error); });
  return true;
}
