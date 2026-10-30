# QUY TRÌNH VẬN HÀNH HỆ THỐNG & DEVOPS (OPERATIONS SOP)
**Hệ thống Thương mại Điện tử & Tư vấn Da liễu AI — SkinID.vn**  
*Đơn vị chủ quản: CÔNG TY TNHH FIELDMAN | Mã số thuế: 0319200638*  
*Cập nhật: Tháng 10/2026 — Phiên bản 2.0*

---

## 1. KIẾN TRÚC VẬN HÀNH HỆ THỐNG
Hệ thống SkinID.vn được vận hành trên hạ tầng Cloud Serverless hiện đại:
- **Frontend SPA**: React 18, Vite, Tailwind CSS, CDN Cloudflare Pages & GitHub Pages.
- **Backend API & Business Logic**: Cloudflare Workers (Edge Serverless tại Datacenter TP. Hồ Chí Minh & Hà Nội).
- **Cơ sở dữ liệu & Định danh**: Google Cloud Firestore & Firebase Authentication (`asia-southeast1`).
- **Tích hợp Bán lẻ & Kho vận**: S3 Retail POS API (`https://m.es3.vn`).
- **Cổng Thanh toán**: Vietcombank VietQR 1-Tap Deep Link (STK Doanh nghiệp: `1063583549` - CÔNG TY TNHH FIELDMAN).

---

## 2. QUY TRÌNH TRIỂN KHAI CLOUDFLARE WORKER (DEPLOYMENT)

### 2.1. Yêu Cầu Môi Trường (Prerequisites)
- Node.js version $\ge 18.0.0$.
- Cloudflare Wrangler CLI (`npm install -g wrangler` hoặc dùng qua `npx wrangler`).
- Quyền truy cập Cloudflare Account sở hữu domain `skinid.vn`.

### 2.2. Kiểm Tra Biến Môi Trường (Environment Secrets)
Các biến bảo mật bắt buộc phải được cấu hình trên Cloudflare Workers:
```bash
# Đăng nhập Cloudflare
npx wrangler login

# Cấu hình các Secret quan trọng
npx wrangler secret put FIREBASE_PRIVATE_KEY
npx wrangler secret put FIREBASE_CLIENT_EMAIL
npx wrangler secret put S3_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### 2.3. Lệnh Triển Khai (Deploy)
```bash
# 1. Chạy toàn bộ test kiểm thử trước khi deploy
npm test

# 2. Build và deploy worker lên production
npm run deploy:worker
# Hoặc: npx wrangler deploy --env production
```
Sau khi triển khai, kiểm tra healthcheck:
```bash
curl -I https://skinid.vn/api/health
# Trả về HTTP 200 OK kèm thông tin git commit hash.
```

---

## 3. QUY TRÌNH HOÀN TÁC KHẨN CẤP TRONG 1 PHÚT (ROLLBACK SOP)
Khi phát hiện lỗi nghiêm trọng (Zero-Day, lỗi tính giá, lỗi đồng bộ POS) sau khi triển khai:

### 3.1. Rollback Worker Bằng Wrangler CLI
Cloudflare Workers hỗ trợ cơ chế Versioning tức thời:
```bash
# 1. Liệt kê các phiên bản triển khai gần nhất
npx wrangler deployments list

# 2. Rollback ngay lập tức về Deployment ID ổn định trước đó
npx wrangler rollback <DEPLOYMENT_ID>
```
*Thời gian có hiệu lực: Dưới 30 giây trên toàn cầu mà không làm gián đoạn kết nối của khách hàng.*

### 3.2. Rollback Frontend Static Build
- Nếu lỗi nằm ở giao diện Frontend:
  1. Vào Dashboard Cloudflare Pages -> Tab **Deployments**.
  2. Tìm bản build gần nhất hoạt động tốt -> Chọn **Rollback to this deployment**.
  3. Xóa cache CDN: **Purge Everything** tại mục Caching của Cloudflare.

---

## 4. QUY TRÌNH SAO LƯU ĐỊNH KỲ FIRESTORE (BACKUP & RESTORE)

### 4.1. Lịch Sao Lưu Tự Động
- Toàn bộ cơ sở dữ liệu Firestore được cấu hình sao lưu tự động hàng ngày (Daily Cloud Storage Export) vào lúc 02:00 sáng (UTC+7) thông qua Google Cloud Scheduler.

### 4.2. Sao Lưu Thủ Công Trước Các Đợt Sale Lớn
Trước khi diễn ra chiến dịch Mega Sale hoặc đổi cấu hình lớn, Quản trị viên chạy lệnh sao lưu thủ công:
```bash
gcloud firestore export gs://skinid-firestore-backups/manual-$(date +%Y%m%d-%H%M) \
  --project=skinid-vietnam \
  --collection-ids=orders,users,promotions,settings,posts
```

### 4.3. Quy Trình Phục Hồi Dữ Liệu (Restore)
Trong trường hợp dữ liệu bị hỏng hóc hoặc thao tác nhầm:
```bash
gcloud firestore import gs://skinid-firestore-backups/<BACKUP_FOLDER> \
  --project=skinid-vietnam
```

---

## 5. QUY TRÌNH XỬ LÝ SỰ CỐ TÍCH HỢP BÁN LẺ POS S3

### 5.1. Cơ Chế Fail-Safe Bất Tử (Fault Tolerance)
- Hệ thống SkinID áp dụng nguyên tắc thiết kế **Không để lỗi bên thứ ba làm chết luồng mua hàng của khách**.
- Khi máy chủ S3 POS gặp sự cố (quá tải, mất mạng, phản hồi timeout > 5000ms), đơn hàng của khách trên SkinID **vẫn được ghi nhận thành công** và lưu vào Firestore với trạng thái:
  - `s3SyncStatus: "sync_failed"`
  - `s3Error: "ETIMEDOUT: Connection to S3 POS timed out"`

### 5.2. Các Bước Xử Lý Cho Quản Lý Vận Hành
1. Truy cập trang Quản trị SkinID (`https://skinid.vn/admin/`).
2. Nhìn vào khối **Tác vụ cần xử lý ngay (To-Do Queue)**:
   - Các đơn có nhãn màu đỏ `Lỗi S3 POS` sẽ hiển thị nổi bật ở đầu danh sách.
3. Bấm vào mã đơn để mở **Chi tiết đơn hàng**.
4. Kiểm tra phần thông tin **Trạng thái đồng bộ POS**:
   - Nếu lỗi là do Token hết hạn: Vào phần Cài đặt hệ thống, kiểm tra lại API Key S3.
   - Nếu lỗi do đường truyền: Bấm nút **🔄 Thử đồng bộ lại POS**.
5. Khi kết nối S3 thành công, hệ thống tự động cập nhật mã hóa đơn POS (`s3OrderId`) và chuyển trạng thái sang `Đã đồng bộ S3`.

---

## 6. DANH BẠ LIÊN HỆ ỨNG CỨU SỰ CỐ (ESCALATION CONTACTS)
- **Kỹ sư Trực ban (On-call DevOps)**: `dev@fieldman.vn` | SĐT: `0924 093 461`
- **Bộ phận Vận hành Kho & Đơn hàng**: `operation@fieldman.vn`
- **Bộ phận Hỗ trợ Kỹ thuật S3 Retail Software**: Hotline hỗ trợ kỹ thuật POS S3
