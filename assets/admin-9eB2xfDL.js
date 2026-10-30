const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/app-CyR4LxYf.js","assets/rolldown-runtime-hePW80VL.js","assets/firebase-auth-1RY9I8sQ.js","assets/firebase-core-D2xRA_Rs.js","assets/app-Du1G9lkK.css"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-hePW80VL.js";import{U as t,W as n,X as r,a as i,b as a,d as o,g as s,h as c,i as l,it as u,j as d,l as f,nt as p,o as m,r as h,s as g,v as _}from"./app-CyR4LxYf.js";var{db:v,sdk:y}=r,b=e=>e.docs.map(e=>({id:e.id,...e.data()}));function x(){return{}}function S(e=[]){let t=x(),n=new Map;for(let t of e)t?.id&&n.set(t.id,{...t});for(let[e,r]of Object.entries(t)){if(!r||typeof r!=`object`)continue;let t=r.id||e;if(r.deleted){if(n.delete(t),r.email)for(let[e,t]of n.entries())String(t.email||``).toLowerCase()===String(r.email).toLowerCase()&&n.delete(e);continue}let i=n.has(t)?t:null;if(!i&&r.email){for(let[e,t]of n.entries())if(String(t.email||``).toLowerCase()===String(r.email).toLowerCase()){i=e;break}}if(i){let e=n.get(i);n.set(i,{...e,...r,id:i})}else r.email&&n.set(t,{id:t,...r})}return Array.from(n.values())}async function C(){let{collection:e,getDocs:t}=y.firestore;try{let[n,r,i]=await Promise.all([t(e(v,`users`)).catch(e=>(console.warn(`[Admin Dashboard] Users read restricted:`,e.message),{docs:[]})),t(e(v,`orders`)).catch(e=>(console.warn(`[Admin Dashboard] Orders read restricted:`,e.message),{docs:[]})),t(e(v,`products`)).catch(e=>(console.warn(`[Admin Dashboard] Products read restricted:`,e.message),{docs:[]}))]),a=b(r).sort((e,t)=>{let n=e=>e.createdAt?.seconds?e.createdAt.seconds*1e3:typeof e.createdAt==`string`||typeof e.createdAt==`number`?new Date(e.createdAt).getTime():0;return n(t)-n(e)});return{users:S(b(n)),orders:a,products:b(i)}}catch(e){return console.warn(`[Admin Dashboard] Graceful fallback on unexpected error:`,e.message),{users:S([]),orders:sharedOrders,products:[]}}}async function w(e,t){if(!e)throw Error(`Mã người dùng không hợp lệ.`);let n={name:String(t.name||``).trim(),phone:String(t.phone||``).trim(),address:String(t.address||``).trim(),...t.role&&[`super_admin`,`admin`,`staff`,`customer`].includes(t.role)?{role:t.role}:{}},r=x();r[e]={...r[e]||{},id:e,...n,deleted:!1,updatedAtIso:new Date().toISOString()};try{let{doc:t,serverTimestamp:r,setDoc:i}=y.firestore;await i(t(v,`users`,e),{...n,updatedAt:r()},{merge:!0})}catch(e){console.warn(`[Admin Users] Firestore saveAdminUser fallback to local override:`,e.message)}}async function T(e,t){let n=e=>String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``),r=e||n(t.id);if(!r)throw Error(`Mã sản phẩm không hợp lệ.`);let i=Number(t.price);if(!Number.isFinite(i)||i<0)throw Error(`Giá bán không hợp lệ.`);let a=String(t.brand||``).trim(),o=String(t.name||``).trim();if(!a||!o)throw Error(`Tên và thương hiệu là bắt buộc.`);let{doc:s,serverTimestamp:c,setDoc:l}=y.firestore;await l(s(v,`products`,r),{name:o,slug:t.slug?n(t.slug):n(o),brand:a,brandSlug:n(a),price:i,originalPrice:Number(t.originalPrice)||0,volume:String(t.volume||``).trim(),stepType:String(t.stepType||`special`),category:String(t.category||t.stepType||``),line:String(t.line||``).trim(),image:String(t.image||``).trim(),uses:String(t.uses||``).trim(),seoTitle:String(t.seoTitle||o).trim(),seoDescription:String(t.seoDescription||t.uses||``).trim(),ogImage:String(t.ogImage||t.image||``).trim(),imageAlt:String(t.imageAlt||o).trim(),canonicalUrl:String(t.canonicalUrl||``).trim(),robotsMeta:String(t.robotsMeta||`index_follow`).trim(),updatedAt:c(),...e?{}:{createdAt:c(),tier:`Essential`,mainActives:[],keyActives:[],skinTypes:[`all`],targetConcerns:[]}},{merge:!0});try{let{refreshProductCatalog:e}=await p(async()=>{let{refreshProductCatalog:e}=await import(`./app-CyR4LxYf.js`).then(e=>e.F);return{refreshProductCatalog:e}},__vite__mapDeps([0,1,2,3,4]));await e(!0)}catch{}return r}function E(e,t){let{doc:n,serverTimestamp:r,updateDoc:i}=y.firestore;return i(n(v,`orders`,e),{...t,updatedAt:r()})}async function D(e){await y.firestore.deleteDoc(y.firestore.doc(v,`products`,e));try{let{refreshProductCatalog:e}=await p(async()=>{let{refreshProductCatalog:e}=await import(`./app-CyR4LxYf.js`).then(e=>e.F);return{refreshProductCatalog:e}},__vite__mapDeps([0,1,2,3,4]));await e(!0)}catch{}}async function O(e){if(!e)throw Error(`Mã người dùng không hợp lệ.`);let t=x();t[e]={...t[e]||{},id:e,deleted:!0,updatedAtIso:new Date().toISOString()};try{await y.firestore.deleteDoc(y.firestore.doc(v,`users`,e))}catch(e){console.warn(`[Admin Users] Firestore deleteUserAccount fallback to local override:`,e.message)}return d(`/admin/users/${encodeURIComponent(e)}`,{method:`DELETE`}).catch(()=>({ok:!0}))}async function k(e){let t=typeof e==`object`&&e?e:null,n=t?t.id:String(e||``);if(!n)throw Error(`Mã đơn hàng không hợp lệ.`);return d(`/admin/orders/${encodeURIComponent(n)}/resync-s3`,{method:`POST`})}async function A(e=[]){let t=e.filter(e=>e.s3SyncStatus!==`synced`),n=0,r=0;for(let e of t)try{await k(e),n++}catch(t){console.warn(`[Batch S3 Sync] Order #${e.id} failed:`,t.message),r++}return{total:t.length,successCount:n,failCount:r}}var j=[`super_admin`,`admin`,`editor`,`marketing`,`sales`,`dermatologist`,`warehouse`,`customer`];async function M(e,t,n={}){if(!e)throw Error(`Mã người dùng không hợp lệ.`);if(!j.includes(t))throw Error(`Vai trò không hợp lệ.`);let r=!1;try{let n=await d(`/admin/staff/roles`,{method:`POST`,body:JSON.stringify({uid:e,role:t})});n&&n.success&&(r=!0)}catch(e){console.warn(`[Admin Staff API] Worker endpoint not available, falling back:`,e.message)}let i=x();if(i[e]={...i[e]||{},...n&&typeof n==`object`?n:{},id:e,role:t,deleted:!1,updatedAtIso:new Date().toISOString()},!r)try{let{doc:n,serverTimestamp:r,setDoc:i}=y.firestore;await i(n(v,`users`,e),{role:t,updatedAt:r()},{merge:!0})}catch(e){console.warn(`[Admin Users] Firestore updateUserRole fallback to local override:`,e.message)}}async function N(e,t=`admin`,n=``){let r=String(e||``).trim().toLowerCase();if(!r||!r.includes(`@`))throw Error(`Vui lòng nhập địa chỉ email hợp lệ.`);if(!j.includes(t))throw Error(`Vai trò không hợp lệ.`);let i=`member_${r.replace(/[^a-z0-9]/g,`_`)}`,a=String(n||``).trim()||r.split(`@`)[0],o=x(),s=i;for(let[e,t]of Object.entries(o))if(String(t?.email||``).toLowerCase()===r){s=e;break}o[s]={...o[s]||{},id:o[s]?.id||s,email:r,name:a,role:t,isPreassigned:!0,deleted:!1,updatedAtIso:new Date().toISOString()};try{let{collection:e,getDocs:n,query:c,where:l,doc:u,setDoc:d,serverTimestamp:f}=y.firestore,p=await n(c(e(v,`users`),l(`email`,`==`,r)));if(!p.empty){let e=p.docs[0];return o[e.id]={...o[s],id:e.id},s!==e.id&&delete o[s],await M(e.id,t,{name:a}),{isNew:!1,id:e.id,email:r,role:t}}return await d(u(v,`users`,i),{email:r,name:a,role:t,isPreassigned:!0,createdAt:f(),updatedAt:f()},{merge:!0}),{isNew:!0,id:i,email:r,role:t}}catch(e){return console.warn(`[Admin Users] Firestore assignAdminByEmail fallback to local override:`,e.message),{isNew:!0,id:s,email:r,role:t}}}async function ee(){try{let e=await d(`/admin/audit-logs`);if(e?.logs)return e.logs}catch(e){console.warn(`[Admin Audit Logs] API fetch failed, querying Firestore:`,e.message)}try{let{collection:e,getDocs:t,query:n,orderBy:r,limit:i}=y.firestore;return b(await t(n(e(v,`auditLogs`),r(`createdAt`,`desc`),i(50))))}catch(e){return console.warn(`[Admin Audit Logs] Firestore direct query failed:`,e.message),[]}}async function te(){let[e,t]=await Promise.all([o().catch(()=>[]),g().catch(()=>null)]);return{vouchers:e||[],campaign:t}}async function ne(e,t){let n=typeof e==`object`&&e?e:{...t||{},code:e};return await a(n)}async function re(e){return await i(e)}async function ie(e){return await s(e)}async function ae(){return await m()}async function P(e,t){let n=typeof e==`object`&&e?e:{...t||{},id:e};return await c(n)}async function F(e){return await h(e)}var{db:I,sdk:L}=r;async function R({action:e,module:t,targetId:n,targetName:r,actorEmail:i,details:a}){try{let{collection:o,addDoc:s,serverTimestamp:c}=L.firestore;await s(o(I,`auditLogs`),{action:e,module:t||`OPERATIONS`,targetId:n||``,targetName:r||``,actorEmail:i||`system`,details:a||``,createdAt:c(),createdAtIso:new Date().toISOString()})}catch(e){console.warn(`[Audit Log] Failed to record event:`,e.message)}}var z={pending:[`confirmed`,`cancelled`],confirmed:[`packing`,`cancelled`],packing:[`shipping`,`cancelled`],shipping:[`delivered`,`delivery_failed`],delivered:[`completed`,`returned`],completed:[],delivery_failed:[`shipping`,`returned`,`cancelled`],returned:[`refunded`],refunded:[],cancelled:[]},B={pending:`Chờ xác nhận`,confirmed:`Đã xác nhận`,packing:`Đang đóng gói`,shipping:`Đang giao hàng`,delivered:`Đã giao hàng`,completed:`Hoàn tất`,delivery_failed:`Giao thất bại`,returned:`Khách trả hàng`,refunded:`Đã hoàn tiền`,cancelled:`Đã hủy đơn`};function V(e){if(!e)return``;let t=e.id?.startsWith(`#`)?e.id:`#${e.id||`ORD`}`,n=e.createdAt?.seconds?new Date(e.createdAt.seconds*1e3).toLocaleString(`vi-VN`):e.createdAt?new Date(e.createdAt).toLocaleString(`vi-VN`):new Date().toLocaleString(`vi-VN`),r=e.customer||{},i=Array.isArray(e.items)&&e.items.length>0?e.items:[{name:e.note||`Combo chăm sóc da tiêu chuẩn`,quantity:1,price:e.total||0}],a=e=>new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0),o=e.paymentStatus===`paid`,s=o?0:e.total||0;return`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Phiếu Giao Hàng - ${t}</title>
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
      <div class="order-code">${t}</div>
      <div style="font-size: 9px; color: #64748b;">${n}</div>
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
      <p><strong>${r.name||`Khách hàng SkinID`}</strong></p>
      <p>SĐT: <strong>${r.phone||`Chưa cung cấp`}</strong></p>
      <p>Địa chỉ: ${r.address||`Giao tại quầy`}</p>
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
      ${i.map((t,n)=>`
        <tr>
          <td class="text-center">${n+1}</td>
          <td>
            <strong>${t.name||t.title||t.sku||`Sản phẩm SkinID`}</strong>
            ${t.sku?`<div style="font-size: 8px; color: #64748b; font-family: monospace;">SKU: ${t.sku}</div>`:``}
          </td>
          <td class="text-center"><strong>${t.quantity||1}</strong></td>
          <td class="text-right">${a(t.price||e.total/(t.quantity||1))}</td>
          <td class="text-right font-bold">${a((t.price||e.total/(t.quantity||1))*(t.quantity||1))}</td>
        </tr>
      `).join(``)}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="totals-row">
      <span>Tạm tính hàng hóa:</span>
      <span>${a(e.subtotal||e.total)}</span>
    </div>
    ${e.discount?`
      <div class="totals-row" style="color: #be185d;">
        <span>Giảm giá (Voucher):</span>
        <span>-${a(e.discount)}</span>
      </div>
    `:``}
    <div class="totals-row">
      <span>Phí vận chuyển:</span>
      <span>${e.shippingFee?a(e.shippingFee):`0 ₫ (Freeship)`}</span>
    </div>
    <div class="totals-row grand-total">
      <span>TỔNG TIỀN ĐƠN HÀNG:</span>
      <span>${a(e.total)}</span>
    </div>
  </div>

  <div class="payment-notice">
    ${o?`
      <span style="color: #059669; font-weight: bold; font-size: 11px;">✓ ĐÃ THANH TOÁN CHUYỂN KHOẢN (VIETQR / THẺ)</span>
      <div style="font-size: 10px; color: #047857; margin-top: 2px;">Nhân viên giao nhận KHÔNG THU THÊM BẤT KỲ KHOẢN TIỀN NÀO.</div>
    `:`
      <span style="color: #dc2626; font-size: 10px; font-weight: bold;">HÌNH THỨC THU TIỀN KHI NHẬN HÀNG (COD)</span>
      <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px;">
        SỐ TIỀN CẦN THU: ${a(s)}
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
</html>`}function H(e=[],t=`BÁO CÁO QUẢN TRỊ ĐƠN HÀNG SKINID.VN`){let n=new Date().toLocaleString(`vi-VN`),r=e.filter(e=>e.status!==`cancelled`),i=r.reduce((e,t)=>e+(Number(t.total)||0),0),a=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),o=e=>Number(e)||0,s=e.map((e,t)=>{let n=t%2==1?`ZebraRow`:`DataRow`,r=e.createdAt?.seconds?new Date(e.createdAt.seconds*1e3).toLocaleDateString(`vi-VN`):e.createdAt?new Date(e.createdAt).toLocaleDateString(`vi-VN`):``,i=e.customer||{},s=(e.items||[]).map(e=>`${e.quantity||1}x ${e.name||e.title||e.sku}`).join(`; `)||e.note||`Combo SkinID`,c=e.paymentStatus===`paid`?`Đã thanh toán`:e.paymentStatus===`refunded`?`Hoàn tiền`:`Chưa thanh toán`,l=B[e.status]||e.status||`Chờ xử lý`;return`
      <Row ss:StyleID="${n}">
        <Cell ss:StyleID="${n}Center"><Data ss:Type="Number">${t+1}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(e.id)}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(r)}</Data></Cell>
        <Cell ss:StyleID="${n}Left"><Data ss:Type="String">${a(i.name||`Khách vãng lai`)}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(i.phone||``)}</Data></Cell>
        <Cell ss:StyleID="${n}Left"><Data ss:Type="String">${a(i.address||``)}</Data></Cell>
        <Cell ss:StyleID="${n}Left"><Data ss:Type="String">${a(s)}</Data></Cell>
        <Cell ss:StyleID="${n}Currency"><Data ss:Type="Number">${o(e.total)}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(c)}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(l)}</Data></Cell>
        <Cell ss:StyleID="${n}Center"><Data ss:Type="String">${a(e.s3SyncStatus===`synced`?`Đã đồng bộ S3`:e.s3SyncStatus===`failed`?`Lỗi S3`:`Chờ đồng bộ`)}</Data></Cell>
      </Row>
    `}).join(``);return`<?xml version="1.0" encoding="UTF-8"?>
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
    <Cell ss:MergeAcross="10" ss:StyleID="TitleBanner"><Data ss:Type="String">${a(t)}</Data></Cell>
   </Row>

   <!-- Tầng 2: Metadata -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="10" ss:StyleID="SubBanner"><Data ss:Type="String">Đơn vị: CÔNG TY TNHH FIELDMAN • Xuất lúc: ${a(n)} • Tổng đơn: ${e.length} (Hợp lệ: ${r.length})</Data></Cell>
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
   ${s}

   <!-- Tầng 6: Total Summary -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="TotalLabel"><Data ss:Type="String">TỔNG CỘNG DOANH THU (KHÔNG TÍNH ĐƠN HỦY):</Data></Cell>
    <Cell ss:StyleID="TotalSummary"><Data ss:Type="Number">${o(i)}</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TotalLabel"><Data ss:Type="String">${r.length} ĐƠN THÀNH CÔNG</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`}var U={VIP:{label:`Khách hàng VIP`,badge:`bg-amber-100 text-amber-900 border-amber-300 font-bold`,desc:`Chi tiêu cao (≥ 5 triệu) hoặc ≥ 5 đơn hàng`},RETURNING:{label:`Khách quay lại`,badge:`bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold`,desc:`Có từ 2 đơn hàng thành công trở lên`},NEW:{label:`Khách hàng mới`,badge:`bg-emerald-100 text-emerald-900 border-emerald-300 font-medium`,desc:`Có 1 đơn hàng hoặc mới đăng ký < 30 ngày`},PROSPECT:{label:`Tiềm năng (Đã soi da)`,badge:`bg-rose-100 text-rose-900 border-rose-300 font-semibold`,desc:`Đã thực hiện soi da AI nhưng chưa đặt đơn`},AT_RISK:{label:`Nguy cơ rời bỏ`,badge:`bg-slate-200 text-slate-700 border-slate-300 font-medium`,desc:`Đơn hàng gần nhất cách đây hơn 90 ngày`}};function W(e,t=[],n=[]){if(!e)return null;let r=e.id||e.uid,i=(e.email||``).toLowerCase().trim(),a=(e.phone||``).replace(/[\s.-]/g,``),o=t.filter(e=>!!(e.userId&&e.userId===r||i&&e.customer?.email&&e.customer.email.toLowerCase().trim()===i||a&&e.customer?.phone&&e.customer.phone.replace(/[\s.-]/g,``)===a)),s=o.filter(e=>e.status!==`cancelled`),c=o.filter(e=>e.status===`cancelled`),l=s.reduce((e,t)=>e+(Number(t.total)||0),0),u=s.length,d=u>0?Math.round(l/u):0,f=null;s.length>0&&(f=[...s].sort((e,t)=>{let n=e=>e.createdAt?.seconds?e.createdAt.seconds*1e3:new Date(e.createdAt||0).getTime();return n(t)-n(e)})[0].createdAt);let p=n.filter(e=>e.userId===r||i&&e.email===i),m=`NEW`,h=Date.now(),g=7776e6,_=f?.seconds?f.seconds*1e3:f?new Date(f).getTime():0;return m=l>=5e6||u>=5?`VIP`:u>=2?_>0&&h-_>g?`AT_RISK`:`RETURNING`:u===1?_>0&&h-_>g?`AT_RISK`:`NEW`:p.length>0?`PROSPECT`:`NEW`,{user:e,orders:o,validOrders:s,cancelledCount:c.length,skinReports:p,totalSpent:l,orderCount:u,avgOrderValue:d,lastOrderDate:f,rfmSegment:U[m]||U.NEW,rfmKey:m}}async function G(e,t={}){if(!e)throw Error(`Cần cung cấp mã người dùng.`);let{doc:n,getDoc:r,setDoc:i,collection:a,query:o,where:s,getDocs:c,serverTimestamp:l}=L.firestore,u=n(I,`users`,e),d=await r(u);if(!d.exists())throw Error(`Không tìm thấy tài khoản người dùng.`);let f=d.data(),p=`[Đã ẩn danh theo yêu cầu]`;await i(u,{name:p,phone:`[Đã ẩn danh]`,address:`[Đã ẩn danh]`,picture:null,isAnonymized:!0,anonymizedAt:l(),anonymizedBy:t.email||`Admin`},{merge:!0});try{let t=await c(o(a(I,`orders`),s(`userId`,`==`,e)));for(let e of t.docs)await i(n(I,`orders`,e.id),{customer:{name:p,phone:`[Đã ẩn danh]`,address:`[Đã ẩn danh]`},anonymized:!0,updatedAt:l()},{merge:!0})}catch(e){console.warn(`[Anonymize] Orders update partial warning:`,e.message)}return await R({action:`ANONYMIZE_CUSTOMER`,module:`CRM_PRIVACY`,targetId:e,targetName:f.name||f.email,actorEmail:t.email||`Admin`,details:`Ẩn danh hóa PII người dùng theo Luật BV Dữ liệu cá nhân, giữ nguyên số liệu kế toán.`}).catch(()=>{}),{success:!0,message:`Đã ẩn danh hóa tài khoản và bảo toàn số liệu đơn hàng.`}}function K({count:e=10,prefix:t=`SKINID-`,discountType:n=`percent`,discountValue:r=10,minOrderValue:i=3e5,expiresAt:a=null,maxUses:o=1}){let s=[];for(let c=0;c<e;c++){let e=``;for(let t=0;t<6;t++)e+=`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`.charAt(Math.floor(Math.random()*32));let c=`${t.trim().toUpperCase()}${e}`;s.push({code:c,discountType:n,discountValue:Number(r)||10,minOrderValue:Number(i)||0,maxUses:Number(o)||1,usedCount:0,active:!0,expiresAt:a||null,isBulkGenerated:!0,createdAtIso:new Date().toISOString()})}return s}var q=e(u()),J={users:[],orders:[],products:[]};function oe(){let{user:e,role:n,isSuperAdmin:r,isAdmin:i,isStaff:a,isLoading:o}=t(),[s,c]=(0,q.useState)(J),[l,u]=(0,q.useState)(!0),[d,f]=(0,q.useState)(``),p=(0,q.useRef)(!1),m=(0,q.useCallback)(async()=>{if(!i&&!a)return J;p.current||u(!0),f(``);try{let e=await C();return c(e),p.current=!0,e}catch(e){throw f(e.message||`Không thể tải dữ liệu quản trị.`),e}finally{u(!1)}},[i,a]);return(0,q.useEffect)(()=>{if(!o){if(!i&&!a){u(!1),c(J);return}m().catch(()=>void 0)}},[o,i,a,m]),{user:e,role:n,isSuperAdmin:r,isAdmin:i,isStaff:a,authLoading:o,...s,loading:l,error:d,refresh:m}}function se(e,t=18e5){let n=(0,q.useRef)(null);(0,q.useEffect)(()=>{if(typeof window>`u`||typeof e!=`function`)return;function r(){n.current&&clearTimeout(n.current),n.current=setTimeout(()=>{console.warn(`[Admin Security] Phiên làm việc đã hết hạn do không có thao tác trong 30 phút.`),e()},t)}let i=[`mousemove`,`mousedown`,`keydown`,`scroll`,`touchstart`];for(let e of i)window.addEventListener(e,r,{passive:!0});return r(),()=>{n.current&&clearTimeout(n.current);for(let e of i)window.removeEventListener(e,r)}},[e,t])}async function ce(e,{maxWidth:t=1200,maxHeight:n=1200,quality:r=.85}={}){if(!e||!e.type.startsWith(`image/`))throw Error(`Vui lòng chọn một file hình ảnh hợp lệ (PNG, JPG, WEBP).`);if(e.size>5242880)throw Error(`Dung lượng ảnh gốc không được vượt quá 5MB.`);return new Promise((i,a)=>{let o=new FileReader;o.onerror=()=>a(Error(`Không thể đọc file ảnh.`)),o.onload=o=>{let s=new Image;s.onerror=()=>a(Error(`File ảnh bị lỗi hoặc không hỗ trợ.`)),s.onload=()=>{let a=s.width,o=s.height;if(a>t||o>n){let e=Math.min(t/a,n/o);a=Math.round(a*e),o=Math.round(o*e)}let c=document.createElement(`canvas`);c.width=a,c.height=o;let l=c.getContext(`2d`);l.imageSmoothingEnabled=!0,l.imageSmoothingQuality=`high`,l.drawImage(s,0,0,a,o);let u=c.toDataURL(`image/webp`,r);i({dataUrl:u,width:a,height:o,fileName:e.name.replace(/\.[^.]+$/,`.webp`),sizeEstimateBytes:Math.round(u.length*3/4)})},s.src=o.target.result},o.readAsDataURL(e)})}var Y=n();function le({value:e,onChange:t,label:n=`Hình ảnh sản phẩm / bài viết`,helpText:r=`Khuyến nghị ảnh vuông hoặc tỉ lệ 4:3, tối đa 5MB. Hệ thống tự động tối ưu hóa WebP.`,previewHeight:i=`h-40`}){let a=(0,q.useRef)(null),[o,s]=(0,q.useState)(!1),[c,l]=(0,q.useState)(``),[u,d]=(0,q.useState)(!1),f=async e=>{if(e){l(``),s(!0);try{t((await ce(e)).dataUrl)}catch(e){l(e.message||`Lỗi khi xử lý hình ảnh`)}finally{s(!1)}}};return(0,Y.jsxs)(`div`,{className:`space-y-2`,children:[(0,Y.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,Y.jsx)(`label`,{className:`text-xs font-bold text-slate-800 uppercase tracking-wider`,children:n}),e&&(0,Y.jsx)(`button`,{type:`button`,onClick:()=>t(``),className:`text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer`,children:`Xóa ảnh`})]}),(0,Y.jsxs)(`div`,{onDragOver:e=>{e.preventDefault(),d(!0)},onDragLeave:()=>d(!1),onDrop:e=>{e.preventDefault(),d(!1);let t=e.dataTransfer.files?.[0];t&&f(t)},className:`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center ${u?`border-[#D04862] bg-rose-50/50`:`border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300`}`,children:[(0,Y.jsx)(`input`,{ref:a,type:`file`,accept:`image/*`,className:`hidden`,onChange:e=>{let t=e.target.files?.[0];t&&f(t)}}),e?(0,Y.jsxs)(`div`,{className:`relative group w-full flex flex-col items-center`,children:[(0,Y.jsx)(`div`,{className:`${i} w-full max-w-xs rounded-xl overflow-hidden bg-white border border-stone-200 p-2 flex items-center justify-center shadow-2xs`,children:(0,Y.jsx)(`img`,{src:e,alt:`Preview`,className:`max-h-full max-w-full object-contain`})}),(0,Y.jsx)(`div`,{className:`mt-3 flex items-center gap-2`,children:(0,Y.jsx)(`button`,{type:`button`,onClick:()=>a.current?.click(),className:`px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-50 cursor-pointer shadow-2xs`,children:`Đổi ảnh khác`})})]}):(0,Y.jsxs)(`div`,{className:`py-4 flex flex-col items-center`,children:[(0,Y.jsx)(`div`,{className:`w-12 h-12 rounded-2xl bg-rose-50 text-[#D04862] flex items-center justify-center mb-3`,children:(0,Y.jsx)(`svg`,{className:`w-6 h-6`,fill:`none`,stroke:`currentColor`,viewBox:`0 0 24 24`,children:(0,Y.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`2`,d:`M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z`})})}),(0,Y.jsx)(`p`,{className:`text-xs font-semibold text-slate-700 mb-1`,children:`Kéo thả file ảnh vào đây hoặc`}),(0,Y.jsx)(`button`,{type:`button`,onClick:()=>a.current?.click(),className:`px-4 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs`,children:`Chọn ảnh từ máy`}),(0,Y.jsx)(`span`,{className:`text-[11px] text-slate-400 mt-2`,children:r})]}),o&&(0,Y.jsx)(`div`,{className:`absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-2xl flex items-center justify-center`,children:(0,Y.jsx)(`span`,{className:`text-xs font-bold text-[#D04862] animate-pulse`,children:`Đang nén & tải ảnh...`})})]}),(0,Y.jsx)(`div`,{className:`pt-1`,children:(0,Y.jsx)(`div`,{className:`flex items-center gap-2`,children:(0,Y.jsx)(`input`,{type:`text`,value:e||``,onChange:e=>t(e.target.value),placeholder:`Hoặc nhập đường dẫn URL ảnh (VD: /images/products/... hoặc https://...)`,className:`flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:border-rose-400 font-mono text-slate-700`})})}),c&&(0,Y.jsx)(`p`,{className:`text-xs text-rose-600 font-medium`,children:c})]})}function ue({isOpen:e,onClose:t,onSelect:n,currentUrl:r=``}){let[i,a]=(0,q.useState)([]),[o,s]=(0,q.useState)(!1),[c,u]=(0,q.useState)(``),[d,p]=(0,q.useState)(``),[m,h]=(0,q.useState)(``),[g,v]=(0,q.useState)(!1),[y,b]=(0,q.useState)(``);if((0,q.useEffect)(()=>{e&&(s(!0),f().then(e=>a(e||[])).catch(e=>b(e.message)).finally(()=>s(!1)))},[e]),!e)return null;let x=async e=>{if(e.preventDefault(),!d.trim())return b(`Vui lòng nhập đường dẫn hình ảnh.`);if(!m.trim())return b(`Bắt buộc nhập văn bản thay thế (Alt text) chuẩn SEO.`);v(!0),b(``);try{let e=await _({url:d.trim(),alt:m.trim(),name:m.trim().slice(0,40)});a(t=>[e,...t]),p(``),h(``)}catch(e){b(e.message||`Lưu ảnh thất bại.`)}finally{v(!1)}},S=async(e,t)=>{if(t.stopPropagation(),window.confirm(`Bạn có chắc muốn xóa ảnh này khỏi thư viện?`))try{await l(e),a(t=>t.filter(t=>t.id!==e))}catch(e){alert(e.message||`Xóa ảnh thất bại.`)}},C=i.filter(e=>{if(!c.trim())return!0;let t=c.toLowerCase();return(e.name||``).toLowerCase().includes(t)||(e.alt||``).toLowerCase().includes(t)||(e.url||``).toLowerCase().includes(t)});return(0,Y.jsx)(`div`,{className:`fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto`,role:`dialog`,"aria-modal":`true`,children:(0,Y.jsxs)(`div`,{className:`w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]`,children:[(0,Y.jsxs)(`div`,{className:`px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`span`,{className:`text-[10px] font-extrabold uppercase tracking-widest text-[#BD3F5B]`,children:`Tài nguyên số & Hình ảnh`}),(0,Y.jsx)(`h2`,{className:`text-lg font-bold text-slate-900 tracking-tight`,children:`Thư viện Ảnh (Media Storage)`})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`w-8 h-8 rounded-full border border-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer`,children:`✕`})]}),(0,Y.jsxs)(`div`,{className:`p-6 overflow-y-auto flex-1 space-y-6`,children:[y&&(0,Y.jsx)(`div`,{className:`p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium`,children:y}),(0,Y.jsxs)(`form`,{onSubmit:x,className:`p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3`,children:[(0,Y.jsx)(`span`,{className:`text-xs font-bold text-slate-800`,children:`Thêm hình ảnh mới vào Thư viện`}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 gap-3`,children:[(0,Y.jsxs)(`label`,{className:`block text-xs font-semibold text-slate-700`,children:[`Đường dẫn hình ảnh (URL / Asset path) *`,(0,Y.jsx)(`input`,{type:`text`,placeholder:`/images/banners/... hoặc https://...`,value:d,onChange:e=>p(e.target.value),className:`mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#E06D81]/20 focus:border-[#E06D81]`})]}),(0,Y.jsxs)(`label`,{className:`block text-xs font-semibold text-slate-700`,children:[`Văn bản thay thế (Alt text chuẩn SEO) *`,(0,Y.jsx)(`input`,{type:`text`,placeholder:`Mô tả nội dung bức ảnh...`,value:m,onChange:e=>h(e.target.value),className:`mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E06D81]/20 focus:border-[#E06D81]`})]})]}),(0,Y.jsx)(`div`,{className:`flex justify-end`,children:(0,Y.jsx)(`button`,{type:`submit`,disabled:g,className:`btn-luxury-primary text-xs flex items-center gap-2`,children:g?`Đang lưu...`:`+ Thêm vào Thư viện`})})]}),(0,Y.jsxs)(`div`,{className:`flex items-center justify-between gap-4`,children:[(0,Y.jsx)(`input`,{type:`text`,placeholder:`Tìm kiếm hình ảnh theo tên, alt text...`,value:c,onChange:e=>u(e.target.value),className:`w-full max-w-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#E06D81]`}),(0,Y.jsxs)(`span`,{className:`text-xs text-slate-400 font-medium whitespace-nowrap`,children:[`Tổng `,C.length,` hình ảnh`]})]}),o?(0,Y.jsx)(`div`,{className:`py-12 text-center text-slate-400 text-xs font-medium`,children:`Đang tải thư viện ảnh...`}):C.length===0?(0,Y.jsx)(`div`,{className:`py-12 text-center text-slate-400 text-xs`,children:`Không có hình ảnh nào phù hợp.`}):(0,Y.jsx)(`div`,{className:`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4`,children:C.map(e=>{let i=r===e.url;return(0,Y.jsxs)(`div`,{onClick:()=>{n(e),t()},className:`group relative rounded-2xl border overflow-hidden cursor-pointer transition hover:shadow-md ${i?`border-[#BD3F5B] ring-2 ring-[#BD3F5B]/30`:`border-slate-200 hover:border-slate-300`}`,children:[(0,Y.jsx)(`div`,{className:`aspect-video bg-slate-100 flex items-center justify-center overflow-hidden`,children:(0,Y.jsx)(`img`,{src:e.url,alt:e.alt||`Ảnh`,className:`w-full h-full object-cover group-hover:scale-105 transition duration-300`,onError:e=>{e.target.src=`/og-image.jpg`}})}),(0,Y.jsxs)(`div`,{className:`p-2.5 bg-white`,children:[(0,Y.jsx)(`p`,{className:`text-[11px] font-semibold text-slate-800 truncate`,title:e.alt||e.name,children:e.alt||e.name||`Ảnh không tên`}),(0,Y.jsx)(`p`,{className:`text-[10px] text-slate-400 font-mono truncate mt-0.5`,title:e.url,children:e.url})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:t=>S(e.id,t),title:`Xóa khỏi thư viện`,className:`absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-rose-600 border border-rose-200/70 shadow-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-rose-50`,children:`✕`})]},e.id)})})]}),(0,Y.jsx)(`div`,{className:`px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end`,children:(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`btn-luxury-secondary text-xs`,children:`Đóng`})})]})})}function de({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M12 8v4l3 3`}),(0,Y.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9`}),(0,Y.jsx)(`path`,{d:`M12 3a9 9 0 0 0-9 9`})]})}function fe({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`rect`,{width:`7`,height:`9`,x:`3`,y:`3`,rx:`1.5`}),(0,Y.jsx)(`rect`,{width:`7`,height:`5`,x:`14`,y:`3`,rx:`1.5`}),(0,Y.jsx)(`rect`,{width:`7`,height:`9`,x:`14`,y:`12`,rx:`1.5`}),(0,Y.jsx)(`rect`,{width:`7`,height:`5`,x:`3`,y:`16`,rx:`1.5`})]})}function pe({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`m7.5 4.27 9 5.15`}),(0,Y.jsx)(`path`,{d:`M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z`}),(0,Y.jsx)(`path`,{d:`m3.3 7 8.7 5 8.7-5`}),(0,Y.jsx)(`path`,{d:`M12 22V12`})]})}function me({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z`}),(0,Y.jsx)(`circle`,{cx:`7.5`,cy:`7.5`,r:`.5`,fill:`currentColor`})]})}function he({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z`}),(0,Y.jsx)(`path`,{d:`M6 6h10`}),(0,Y.jsx)(`path`,{d:`M6 10h10`}),(0,Y.jsx)(`path`,{d:`M6 14h6`})]})}function ge({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z`}),(0,Y.jsx)(`path`,{d:`M3 6h18`}),(0,Y.jsx)(`path`,{d:`M16 10a4 4 0 0 1-8 0`})]})}function _e({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`}),(0,Y.jsx)(`circle`,{cx:`9`,cy:`7`,r:`4`}),(0,Y.jsx)(`path`,{d:`M22 21v-2a4 4 0 0 0-3-3.87`}),(0,Y.jsx)(`path`,{d:`M16 3.13a4 4 0 0 1 0 7.75`})]})}function ve({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`}),(0,Y.jsx)(`path`,{d:`m9 12 2 2 4-4`})]})}function ye({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,Y.jsx)(`path`,{d:`m21 21-4.3-4.3`})]})}function be({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`}),(0,Y.jsx)(`path`,{d:`M21 3v5h-5`}),(0,Y.jsx)(`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`}),(0,Y.jsx)(`path`,{d:`M3 21v-5h5`})]})}function xe({className:e=`w-4 h-4`}){return(0,Y.jsx)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,Y.jsx)(`path`,{d:`M13 2 3 14h9l-1 8 10-12h-9l1-8z`})})}function Se({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),(0,Y.jsx)(`polyline`,{points:`7 10 12 15 17 10`}),(0,Y.jsx)(`line`,{x1:`12`,x2:`12`,y1:`15`,y2:`3`})]})}function Ce({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M5 12h14`}),(0,Y.jsx)(`path`,{d:`M12 5v14`})]})}function X({className:e=`w-4 h-4`}){return(0,Y.jsx)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,Y.jsx)(`polyline`,{points:`20 6 9 17 4 12`})})}function Z({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z`}),(0,Y.jsx)(`line`,{x1:`12`,x2:`12`,y1:`9`,y2:`13`}),(0,Y.jsx)(`line`,{x1:`12`,x2:`12.01`,y1:`17`,y2:`17`})]})}function we({className:e=`w-4 h-4`}){return(0,Y.jsx)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,Y.jsx)(`path`,{d:`m6 9 6 6 6-6`})})}function Q({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M15 3h6v6`}),(0,Y.jsx)(`path`,{d:`M10 14 21 3`}),(0,Y.jsx)(`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`})]})}function $({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M18 6 6 18`}),(0,Y.jsx)(`path`,{d:`m6 6 12 12`})]})}function Te({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`line`,{x1:`12`,x2:`12`,y1:`2`,y2:`22`}),(0,Y.jsx)(`path`,{d:`M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6`})]})}function Ee({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M3 6h18`}),(0,Y.jsx)(`path`,{d:`M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6`}),(0,Y.jsx)(`path`,{d:`M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2`})]})}function De({className:e=`w-4 h-4`}){return(0,Y.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,Y.jsx)(`path`,{d:`M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z`}),(0,Y.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`})]})}function Oe({className:e=`w-4 h-4`}){return(0,Y.jsx)(`svg`,{className:e,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,Y.jsx)(`path`,{d:`M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z`})})}function ke({order:e,onClose:t,onUpdateStatus:n,onUpdatePaymentStatus:r,isAdmin:i,isStaff:a}){let[o,s]=(0,q.useState)(e?.internalNote||``),[c,l]=(0,q.useState)(!1),[u,d]=(0,q.useState)(!1);if(!e)return null;let f=e.id?.startsWith(`#`)?e.id:`#${e.id||`ORD`}`,p=e.customer||{},m=e.status||`pending`,h=z[m]||[],g=()=>{let t=V(e),n=window.open(``,`_blank`);n&&(n.document.write(t),n.document.close(),n.focus())},_=e=>new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0),v=(p.phone||``).replace(/[\s.-]/g,``),y=v?`https://zalo.me/${v}`:null,b=v?`tel:${v}`:null;return(0,Y.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150`,children:(0,Y.jsxs)(`div`,{className:`bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden`,children:[(0,Y.jsxs)(`div`,{className:`px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,Y.jsx)(`span`,{className:`font-mono font-bold text-base text-slate-900`,children:f}),(0,Y.jsx)(`span`,{className:`px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-[#BD3F5B] border border-rose-200/60`,children:B[m]||m})]}),(0,Y.jsx)(`p`,{className:`text-xs text-slate-400 mt-0.5`,children:`Chi tiết vận hành & Dòng thời gian đơn hàng`})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer`,children:(0,Y.jsx)($,{className:`w-5 h-5`})})]}),(0,Y.jsxs)(`div`,{className:`p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-600 admin-custom-scroll`,children:[(0,Y.jsxs)(`div`,{className:`p-3 bg-gradient-to-r from-rose-50/50 via-white to-slate-50/60 rounded-2xl border border-rose-100/70 flex flex-wrap items-center justify-between gap-3`,children:[(0,Y.jsxs)(`div`,{className:`flex items-center gap-2`,children:[b&&(0,Y.jsxs)(`a`,{href:b,className:`px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition inline-flex items-center gap-1.5 shadow-2xs`,children:[(0,Y.jsx)(Oe,{className:`w-3.5 h-3.5 text-emerald-600`}),(0,Y.jsxs)(`span`,{children:[`Gọi `,p.phone]})]}),y&&(0,Y.jsx)(`a`,{href:y,target:`_blank`,rel:`noreferrer`,className:`px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 transition inline-flex items-center gap-1.5 shadow-2xs`,children:(0,Y.jsx)(`span`,{children:`Nhắn Zalo`})})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:g,className:`px-3.5 py-1.5 rounded-xl bg-[#BD3F5B] hover:bg-[#a3324b] text-white font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer`,children:(0,Y.jsx)(`span`,{children:`🖨️ In Phiếu Giao Hàng A5`})})]}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 gap-4`,children:[(0,Y.jsxs)(`div`,{className:`p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5`,children:[(0,Y.jsx)(`span`,{className:`font-bold text-[10px] uppercase text-slate-400 tracking-wider block`,children:`Người nhận hàng`}),(0,Y.jsx)(`p`,{className:`font-bold text-sm text-slate-900`,children:p.name||`Khách hàng SkinID`}),(0,Y.jsxs)(`p`,{className:`font-mono text-slate-700`,children:[`SĐT: `,p.phone||`Chưa cung cấp`]}),(0,Y.jsxs)(`p`,{className:`text-slate-500 leading-relaxed`,children:[`Địa chỉ: `,p.address||`Giao tại quầy`]})]}),(0,Y.jsxs)(`div`,{className:`p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5`,children:[(0,Y.jsx)(`span`,{className:`font-bold text-[10px] uppercase text-slate-400 tracking-wider block`,children:`Thanh toán & Kho hàng`}),(0,Y.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,Y.jsx)(`span`,{children:`Tổng tiền:`}),(0,Y.jsx)(`span`,{className:`font-bold font-mono text-slate-900 text-sm`,children:_(e.total)})]}),(0,Y.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,Y.jsx)(`span`,{children:`Trạng thái tiền:`}),(0,Y.jsx)(`span`,{className:`px-2 py-0.5 rounded-full font-bold text-[10px] ${e.paymentStatus===`paid`?`bg-emerald-100 text-emerald-800`:`bg-amber-100 text-amber-800`}`,children:e.paymentStatus===`paid`?`Đã thanh toán`:`Chưa thanh toán (COD)`})]}),(0,Y.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,Y.jsx)(`span`,{children:`S3 POS:`}),(0,Y.jsx)(`span`,{className:`font-bold font-mono text-slate-700`,children:e.s3SyncStatus===`synced`?`Đã đồng bộ (#${String(e.s3OrderId||``).slice(-6)})`:`Chưa đồng bộ`})]})]})]}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`span`,{className:`font-bold text-[11px] uppercase text-slate-700 mb-2 block`,children:`Danh mục sản phẩm trong đơn`}),(0,Y.jsx)(`div`,{className:`border border-slate-100 rounded-xl overflow-hidden`,children:(0,Y.jsxs)(`table`,{className:`w-full text-left text-xs`,children:[(0,Y.jsx)(`thead`,{className:`bg-slate-50 text-slate-400 font-bold uppercase text-[10px]`,children:(0,Y.jsxs)(`tr`,{children:[(0,Y.jsx)(`th`,{className:`py-2.5 px-3`,children:`Sản phẩm`}),(0,Y.jsx)(`th`,{className:`py-2.5 px-3 text-center`,children:`SL`}),(0,Y.jsx)(`th`,{className:`py-2.5 px-3 text-right`,children:`Đơn giá`}),(0,Y.jsx)(`th`,{className:`py-2.5 px-3 text-right`,children:`Thành tiền`})]})}),(0,Y.jsx)(`tbody`,{className:`divide-y divide-slate-100`,children:(e.items||[]).map((e,t)=>(0,Y.jsxs)(`tr`,{children:[(0,Y.jsx)(`td`,{className:`py-2.5 px-3 font-semibold text-slate-800`,children:e.name||e.title||e.sku}),(0,Y.jsx)(`td`,{className:`py-2.5 px-3 text-center font-bold text-[#BD3F5B]`,children:e.quantity||1}),(0,Y.jsx)(`td`,{className:`py-2.5 px-3 text-right font-mono text-slate-600`,children:_(e.price||0)}),(0,Y.jsx)(`td`,{className:`py-2.5 px-3 text-right font-mono font-bold text-slate-900`,children:_((e.price||0)*(e.quantity||1))})]},t))})]})})]}),(0,Y.jsxs)(`div`,{className:`p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3`,children:[(0,Y.jsx)(`span`,{className:`font-bold text-xs text-slate-900 block`,children:`Quy trình điều phối trạng thái đơn`}),h.length===0?(0,Y.jsxs)(`p`,{className:`text-xs text-slate-400 italic`,children:[`Đơn hàng đã ở trạng thái kết thúc (`,B[m]||m,`).`]}):(0,Y.jsx)(`div`,{className:`flex flex-wrap gap-2`,children:h.map(t=>(0,Y.jsxs)(`button`,{type:`button`,onClick:()=>n(e.id,{status:t}),className:`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${t===`cancelled`?`bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100`:`bg-slate-900 hover:bg-slate-800 text-white`}`,children:[`→ Chuyển sang: `,B[t]||t]},t))})]}),(0,Y.jsxs)(`div`,{className:`space-y-2`,children:[(0,Y.jsx)(`label`,{className:`font-bold text-xs text-slate-800 block`,children:`Ghi chú nội bộ vận hành (Chỉ CSKH & Admin thấy)`}),(0,Y.jsx)(`textarea`,{value:o,onChange:e=>s(e.target.value),placeholder:`Ghi chú về hẹn giờ giao, tình trạng đóng gói, yêu cầu đặc biệt của khách…`,rows:3,className:`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#BD3F5B] transition`}),(0,Y.jsxs)(`div`,{className:`flex items-center justify-between pt-1`,children:[u?(0,Y.jsxs)(`span`,{className:`text-emerald-600 font-bold text-xs flex items-center gap-1`,children:[(0,Y.jsx)(X,{className:`w-3.5 h-3.5`}),` Đã lưu ghi chú!`]}):(0,Y.jsx)(`span`,{}),(0,Y.jsx)(`button`,{type:`button`,disabled:c,onClick:async()=>{l(!0);try{await n(e.id,{internalNote:o}),d(!0),setTimeout(()=>d(!1),3e3)}finally{l(!1)}},className:`btn-luxury-secondary text-xs px-3.5 py-1.5 cursor-pointer`,children:c?`Đang lưu…`:`Lưu ghi chú nội bộ`})]})]})]}),(0,Y.jsx)(`div`,{className:`px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end`,children:(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`btn-luxury-secondary text-xs px-4 py-2`,children:`Đóng`})})]})})}function Ae({user:e,allOrders:t=[],allSkinReports:n=[],onClose:r,onRefresh:i,actor:a={}}){let[o,s]=(0,q.useState)(!1),[c,l]=(0,q.useState)(!1),[u,d]=(0,q.useState)(null);if(!e)return null;let{totalSpent:f,orderCount:p,avgOrderValue:m,rfmSegment:h,validOrders:g,skinReports:_}=W(e,t,n)||{},v=e=>new Intl.NumberFormat(`vi-VN`,{style:`currency`,currency:`VND`}).format(Number(e)||0);return(0,Y.jsx)(`div`,{className:`fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-200`,children:(0,Y.jsxs)(`div`,{className:`bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 border-l border-slate-200`,children:[(0,Y.jsxs)(`div`,{className:`p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60`,children:[(0,Y.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,Y.jsx)(`div`,{className:`w-10 h-10 rounded-2xl bg-gradient-to-br from-[#BD3F5B] to-[#E06D81] text-white flex items-center justify-center font-bold text-base shadow-sm`,children:(e.name||e.email||`U`).charAt(0).toUpperCase()}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`h3`,{className:`font-bold text-sm text-slate-900`,children:e.name||`Khách hàng SkinID`}),(0,Y.jsx)(`p`,{className:`text-xs text-slate-400 font-mono`,children:e.email||`—`})]})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:r,className:`p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer`,children:(0,Y.jsx)($,{className:`w-5 h-5`})})]}),(0,Y.jsxs)(`div`,{className:`p-6 overflow-y-auto space-y-6 flex-1 text-xs admin-custom-scroll`,children:[(0,Y.jsxs)(`div`,{className:`grid grid-cols-3 gap-3`,children:[(0,Y.jsxs)(`div`,{className:`p-3 bg-rose-50/60 border border-rose-100 rounded-2xl text-center`,children:[(0,Y.jsx)(`span`,{className:`text-[10px] uppercase font-bold text-slate-400 block mb-1`,children:`Hạng thành viên`}),(0,Y.jsx)(`span`,{className:`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${h?.badge||``}`,children:h?.label||`Mới`})]}),(0,Y.jsxs)(`div`,{className:`p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center`,children:[(0,Y.jsx)(`span`,{className:`text-[10px] uppercase font-bold text-slate-400 block mb-1`,children:`Tổng chi tiêu (LTV)`}),(0,Y.jsx)(`span`,{className:`font-bold font-mono text-slate-900 text-xs`,children:v(f)})]}),(0,Y.jsxs)(`div`,{className:`p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center`,children:[(0,Y.jsx)(`span`,{className:`text-[10px] uppercase font-bold text-slate-400 block mb-1`,children:`Đơn thành công`}),(0,Y.jsxs)(`span`,{className:`font-bold text-slate-900 text-xs`,children:[p,` đơn`]})]})]}),(0,Y.jsxs)(`div`,{className:`p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2`,children:[(0,Y.jsx)(`span`,{className:`font-bold text-[11px] uppercase text-slate-700 tracking-wider block`,children:`Thông tin liên hệ`}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 text-slate-600`,children:[(0,Y.jsxs)(`div`,{children:[`Số điện thoại: `,(0,Y.jsx)(`strong`,{className:`text-slate-900 font-mono`,children:e.phone||`—`})]}),(0,Y.jsxs)(`div`,{children:[`Hình thức: `,(0,Y.jsx)(`span`,{className:`font-semibold capitalize`,children:e.provider||`Google`})]}),(0,Y.jsxs)(`div`,{className:`col-span-2`,children:[`Địa chỉ: `,(0,Y.jsx)(`span`,{className:`font-medium text-slate-800`,children:e.address||`Chưa lưu địa chỉ`})]})]})]}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,Y.jsxs)(`span`,{className:`font-bold text-xs uppercase text-slate-700`,children:[`Lịch sử đơn hàng (`,g.length,`)`]}),(0,Y.jsxs)(`span`,{className:`text-[11px] text-slate-400`,children:[`AOV: `,v(m),`/đơn`]})]}),g.length===0?(0,Y.jsx)(`p`,{className:`p-4 text-center bg-slate-50 rounded-xl text-slate-400 border border-slate-100`,children:`Chưa có đơn hàng nào phát sinh.`}):(0,Y.jsx)(`div`,{className:`border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100`,children:g.slice(0,5).map(e=>(0,Y.jsxs)(`div`,{className:`p-3 hover:bg-slate-50/80 flex items-center justify-between transition`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsxs)(`span`,{className:`font-mono font-bold text-slate-800 block`,children:[`#`,e.id.slice(-8)]}),(0,Y.jsx)(`span`,{className:`text-[10px] text-slate-400`,children:e.createdAt?new Date(e.createdAt?.seconds?e.createdAt.seconds*1e3:e.createdAt).toLocaleDateString(`vi-VN`):``})]}),(0,Y.jsxs)(`div`,{className:`text-right`,children:[(0,Y.jsx)(`span`,{className:`font-mono font-bold text-slate-900 block`,children:v(e.total)}),(0,Y.jsx)(`span`,{className:`text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md`,children:e.status||`Hoàn tất`})]})]},e.id))})]}),(0,Y.jsxs)(`div`,{className:`p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3`,children:[(0,Y.jsx)(`span`,{className:`font-bold text-xs text-slate-900 block`,children:`Tuân thủ Dữ liệu cá nhân (PDPA Compliance)`}),(0,Y.jsx)(`p`,{className:`text-[11px] text-slate-500 leading-relaxed`,children:`Theo Luật Bảo vệ Dữ liệu cá nhân 91/2025/QH15, khách hàng có quyền yêu cầu xuất bản sao toàn bộ dữ liệu hoặc yêu cầu ẩn danh hóa thông tin cá nhân.`}),u&&(0,Y.jsxs)(`div`,{className:`p-3 rounded-xl text-xs flex items-center gap-2 ${u.type===`success`?`bg-emerald-50 text-emerald-800 border border-emerald-200`:`bg-rose-50 text-rose-800 border border-rose-200`}`,children:[u.type===`success`?(0,Y.jsx)(X,{className:`w-4 h-4 text-emerald-600`}):(0,Y.jsx)(Z,{className:`w-4 h-4 text-rose-600`}),(0,Y.jsx)(`span`,{children:u.message})]}),(0,Y.jsxs)(`div`,{className:`flex flex-wrap gap-2 pt-1`,children:[(0,Y.jsx)(`button`,{type:`button`,onClick:()=>{let t={exportedAt:new Date().toISOString(),regulation:`Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 & Nghị định 356/2025/NĐ-CP`,user:{id:e.id||e.uid,name:e.name,email:e.email,phone:e.phone,address:e.address,createdAt:e.createdAt},metrics:{totalSpent:f,orderCount:p,avgOrderValue:m,rfmSegment:h?.label},orders:g,skinReports:_},n=new Blob([JSON.stringify(t,null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`customer_data_${e.email||e.id}_${Date.now()}.json`,i.click(),URL.revokeObjectURL(r)},className:`btn-luxury-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5`,children:(0,Y.jsx)(`span`,{children:`📥 Xuất gói dữ liệu JSON`})}),c?(0,Y.jsxs)(`div`,{className:`w-full p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 mt-2`,children:[(0,Y.jsx)(`p`,{className:`font-bold text-rose-800 text-[11px]`,children:`Xác nhận ẩn danh hóa thông tin? Hành động này xóa PII của khách nhưng BẢO TOÀN toàn bộ đơn hàng và doanh thu cho kế toán.`}),(0,Y.jsxs)(`div`,{className:`flex gap-2`,children:[(0,Y.jsx)(`button`,{type:`button`,disabled:o,onClick:async()=>{s(!0),d(null);try{let t=await G(e.id||e.uid,a);d({type:`success`,message:t.message}),l(!1),i?.()}catch(e){d({type:`error`,message:e.message||`Lỗi khi ẩn danh hóa.`})}finally{s(!1)}},className:`px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition`,children:o?`Đang xử lý…`:`Đồng ý Ẩn danh hóa`}),(0,Y.jsx)(`button`,{type:`button`,onClick:()=>l(!1),className:`px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs hover:bg-slate-300`,children:`Hủy`})]})]}):(0,Y.jsx)(`button`,{type:`button`,onClick:()=>l(!0),className:`px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer`,children:(0,Y.jsx)(`span`,{children:`Ẩn danh hóa tài khoản (Quên tôi)`})})]})]})]}),(0,Y.jsx)(`div`,{className:`p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end`,children:(0,Y.jsx)(`button`,{type:`button`,onClick:r,className:`btn-luxury-secondary text-xs px-4 py-2`,children:`Đóng`})})]})})}function je({isOpen:e,onClose:t,onSaveBulkCoupons:n}){let[r,i]=(0,q.useState)(10),[a,o]=(0,q.useState)(`SKINID-`),[s,c]=(0,q.useState)(`percent`),[l,u]=(0,q.useState)(10),[d,f]=(0,q.useState)(3e5),[p,m]=(0,q.useState)(``),[h,g]=(0,q.useState)(!1),[_,v]=(0,q.useState)(``);return e?(0,Y.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150`,children:(0,Y.jsxs)(`div`,{className:`bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden`,children:[(0,Y.jsxs)(`div`,{className:`px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`h3`,{className:`font-bold text-sm text-slate-900`,children:`Tạo mã Voucher hàng loạt (1 lần dùng)`}),(0,Y.jsx)(`p`,{className:`text-xs text-slate-400 mt-0.5`,children:`Sinh hàng loạt mã ngẫu nhiên duy nhất cho chiến dịch Marketing`})]}),(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer`,children:(0,Y.jsx)($,{className:`w-5 h-5`})})]}),(0,Y.jsxs)(`form`,{onSubmit:async e=>{e.preventDefault(),v(``);let i=Number(r);if(!i||i<1||i>100){v(`Số lượng mã cần tạo phải từ 1 đến 100 mã.`);return}g(!0);try{await n(K({count:i,prefix:a,discountType:s,discountValue:Number(l),minOrderValue:Number(d),expiresAt:p?new Date(p).toISOString():null,maxUses:1})),t()}catch(e){v(e.message||`Không thể tạo mã giảm giá hàng loạt.`)}finally{g(!1)}},className:`p-6 space-y-4 text-xs`,children:[_&&(0,Y.jsx)(`div`,{className:`p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium`,children:_}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-2 gap-4`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:`Số lượng mã cần tạo`}),(0,Y.jsx)(`input`,{type:`number`,min:1,max:100,value:r,onChange:e=>i(e.target.value),className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#BD3F5B]`,required:!0})]}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:`Tiền tố mã (Prefix)`}),(0,Y.jsx)(`input`,{type:`text`,value:a,onChange:e=>o(e.target.value),placeholder:`VD: VIP-, TET2027-`,className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none uppercase font-mono focus:bg-white focus:border-[#BD3F5B]`,required:!0})]})]}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-2 gap-4`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:`Loại giảm giá`}),(0,Y.jsxs)(`select`,{value:s,onChange:e=>c(e.target.value),className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-[#BD3F5B]`,children:[(0,Y.jsx)(`option`,{value:`percent`,children:`Phần trăm (%)`}),(0,Y.jsx)(`option`,{value:`fixed`,children:`Số tiền cố định (VNĐ)`})]})]}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:s===`percent`?`Mức giảm (%)`:`Mức giảm (VNĐ)`}),(0,Y.jsx)(`input`,{type:`number`,value:l,onChange:e=>u(e.target.value),className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#BD3F5B]`,required:!0})]})]}),(0,Y.jsxs)(`div`,{className:`grid grid-cols-2 gap-4`,children:[(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:`Đơn hàng tối thiểu (VNĐ)`}),(0,Y.jsx)(`input`,{type:`number`,value:d,onChange:e=>f(e.target.value),className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#BD3F5B]`})]}),(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`label`,{className:`font-bold text-slate-700 block mb-1`,children:`Hạn sử dụng`}),(0,Y.jsx)(`input`,{type:`date`,value:p,onChange:e=>m(e.target.value),className:`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-[#BD3F5B]`})]})]}),(0,Y.jsxs)(`div`,{className:`p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed`,children:[`💡 Mỗi mã được tạo sẽ có 6 ký tự ngẫu nhiên duy nhất phía sau tiền tố và chỉ dùng được `,(0,Y.jsx)(`strong`,{children:`1 lần duy nhất`}),` (single-use) nhằm chống lạm dụng mã khuyến mãi.`]}),(0,Y.jsxs)(`div`,{className:`pt-2 flex justify-end gap-2`,children:[(0,Y.jsx)(`button`,{type:`button`,onClick:t,className:`btn-luxury-secondary text-xs px-4 py-2`,children:`Hủy`}),(0,Y.jsx)(`button`,{type:`submit`,disabled:h,className:`btn-luxury-primary text-xs px-5 py-2 inline-flex items-center gap-1.5`,children:h?`Đang tạo…`:`⚡ Tạo ngay ${r} mã Voucher`})]})]})]})}):null}export{H as A,P as B,ve as C,se as D,le as E,O as F,A as G,T as H,ae as I,E as K,te as L,F as M,D as N,oe as O,re as P,ee as R,De as S,ue as T,w as U,ie as V,ne as W,Ce as _,de as a,be as b,we as c,Te as d,Se as f,pe as g,_e as h,Z as i,N as j,W as k,$ as l,xe as m,Ae as n,he as o,Q as p,M as q,ke as r,X as s,je as t,fe as u,ge as v,Ee as w,ye as x,me as y,k as z};