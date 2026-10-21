import { useEffect, useId, useMemo, useRef, useState } from 'react';

const money = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectAction,
  orders = [],
  products = [],
  vouchers = [],
  blogPosts = []
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const titleId = useId();

  // Reset query and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction({ type: 'OPEN_PALETTE' });
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  // Static Quick Actions
  const quickActions = useMemo(() => [
    { id: 'qa-go-dashboard', category: 'Điều hướng', title: 'Chuyển đến Tổng quan & KPI Dashboard', subtitle: 'Báo cáo doanh thu, xu hướng 7 ngày, phễu đơn hàng', icon: '📊', action: { type: 'NAVIGATE', tab: 'dashboard' } },
    { id: 'qa-sync-s3', category: 'Tác vụ nhanh', title: 'Đồng bộ tất cả đơn hàng sang S3 POS', subtitle: 'Quét và đẩy toàn bộ đơn chưa sync sang S3 retail', icon: '⚡', action: { type: 'SYNC_S3' } },
    { id: 'qa-new-voucher', category: 'Tác vụ nhanh', title: 'Tạo mã Voucher khuyến mãi mới', subtitle: 'Chiết khấu % hoặc giảm tiền kịch trần toàn sàn', icon: '🏷️', action: { type: 'NEW_VOUCHER' } },
    { id: 'qa-new-blog', category: 'Tác vụ nhanh', title: 'Viết bài Cẩm nang Skincare mới', subtitle: 'Xuất bản bí quyết chăm da và gợi ý sản phẩm phù hợp', icon: '📖', action: { type: 'NEW_BLOG' } },
    { id: 'qa-new-product', category: 'Tác vụ nhanh', title: 'Thêm sản phẩm mới vào danh mục', subtitle: 'Khai báo mã hàng, giá bán, công dụng và hình ảnh', icon: '💄', action: { type: 'NEW_PRODUCT' } },
    { id: 'qa-go-orders', category: 'Điều hướng', title: 'Chuyển đến danh sách Đơn hàng & S3 POS', subtitle: 'Quản lý xử lý đơn, tra cứu vận chuyển', icon: '📦', action: { type: 'NAVIGATE', tab: 'orders' } },
    { id: 'qa-go-promo', category: 'Điều hướng', title: 'Chuyển đến trang Khuyến mãi & Flash Sale', subtitle: 'Cấu hình banner trang chủ và danh mục voucher', icon: '🏷️', action: { type: 'NAVIGATE', tab: 'promotions' } },
    { id: 'qa-go-blog', category: 'Điều hướng', title: 'Chuyển đến trang Cẩm nang Skincare', subtitle: 'Quản lý bài viết và tư vấn routine chăm sóc da', icon: '📖', action: { type: 'NAVIGATE', tab: 'blog' } },
    { id: 'qa-go-system', category: 'Điều hướng', title: 'Chuyển đến Hạ tầng & Kết nối', subtitle: 'Kiểm tra trạng thái đồng bộ POS, máy chủ và thanh toán', icon: '🛡️', action: { type: 'NAVIGATE', tab: 'system' } },
    { id: 'qa-go-settings', category: 'Điều hướng', title: 'Chuyển đến Cài đặt hệ thống', subtitle: 'Cấu hình freeship, thông tin doanh nghiệp, S3 POS', icon: '⚙️', action: { type: 'NAVIGATE', tab: 'settings' } },
    { id: 'qa-go-store', category: 'Cửa hàng', title: 'Mở trang chủ SkinID.vn ngoài Storefront', subtitle: 'Xem giao diện khách hàng trên tab mới', icon: '↗', action: { type: 'OPEN_STORE' } }
  ], []);

  // Filtered Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickActions;

    const list = [];

    // Filter Quick Actions
    quickActions.forEach(qa => {
      if (qa.title.toLowerCase().includes(q) || qa.subtitle.toLowerCase().includes(q)) {
        list.push(qa);
      }
    });

    // Filter Orders
    orders.forEach(order => {
      const match = [order.id, order.customer?.name, order.customer?.phone, order.s3OrderId].some(
        val => String(val || '').toLowerCase().includes(q)
      );
      if (match) {
        list.push({
          id: `ord-${order.id}`,
          category: 'Đơn hàng',
          title: `Đơn #${order.id.slice(0, 8)} · ${order.customer?.name || 'Khách vãng lai'}`,
          subtitle: `${money(order.total)} · ${order.customer?.phone || 'Chưa có SĐT'} · Trạng thái: ${order.status}`,
          icon: '📦',
          action: { type: 'VIEW_ORDER', tab: 'orders', search: order.id }
        });
      }
    });

    // Filter Products
    products.forEach(p => {
      const match = [p.id, p.name, p.brand].some(val => String(val || '').toLowerCase().includes(q));
      if (match) {
        list.push({
          id: `prod-${p.id}`,
          category: 'Sản phẩm',
          title: `${p.brand} - ${p.name}`,
          subtitle: `${money(p.price)} · ID: ${p.id} · Danh mục: ${p.stepType || 'Sản phẩm'}`,
          icon: '💄',
          action: { type: 'VIEW_PRODUCT', tab: 'products', search: p.id }
        });
      }
    });

    // Filter Vouchers
    vouchers.forEach(v => {
      const match = [v.code, v.description].some(val => String(val || '').toLowerCase().includes(q));
      if (match) {
        list.push({
          id: `vouch-${v.code}`,
          category: 'Voucher',
          title: `Mã ${v.code} (${v.type === 'percent' ? `Giảm ${v.discountValue}%` : `Giảm ${money(v.discountValue)}`})`,
          subtitle: v.description || `Đơn tối thiểu ${money(v.minOrderValue)}`,
          icon: '🏷️',
          action: { type: 'VIEW_VOUCHER', tab: 'promotions' }
        });
      }
    });

    // Filter Blog Posts
    blogPosts.forEach(post => {
      const match = [post.title, post.excerpt, post.stepLabel].some(val => String(val || '').toLowerCase().includes(q));
      if (match) {
        list.push({
          id: `blog-${post.id}`,
          category: 'Cẩm nang Skincare',
          title: post.title,
          subtitle: `${post.stepLabel || 'Cẩm nang'} · ${post.author || 'SkinID Skincare Team'}`,
          icon: '📖',
          action: { type: 'VIEW_BLOG', tab: 'blog' }
        });
      }
    });

    return list.slice(0, 20); // Top 20 results for lightning speed
  }, [query, quickActions, orders, products, vouchers, blogPosts]);

  // Keyboard navigation inside list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = results[activeIndex];
      if (current) {
        onSelectAction(current.action);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex items-start justify-center pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden admin-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative px-4 py-3.5 border-b border-slate-200/80 flex items-center gap-3 bg-slate-50/70">
          <span className="text-slate-400 text-base">🔍</span>
          <input
            ref={inputRef}
            id={titleId}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm đơn hàng, voucher, blog, sản phẩm, phím tắt (Ctrl+K)..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-500 shadow-2xs">
            ESC để đóng
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không tìm thấy kết quả nào phù hợp với <strong className="text-slate-600">"{query}"</strong>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectAction(item.action);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-rose-50 text-slate-900 border border-rose-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Dùng <kbd className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">↑</kbd> <kbd className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">↓</kbd> để di chuyển</span>
            <span><kbd className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">Enter</kbd> để chọn</span>
          </div>
          <span className="font-mono text-slate-400">{results.length} kết quả</span>
        </div>
      </div>
    </div>
  );
}
