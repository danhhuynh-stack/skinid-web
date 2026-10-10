import { assetUrl } from '../../assets/index.js';
import { openConsultationDialog, openPolicyDialog } from '../../shared/events/storefrontDialogs.js';

export default function Footer() {
  return (
    <>
<footer className="site-footer">
  <div className="container">
    <div className="footer-grid">
      <div>
        <a className="brand footer-brand" href="/#top">
          <img src={assetUrl('/images/logo-footer-transparent.png')} alt="SkinID" />
        </a>
        <p>Dược mỹ phẩm và sản phẩm chăm sóc cá nhân chính hãng, thông tin rõ ràng, dễ lựa chọn.</p>
      </div>
      <div>
        <h3>Mua sắm</h3>
        <a href="/products">Tất cả sản phẩm</a>
        <a href="/tra-cuu-cong-bo">Tra cứu công bố</a>
        <a href="/#brands">Thương hiệu</a>
        <button type="button" onClick={openConsultationDialog}>Tư vấn sản phẩm</button>
      </div>
      <div>
        <h3>Hỗ trợ</h3>
        <button type="button" onClick={() => openPolicyDialog('shipping')}>Giao hàng & đổi trả</button>
        <button type="button" onClick={() => openPolicyDialog('privacy')}>Bảo mật dữ liệu</button>
        <button type="button" onClick={() => openPolicyDialog('terms')}>Điều khoản sử dụng</button>
        <a href="https://zalo.me/0924093461" target="_blank" rel="noopener noreferrer">Liên hệ Zalo</a>
      </div>
      <div>
        <h3>CÔNG TY TNHH FIELDMAN</h3>
        <span>MST: 0319200638</span>
        <span>35 đường số 3, Phường Tân Mỹ, TP. Hồ Chí Minh</span>
        <a href="tel:+84924093461">0924.093.461</a>
        <span>08:00–21:00 · Thứ 2–Chủ nhật</span>
      </div>
    </div>
    <div className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100/80">
      <div className="text-xs text-gray-500 text-center sm:text-left leading-relaxed">
        © 2026 SkinID.vn. Bản quyền thuộc CÔNG TY TNHH FIELDMAN. Sản phẩm chăm sóc da không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href="http://online.gov.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:shadow-2xs transition-all text-left group"
          title="Website Thương mại điện tử đã thông báo với Bộ Công Thương"
        >
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <div className="leading-tight">
            <div className="text-[10px] font-extrabold text-blue-900 tracking-tight uppercase">
              ĐÃ THÔNG BÁO
            </div>
            <div className="text-[9px] font-bold text-blue-700 tracking-tighter">
              BỘ CÔNG THƯƠNG
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</footer>
    </>
  );
}
