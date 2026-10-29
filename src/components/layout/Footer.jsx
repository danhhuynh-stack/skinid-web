import { assetUrl } from '../../assets/index.js';
import { openConsultationDialog } from '../../shared/events/storefrontDialogs.js';
import { useSystemSettings } from '../../features/system/index.js';

export default function Footer() {
  const settings = useSystemSettings();
  const rawHotline = settings.hotline || '0924 093 461';
  const cleanPhone = rawHotline.replace(/[^0-9+]/g, '');
  const supportEmail = settings.supportEmail || 'operation@fieldman.vn';
  const showroomAddress = settings.showroomAddress || '35 đường số 3, Phường Tân Mỹ, TP. Hồ Chí Minh';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 gap-8 lg:gap-10">
          {/* Cột 1: Thương hiệu & Thông tin BCT */}
          <div>
            <a className="brand footer-brand inline-block mb-3" href="/#top">
              <img src={assetUrl('/images/logo-footer-transparent.png')} alt="SkinID" className="h-9 w-auto" />
            </a>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-4">
              Nền tảng thương mại điện tử phân phối dược mỹ phẩm chính ngạch Châu Âu (Rilastil, TWON, D'VAH) kết hợp công nghệ soi da AI chuẩn y khoa.
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/60 text-[11px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Hồ sơ TMĐT đăng ký Cổng online.gov.vn theo NĐ 52/2013/NĐ-CP</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Mua sắm & Khám phá */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Mua sắm &amp; Dịch vụ</h3>
            <a href="/products">Tất cả sản phẩm (54 SKU)</a>
            <a href="/khuyen-mai">Khuyến mãi &amp; Voucher</a>
            <a href="/skin-analysis">Soi da AI 3 góc độ</a>
            <a href="/blog">Cẩm nang Skincare (Blog)</a>
            <a href="/tra-cuu-cong-bo">Tra cứu phiếu công bố CBMP</a>
            <button type="button" onClick={openConsultationDialog} className="cursor-pointer text-left hover:text-white transition-colors">
              Tư vấn routine da liễu
            </button>
          </div>

          {/* Cột 3: Bộ 6 Chính Sách BCT */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Chính sách &amp; Quy định</h3>
            <a href="/chinh-sach-van-chuyen" className="hover:text-white transition-colors">
              1. Vận chuyển &amp; Kiểm hàng
            </a>
            <a href="/chinh-sach-doi-tra" className="hover:text-white transition-colors">
              2. Đổi trả &amp; Hoàn tiền (7 ngày)
            </a>
            <a href="/chinh-sach-thanh-toan" className="hover:text-white transition-colors">
              3. Chính sách thanh toán (VietQR/COD)
            </a>
            <a href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">
              4. Bảo mật dữ liệu cá nhân
            </a>
            <a href="/dieu-khoan-giao-dich" className="hover:text-white transition-colors">
              5. Điều khoản giao dịch chung
            </a>
            <a href="/quy-trinh-khieu-nai" className="hover:text-white transition-colors">
              6. Giải quyết khiếu nại (24h)
            </a>
          </div>

          {/* Cột 4: Thông tin chủ quản CÔNG TY TNHH FIELDMAN */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Đơn vị chủ quản</h3>
            <span className="text-xs font-bold text-gray-200">CÔNG TY TNHH FIELDMAN</span>
            <span className="text-[11px] text-gray-400">
              MST: 0319200638 · Cấp ngày: 10/02/2026
            </span>
            <span className="text-[11px] text-gray-400">
              Nơi cấp: Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh
            </span>
            <span className="text-[11px] text-gray-400">
              Đại diện pháp luật: <strong className="text-gray-300">Trần Long</strong>
            </span>
            <span className="text-[11px] text-gray-400 leading-relaxed">
              {showroomAddress}
            </span>
            <div className="pt-1 flex flex-col gap-1.5">
              <a href={`tel:${cleanPhone}`} className="text-xs font-bold text-rose-400 hover:text-rose-300">
                Hotline: {rawHotline}
              </a>
              <a href={`mailto:${supportEmail}`} className="text-xs text-gray-300 hover:text-white">
                Email: {supportEmail}
              </a>
              <a href={`https://zalo.me/${cleanPhone.replace('+84', '0')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                Zalo CSKH: {rawHotline}
              </a>
              <span className="text-[10px] text-gray-500">08:00 – 21:00 (Thứ 2 – Chủ nhật)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="text-center sm:text-left leading-relaxed text-[11px]">
            © 2026 SkinID.vn. Bản quyền thuộc CÔNG TY TNHH FIELDMAN. Dược mỹ phẩm không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-shrink-0">
            <a href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">Bảo mật</a>
            <span>•</span>
            <a href="/dieu-khoan-giao-dich" className="hover:text-white transition-colors">Điều khoản</a>
            <span>•</span>
            <a href="/quy-trinh-khieu-nai" className="hover:text-white transition-colors">Khiếu nại</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
