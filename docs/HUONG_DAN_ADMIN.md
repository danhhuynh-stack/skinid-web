# HƯỚNG DẪN QUẢN TRỊ HỆ THỐNG SKINID (ADMIN GUIDE)
**Hệ thống Thương mại Điện tử & Tư vấn Da liễu AI — SkinID.vn**  
*Đơn vị chủ quản: CÔNG TY TNHH FIELDMAN | Mã số thuế: 0319200638*  
*Cập nhật: Tháng 10/2026 — Phiên bản 2.0*

---

## 1. TỔNG QUAN PHÂN HỆ QUẢN TRỊ (ADMIN PANEL)
Hệ thống Quản trị SkinID (`https://skinid.vn/admin/`) được thiết kế theo tiêu chuẩn kiến trúc hiện đại, kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) và tuân thủ chặt chẽ Luật Bảo vệ Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP & Luật 91/2025/QH15).

### 1.1. Ma Trận Phân Quyền 7 Vai Trò (RBAC Matrix)

| Chức năng / Quyền hạn | Super Admin | Quản lý Vận hành | CSKH & Bán hàng | Marketing | Biên tập viên | Chuyên gia Da liễu | Kho vận |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mã nội bộ (Role Key)** | `super_admin` | `ops_manager` | `sales` | `marketing` | `editor` | `dermatologist` / `consultant` | `warehouse` |
| Quản lý tài khoản & Phân quyền nhân sự | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem Báo cáo Doanh thu & Dashboard thật | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý Đơn hàng & Cập nhật trạng thái | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ *(Chỉ Đóng gói/Giao)* |
| In Phiếu Giao hàng A5 & Gọi Hotline/Zalo | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Xem Hồ sơ Khách hàng 360° (LTV, RFM) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Xem Ảnh Soi da & Lịch sử Phân tích AI | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Ẩn danh hóa PII khách hàng (Quyền lãng quên) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý Banner Trang chủ (Block CMS) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Xuất bản Cẩm nang & Kiểm soát từ cấm mỹ phẩm | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Tạo Voucher Khuyến mại hàng loạt | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Đồng bộ thủ công đơn sang POS S3 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem Nhật ký Kiểm toán (Audit Logs) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. HƯỚNG DẪN THAO TÁC THEO TỪNG VAI TRÒ

### 2.1. Super Admin (Toàn Quyền Quản Trị)
- **Truy cập**: Đăng nhập bằng tài khoản email công vụ được cấp quyền (`@fieldman.vn`).
- **Phân quyền nhân sự**:
  1. Vào tab **Cấu hình & Nhân sự**.
  2. Tìm kiếm nhân sự theo email.
  3. Chọn vai trò tương ứng trong danh sách (1 trong 7 vai trò).
  4. Nhấn **Cập nhật quyền**. Hệ thống ghi nhật ký kiểm toán `STAFF_ROLE_UPDATED` trên máy chủ.
- **Xem nhật ký bảo mật**:
  - Theo dõi mọi biến động: thay đổi giá, đổi quyền, hủy đơn, ẩn danh PII khách hàng.

### 2.2. Quản Lý Vận Hành (Operations Manager)
- **Dashboard Trung Thực**:
  - Không có số liệu ảo, doanh thu và sản lượng tính toán 100% từ các đơn hàng thật được chốt thành công.
- **Hàng Chờ Tác Vụ Khẩn (Operations To-Do Queue)**:
  - Báo động các đơn hàng ở trạng thái `pending` quá 2 giờ chưa xác nhận.
  - Cảnh báo các đơn hàng đồng bộ thất bại sang phần mềm bán hàng S3 POS (`sync_failed`).
  - Cảnh báo sản phẩm sắp hết hàng trong kho (tồn kho $\le 5$).
- **Xuất Báo Cáo Doanh Thu (Excel XML)**:
  - Nhấn nút **Xuất Excel đơn hàng**.
  - File tải về có định dạng chuẩn Executive Grade (Header Navy `#1B365D`, dòng so le Zebra `#F8FAFC`, dòng Tổng cộng Amber `#FEF3C7`), tự động loại trừ các đơn hủy để số liệu đối soát kế toán luôn chính xác.

### 2.3. CSKH & Bán Hàng (Sales / CSKH)
- **Xử lý Đơn hàng**:
  - Khi có đơn mới, bấm vào mã đơn để mở **Order Timeline Modal**.
  - Kiểm tra thông tin nhận hàng, bấm **Gọi điện** hoặc **Nhắn Zalo** trực tiếp cho khách bằng 1 cú nhấp.
  - Chuyển trạng thái đơn từ `Chờ duyệt` -> `Đã xác nhận`.
  - Nhập **Ghi chú nội bộ** (ví dụ: *Khách dặn giao giờ hành chính, gọi trước 15p*).
- **In Phiếu Giao Hàng A5**:
  - Trong modal đơn hàng, nhấn nút **In phiếu A5**.
  - Phiếu in hiển thị đầy đủ thương hiệu SkinID, pháp nhân CÔNG TY TNHH FIELDMAN, mã vận đơn, danh sách sản phẩm, hướng dẫn đồng kiểm hàng hóa.

