# Ảnh và video của SkinID

## Thư mục nào là nguồn?

`src/assets/` là nơi lưu tài nguyên gốc trong repository. Hãy thêm hoặc sửa ảnh tại đây, rồi commit thay đổi. `dist/` là kết quả do `npm run build` tạo lại; không thêm hoặc sửa ảnh trực tiếp trong `dist/` vì lần build tiếp theo sẽ ghi đè.

```text
src/assets/images/
  banners/             Ảnh banner
  brands/              Logo thương hiệu
  licenses/            Ảnh giấy tờ sản phẩm
  products/rilastil/   Ảnh sản phẩm Rilastil
  products/dvah/       Ảnh sản phẩm D'VAH
  products/twon/       Ảnh sản phẩm TWON
  logo.png             Logo SkinID
src/assets/videos/     Video giao diện
```

## Website lấy ảnh như thế nào?

- Khi chạy `npm run dev`, Vite phục vụ ảnh từ `src/assets/`. Hàm `assetUrl` trong `src/assets/index.js` đổi đường dẫn `/images/...` thành URL phù hợp với môi trường dev.
- Khi chạy `npm run build`, cấu hình `vite.config.mjs` sao chép ảnh và video sang `dist/images/` và `dist/videos/`. Cloudflare Worker phục vụ thư mục `dist/` theo `wrangler.jsonc`; GitHub Actions tự build trước khi deploy.
- Catalog ưu tiên lấy dữ liệu sản phẩm từ Firestore. Trường `image` của sản phẩm là **đường dẫn hoặc URL**, không phải bản thân file ảnh. Đường dẫn local như `/images/products/...` chỉ hiển thị nếu file tương ứng đã nằm trong bản deploy. URL ngoài được tải từ máy chủ bên ngoài.

## Thêm hoặc thay ảnh sản phẩm

1. Đặt file gốc vào `src/assets/images/products/<thuong-hieu>/`.
2. Cập nhật trường `image` của sản phẩm thành `/images/products/<thuong-hieu>/<ten-file>` trong nguồn catalog phù hợp: Firestore cho dữ liệu đang dùng, `src/data/products.js` cho catalog dự phòng.
3. Chạy `npm run build` rồi kiểm tra file tương ứng trong `dist/images/products/<thuong-hieu>/`. Commit file gốc và thay đổi catalog; không commit `dist/`.

Hiện build còn tạo thêm bản phẳng tại `dist/images/products/<ten-file>` để tương thích với dữ liệu catalog cũ dùng đường dẫn không có thư mục thương hiệu. Đây là **bản sao khi build**, không phải nơi thứ hai để quản lý ảnh. Có thể bỏ bản sao này sau khi toàn bộ dữ liệu Firestore và đường dẫn sử dụng ảnh đã được chuyển sang đường dẫn có thương hiệu.
