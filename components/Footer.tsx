import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-soft to-brand-blush/80 border-t border-brand-petal/30 pt-12 pb-24 md:pb-12 mt-16 text-brand-espresso">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-3">
          <div className="relative w-36 h-12">
            <Image
              src="/images/logo.png"
              alt="SkinID.vn Logo"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Hệ sinh thái Skin AI kết hợp Thương mại điện tử dược mỹ phẩm chính hãng hàng đầu Việt Nam.
          </p>
          <div className="text-xs space-y-1">
            <p><strong className="font-semibold text-brand-espresso">Hotline:</strong> {siteConfig.hotline}</p>
            <p><strong className="font-semibold text-brand-espresso">Địa chỉ:</strong> {siteConfig.address}</p>
          </div>
        </div>

        {/* Column 2: Brands */}
        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 text-brand-espresso">Nhãn hàng phân phối</h4>
          <ul className="space-y-2 text-xs text-brand-muted">
            <li><Link href="/san-pham?brand=rilastil" className="hover:text-brand-pink transition-colors">Rilastil (Dược mỹ phẩm Ý)</Link></li>
            <li><Link href="/san-pham?brand=twon" className="hover:text-brand-pink transition-colors">TWON (Dưỡng trắng & Body)</Link></li>
            <li><Link href="/san-pham?brand=dvah" className="hover:text-brand-pink transition-colors">DVAH (Tinh chất phục hồi)</Link></li>
          </ul>
        </div>

        {/* Column 3: Trust & Policies */}
        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 text-brand-espresso">Chính sách & Hỗ trợ</h4>
          <ul className="space-y-2 text-xs text-brand-muted">
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-brand-pink transition-colors">Chính sách bảo mật dữ liệu da</Link></li>
            <li><Link href="/dieu-khoan" className="hover:text-brand-pink transition-colors">Điều khoản giao dịch</Link></li>
            <li><Link href="/tra-cuu-don-hang" className="hover:text-brand-pink transition-colors">Tra cứu đơn hàng không cần tài khoản</Link></li>
          </ul>
        </div>

        {/* Column 4: Commitments */}
        <div className="space-y-3">
          <h4 className="font-serif font-semibold text-sm text-brand-espresso">Cam kết tin cậy</h4>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-brand-petal/30 text-xs space-y-1.5 shadow-sm">
            <p className="font-medium text-brand-pink">✓ 100% Chính hãng có tem nhãn</p>
            <p className="text-brand-muted">✓ Đã bao gồm VAT 8% mọi đơn hàng</p>
            <p className="text-brand-muted">✓ Dược sĩ tư vấn Zalo 1-on-1</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-4 border-t border-brand-petal/20 text-center text-[11px] text-brand-muted">
        © {new Date().getFullYear()} SkinID.vn — Skin AI & Multibrand E-commerce. All rights reserved.
      </div>
    </footer>
  );
}