### 2.4. Kho Vận (Warehouse)
- **Đóng gói & Xuất kho**:
  - Nhận đơn ở trạng thái `Đã xác nhận` -> Chuyển sang `Đang đóng gói`.
  - In phiếu đóng hàng A5 kẹp cùng kiện hàng.
  - Khi bàn giao cho đơn vị vận chuyển (GHN/GHTK/ViettelPost) -> Chuyển sang `Đang vận chuyển`.
  - Tuyệt đối không nhảy cóc trạng thái (hệ thống có State Machine chặn thao tác sai quy trình).

### 2.5. Chuyên Gia Da Liễu & Tư Vấn Viên (Dermatologist / Consultant)
- **Bảo mật Dữ liệu Y tế & Soi da AI**:
  - Chỉ Bác sĩ da liễu và Tư vấn viên được cấp quyền mới có thể xem ảnh chân dung soi da của khách hàng.
  - Các bộ phận khác (Marketing, Kho vận, Kế toán) chỉ thấy các chỉ số phân tích da dạng text (loại da, điểm mụn, độ ẩm), ảnh chân dung sẽ được làm mờ (redacted) để bảo vệ quyền riêng tư người dùng.
- **Ghi chú & Đề xuất phác đồ**:
  - Bác sĩ có thể nhập lời khuyên chuyên môn để gửi lại thông báo tư vấn cho khách hàng trên ứng dụng.

### 2.6. Marketing & Chiến Dịch (Marketing Specialist)
- **Quản lý Banner Trang chủ (Block CMS)**:
  - Vào tab **Nội dung & CMS** -> Chọn khối **Hero Banner Slider**.
  - Có thể kéo thả đổi thứ tự 8 khối trên trang chủ.
  - Thiết lập banner: Tiêu đề, Phụ đề, Ảnh Desktop (tỉ lệ 16:9), Ảnh Mobile (tỉ lệ 4:3), Đường dẫn nút CTA.
  - **Hẹn giờ chiến dịch**: Thiết lập `startAt` (Bắt đầu) và `endAt` (Kết thúc). Banner chỉ hiển thị đúng khung giờ quy định và tự động ẩn khi hết hạn.
  - **Khôi phục phiên bản (Rollback)**: Nếu lưu nhầm giao diện, chọn phiên bản trước đó trong danh sách lịch sử để hoàn tác ngay lập tức.
- **Tạo Mã Khuyến Mại Hàng Loạt (Bulk Coupons)**:
  - Vào tab **Khuyến mại** -> Nhấn **⚡ Tạo hàng loạt**.
  - Cấu hình tiền tố (ví dụ: `TRIAN-`, `LIVESTREAM-`), số lượng mã (ví dụ: 50 mã), giá trị giảm (theo % hoặc số tiền cố định).
  - Hệ thống tự sinh các mã ngẫu nhiên duy nhất với giới hạn 1 lần dùng (`maxUses = 1`).

### 2.7. Biên Tập Viên Cẩm Nang (Content Editor)
- **Tuân thủ Quy chế Quảng cáo Mỹ phẩm (Thông tư 06/2011/TT-BYT)**:
  - Khi soạn thảo bài viết cẩm nang skincare, hệ thống tự động kiểm tra thời gian thực (Real-time Compliance Audit).
  - Nếu bài viết chứa các từ ngữ y khoa bị cấm (*điều trị, đặc trị, trị dứt điểm, chữa khỏi, tận gốc, thay thế thuốc*), thanh cảnh báo màu hổ phách sẽ hiện lên yêu cầu sửa thành các cụm từ mỹ phẩm chuẩn (*hỗ trợ cải thiện, giúp phục hồi, chăm sóc da mụn*).
- **SEO Schema Structured Data**:
  - Hệ thống tự động sinh cấu trúc Schema JSON-LD `Article` chuẩn Googlebot để bài viết được lập chỉ mục nhanh nhất.

---

## 3. QUY TRÌNH XỬ LÝ QUYỀN ĐƯỢC LÃNG QUÊN (PDPA / DATA PRIVACY)
Theo Luật Bảo vệ Dữ liệu Cá nhân:
1. Khi khách hàng gửi yêu cầu xóa tài khoản hoặc xóa dữ liệu cá nhân:
2. Quản lý vận hành vào tab **Khách hàng** -> Mở **Hồ sơ Khách 360°**.
3. Xuất file dữ liệu cá nhân dạng JSON để lưu trữ phục vụ đối soát pháp lý (nếu cần).
4. Nhấn nút **Ẩn danh hóa tài khoản (PDPA)**.
5. Hệ thống sẽ thay thế Tên thành `Khách hàng [Mã hash]`, Email thành `anonymized_***@fieldman.vn`, SĐT thành `[Đã ẩn danh]`, và xóa sạch địa chỉ chi tiết.
6. **Lưu ý quan trọng**: Doanh thu và lịch sử đơn hàng của khách vẫn được giữ nguyên vẹn để bảo đảm tính chính xác của sổ sách kế toán và hóa đơn điện tử.

---

## 4. HỖ TRỢ KỸ THUẬT & LIÊN HỆ NỘI BỘ
- **Bộ phận Vận hành FieldMan**: `operation@fieldman.vn` | Hotline: `0924 093 461`
- **Bộ phận Kỹ thuật & Cloud**: `dev@fieldman.vn`
