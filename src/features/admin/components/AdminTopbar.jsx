import {
  IconSearch,
  IconRefresh,
  IconExternalLink
} from './AdminIcons.jsx';

export default function AdminTopbar({
  onOpenMobile,
  onOpenCommandPalette,
  onRefresh,
  user,
  roleMeta
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Command Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Mở danh mục điều hướng"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Quick Search Bar */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex-1 flex items-center justify-between px-3.5 py-2 bg-slate-50/90 hover:bg-white border border-rose-100/80 hover:border-rose-200/90 rounded-full text-xs text-slate-500 transition-all shadow-2xs group cursor-pointer focus:ring-2 focus:ring-[#E06D81]/20"
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconSearch className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#BD3F5B] transition-colors flex-shrink-0" />
              <span className="truncate font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                Tìm nhanh đơn hàng, bài viết, voucher, SKU...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-rose-100 rounded-full text-[10px] font-mono text-slate-400 shadow-2xs group-hover:text-[#BD3F5B] group-hover:border-rose-200">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Refresh, Storefront, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-[#BD3F5B] hover:bg-rose-50/70 rounded-full transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <IconRefresh className="w-4 h-4" />
          </button>

          {/* Storefront Link Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#BD3F5B] bg-white hover:bg-rose-50/50 rounded-full border border-rose-100 transition-all shadow-2xs"
            title="Mở storefront"
          >
            <span>Cửa hàng</span>
            <IconExternalLink className="w-3 h-3 text-rose-400" />
          </a>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-rose-100/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#FCE7EC] text-[#BD3F5B] border border-rose-200/90 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
              {(user?.name || user?.email || 'Danh Huỳnh Thanh')[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[140px]">
                {user?.name || 'Danh Huỳnh Thanh'}
              </span>
              <span className="text-[10px] text-rose-700/80 block font-medium">
                {roleMeta?.label || 'Super Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
