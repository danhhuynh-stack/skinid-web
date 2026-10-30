import { useState } from 'react';
import {
  calculateCustomer360Metrics,
  anonymizeCustomerAccount
} from '../services/operationsService.js';
import { IconClose, IconCheck, IconAlert } from './AdminIcons.jsx';

export default function CustomerDetailDrawer({
  user,
  allOrders = [],
  allSkinReports = [],
  onClose,
  onRefresh,
  actor = {}
}) {
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!user) return null;

  const metrics = calculateCustomer360Metrics(user, allOrders, allSkinReports);
  const { totalSpent, orderCount, avgOrderValue, rfmSegment, validOrders, skinReports } = metrics || {};

  const money = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);

  const handleExportDataJson = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      regulation: 'Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 & Nghị định 356/2025/NĐ-CP',
      user: {
        id: user.id || user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt
      },
      metrics: {
        totalSpent,
        orderCount,
        avgOrderValue,
        rfmSegment: rfmSegment?.label
      },
      orders: validOrders,
      skinReports
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_data_${user.email || user.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnonymize = async () => {
    setIsAnonymizing(true);
    setFeedback(null);
    try {
      const res = await anonymizeCustomerAccount(user.id || user.uid, actor);
      setFeedback({ type: 'success', message: res.message });
      setConfirmPrompt(false);
      onRefresh?.();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi ẩn danh hóa.' });
    } finally {
      setIsAnonymizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#BD3F5B] to-[#E06D81] text-white flex items-center justify-center font-bold text-base shadow-sm">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{user.name || 'Khách hàng SkinID'}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email || '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs admin-custom-scroll">
          {/* RFM Badge & Core Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hạng thành viên</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${rfmSegment?.badge || ''}`}>
                {rfmSegment?.label || 'Mới'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tổng chi tiêu (LTV)</span>
              <span className="font-bold font-mono text-slate-900 text-xs">{money(totalSpent)}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Đơn thành công</span>
              <span className="font-bold text-slate-900 text-xs">{orderCount} đơn</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <span className="font-bold text-[11px] uppercase text-slate-700 tracking-wider block">Thông tin liên hệ</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Số điện thoại: <strong className="text-slate-900 font-mono">{user.phone || '—'}</strong></div>
              <div>Hình thức: <span className="font-semibold capitalize">{user.provider || 'Google'}</span></div>
              <div className="col-span-2">Địa chỉ: <span className="font-medium text-slate-800">{user.address || 'Chưa lưu địa chỉ'}</span></div>
            </div>
          </div>

          {/* Orders History Tab */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase text-slate-700">Lịch sử đơn hàng ({validOrders.length})</span>
              <span className="text-[11px] text-slate-400">AOV: {money(avgOrderValue)}/đơn</span>
            </div>
            {validOrders.length === 0 ? (
              <p className="p-4 text-center bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                Chưa có đơn hàng nào phát sinh.
              </p>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                {validOrders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="p-3 hover:bg-slate-50/80 flex items-center justify-between transition">
                    <div>
                      <span className="font-mono font-bold text-slate-800 block">#{ord.id.slice(-8)}</span>
                      <span className="text-[10px] text-slate-400">
                        {ord.createdAt ? new Date(ord.createdAt?.seconds ? ord.createdAt.seconds * 1000 : ord.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">{money(ord.total)}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        {ord.status || 'Hoàn tất'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & PDPA Compliance Actions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="font-bold text-xs text-slate-900 block">Tuân thủ Dữ liệu cá nhân (PDPA Compliance)</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Theo Luật Bảo vệ Dữ liệu cá nhân 91/2025/QH15, khách hàng có quyền yêu cầu xuất bản sao toàn bộ dữ liệu hoặc yêu cầu ẩn danh hóa thông tin cá nhân.
            </p>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? <IconCheck className="w-4 h-4 text-emerald-600" /> : <IconAlert className="w-4 h-4 text-rose-600" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportDataJson}
                className="btn-luxury-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
              >
                <span>📥 Xuất gói dữ liệu JSON</span>
              </button>

              {!confirmPrompt ? (
                <button
                  type="button"
                  onClick={() => setConfirmPrompt(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  <span>Ẩn danh hóa tài khoản (Quên tôi)</span>
                </button>
              ) : (
                <div className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 mt-2">
                  <p className="font-bold text-rose-800 text-[11px]">
                    Xác nhận ẩn danh hóa thông tin? Hành động này xóa PII của khách nhưng BẢO TOÀN toàn bộ đơn hàng và doanh thu cho kế toán.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isAnonymizing}
                      onClick={handleAnonymize}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition"
                    >
                      {isAnonymizing ? 'Đang xử lý…' : 'Đồng ý Ẩn danh hóa'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPrompt(false)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs hover:bg-slate-300"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-luxury-secondary text-xs px-4 py-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
