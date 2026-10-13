import { useState } from 'react';
import {
  IconLightning,
  IconOrders,
  IconPromotions,
  IconAlert,
  IconCheck,
  IconChevronDown
} from './AdminIcons.jsx';

export default function AdminActionCenter({
  s3PendingCount = 0,
  pendingOrdersCount = 0,
  unpaidOrdersCount = 0,
  campaign,
  onSyncS3,
  isBatchSyncing,
  onFilterOrders,
  onNavigateTab
}) {
  const [collapsed, setCollapsed] = useState(false);

  const totalUrgent = (s3PendingCount > 0 ? 1 : 0) + (pendingOrdersCount > 0 ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-rose-100/80 shadow-[0_4px_16px_rgba(224,109,129,0.04)] overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-rose-50/40 via-white to-white border-b border-rose-100/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-xs tracking-tight text-slate-900">
            Trung tâm Vận hành & Cảnh báo (Ops Center)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {totalUrgent > 0 ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/90 flex items-center gap-1.5 shadow-2xs">
              <IconAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalUrgent} tác vụ khẩn</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 flex items-center gap-1.5 shadow-2xs">
              <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hệ thống ổn định</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(prev => !prev)}
            className="text-slate-400 hover:text-rose-700 p-1.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            <IconChevronDown className={`w-3.5 h-3.5 transform transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Cards Body */}
      {!collapsed && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-gradient-to-b from-[#FFF9FA]/40 to-slate-50/30">
          {/* Card 1: S3 POS Sync Alert */}
          <div className="p-4 rounded-xl border bg-white/95 border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <IconLightning className="w-3.5 h-3.5 text-[#BD3F5B]" />
                  <span>Đồng bộ S3 POS</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  s3PendingCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {s3PendingCount > 0 ? `${s3PendingCount} đơn chờ` : '100% Synced'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {s3PendingCount > 0
                  ? `Có ${s3PendingCount} đơn hàng mới cần đẩy sang phần mềm bán lẻ S3.`
                  : 'Toàn bộ dữ liệu đơn hàng đã khớp với kho S3 POS.'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-rose-100/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{s3PendingCount > 0 ? 'Cần đồng bộ' : 'Kho hàng đã khớp'}</span>
              <button
                type="button"
                disabled={isBatchSyncing}
                onClick={onSyncS3}
                className="btn-luxury-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-sm"
              >
                {isBatchSyncing ? (
                  <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <IconLightning className="w-3 h-3 text-white" />
                )}
                <span>{s3PendingCount > 0 ? 'Đồng bộ ngay' : 'Quét lại S3'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Pending Orders Alert */}
          <div className="p-4 rounded-xl border bg-white/95 border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <IconOrders className="w-3.5 h-3.5 text-[#BD3F5B]" />
                  <span>Đơn hàng chờ xử lý</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {pendingOrdersCount} đơn
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {pendingOrdersCount > 0
                  ? `Có ${pendingOrdersCount} đơn hàng mới cần xác nhận đóng gói và chuyển phát.`
                  : 'Không có đơn hàng nào tồn đọng ở trạng thái chờ.'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-rose-100/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{pendingOrdersCount > 0 ? 'Cần đóng gói' : 'Không tồn đọng'}</span>
              <button
                type="button"
                onClick={() => onFilterOrders('pending')}
                className="btn-luxury-secondary text-xs py-1.5 px-3.5"
              >
                Lọc đơn chờ
              </button>
            </div>
          </div>

          {/* Card 3: Campaign & Growth Status */}
          <div className="p-4 rounded-xl border bg-white/95 border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <IconPromotions className="w-3.5 h-3.5 text-[#BD3F5B]" />
                  <span>Banner Flash Sale</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  campaign?.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {campaign?.active ? 'Đang kích hoạt' : 'Tạm ẩn'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed truncate">
                {campaign?.active ? campaign.title : 'Banner Flash Sale trang chủ đang tạm ẩn.'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-rose-100/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Trang chủ SkinID</span>
              <button
                type="button"
                onClick={() => onNavigateTab('promotions')}
                className="btn-luxury-secondary text-xs py-1.5 px-3.5"
              >
                Cấu hình chiến dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
