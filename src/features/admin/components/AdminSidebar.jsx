import {
  IconDashboard,
  IconOrders,
  IconPromotions,
  IconProducts,
  IconBlog,
  IconMembers,
  IconSystem,
  IconSettings,
  IconAuditLogs,
  IconExternalLink,
  IconClose
} from './AdminIcons.jsx';

const NAV_GROUPS = [
  {
    title: 'VẬN HÀNH',
    items: [
      { id: 'dashboard', label: 'Tổng quan & KPI', Icon: IconDashboard },
      { id: 'orders', label: 'Đơn hàng & S3 POS', Icon: IconOrders, countKey: 'orders' }
    ]
  },
  {
    title: 'MARKETING',
    items: [
      { id: 'promotions', label: 'Khuyến mãi & Flash Sale', Icon: IconPromotions, countKey: 'promotions' },
      { id: 'blog', label: 'Cẩm nang Skincare', Icon: IconBlog, countKey: 'blog' }
    ]
  },
  {
    title: 'DỮ LIỆU',
    items: [
      { id: 'products', label: 'Danh mục Sản phẩm', Icon: IconProducts, countKey: 'products' },
      { id: 'members', label: 'Đội ngũ & Khách hàng', Icon: IconMembers, countKey: 'members' }
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { id: 'system', label: 'Hạ tầng & Kết nối', Icon: IconSystem },
      { id: 'audit-logs', label: 'Nhật ký Truy vết', Icon: IconAuditLogs },
      { id: 'settings', label: 'Cài đặt hệ thống', Icon: IconSettings }
    ]
  }
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  counts = {},
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  user,
  roleMeta
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-68'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <a href="/" className="flex items-center gap-3 overflow-hidden group py-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BD3F5B] to-[#E06D81] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_8px_rgba(224,109,129,0.3)] flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
              S
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                    SkinID<span className="text-[#BD3F5B]">.vn</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-[#FFF0F3] text-[#BD3F5B] border border-rose-200/60 font-mono">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                  Quản trị Vận hành & Bán lẻ
                </span>
              </div>
            )}
          </a>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            <span className={`transform transition-transform text-xs font-bold ${isCollapsed ? 'rotate-180' : ''}`}>◀</span>
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Đóng menu"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 admin-custom-scroll">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const targetId = item.id;
                  const isActive = activeTab === targetId;
                  const count = item.countKey ? counts[item.countKey] : null;
                  const ItemIcon = item.Icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(targetId);
                        if (mobileOpen) onCloseMobile();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 active:scale-[0.985] cursor-pointer select-none group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-[#BD3F5B] to-[#E06D81] text-white font-semibold shadow-[0_4px_14px_rgba(224,109,129,0.25)]'
                          : 'text-slate-600 hover:text-[#BD3F5B] hover:bg-[#FFF5F7] font-medium'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <ItemIcon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#BD3F5B]'
                        }`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left whitespace-nowrap tracking-tight">{item.label}</span>
                          {typeof count === 'number' && count > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tracking-tight transition-colors ${
                                isActive
                                  ? 'bg-white/25 text-white'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100/70 group-hover:text-[#BD3F5B]'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: Live Infrastructure Status & Version */}
        <div className="p-3 border-t border-slate-100 bg-[#FCFDFE]">
          <div className={`p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 ${isCollapsed ? 'text-center p-2' : ''}`}>
            {!isCollapsed ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Máy chủ SkinID</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                    S3 Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40">
                  <span>Executive v2.6</span>
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#E06D81] font-semibold flex items-center gap-0.5 transition"
                  >
                    <span>Store</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Hệ thống trực tuyến" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
