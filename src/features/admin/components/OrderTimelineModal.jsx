import { useState } from 'react';
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  canTransitionOrderStatus,
  generateDeliveryNoteHtml
} from '../services/operationsService.js';
import { IconClose, IconPhone, IconCheck, IconAlert } from './AdminIcons.jsx';

export default function OrderTimelineModal({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  isAdmin,
  isStaff
}) {
  const [internalNote, setInternalNote] = useState(order?.internalNote || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  if (!order) return null;

  const orderCode = order.id?.startsWith('#') ? order.id : `#${order.id || 'ORD'}`;
  const customer = order.customer || {};
  const currentStatus = order.status || 'pending';
  const allowedNextStatuses = ORDER_STATUS_FLOW[currentStatus] || [];

  const handlePrintDeliveryNote = () => {
    const html = generateDeliveryNoteHtml(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const money = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);

  const cleanPhone = (customer.phone || '').replace(/[\s.-]/g, '');
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : null;
  const telUrl = cleanPhone ? `tel:${cleanPhone}` : null;

  const handleSaveInternalNote = async () => {
    setIsSavingNote(true);
    try {
      await onUpdateStatus(order.id, { internalNote });
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900">{orderCode}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-[#BD3F5B] border border-rose-200/60">
                {ORDER_STATUS_LABELS[currentStatus] || currentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Chi tiết vận hành & Dòng thời gian đơn hàng</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-600 admin-custom-scroll">
          {/* Quick Action Toolbar */}
          <div className="p-3 bg-gradient-to-r from-rose-50/50 via-white to-slate-50/60 rounded-2xl border border-rose-100/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {telUrl && (
                <a
                  href={telUrl}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <IconPhone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gọi {customer.phone}</span>
                </a>
              )}
              {zaloUrl && (
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 transition inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Nhắn Zalo</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrintDeliveryNote}
              className="px-3.5 py-1.5 rounded-xl bg-[#BD3F5B] hover:bg-[#a3324b] text-white font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>🖨️ In Phiếu Giao Hàng A5</span>
            </button>
          </div>

          {/* Customer & Delivery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider block">Người nhận hàng</span>
              <p className="font-bold text-sm text-slate-900">{customer.name || 'Khách hàng SkinID'}</p>
              <p className="font-mono text-slate-700">SĐT: {customer.phone || 'Chưa cung cấp'}</p>
              <p className="text-slate-500 leading-relaxed">Địa chỉ: {customer.address || 'Giao tại quầy'}</p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider block">Thanh toán & Kho hàng</span>
              <div className="flex items-center justify-between">
                <span>Tổng tiền:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">{money(order.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trạng thái tiền:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán (COD)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>S3 POS:</span>
                <span className="font-bold font-mono text-slate-700">
                  {order.s3SyncStatus === 'synced' ? `Đã đồng bộ (#${String(order.s3OrderId || '').slice(-6)})` : 'Chưa đồng bộ'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <span className="font-bold text-[11px] uppercase text-slate-700 mb-2 block">Danh mục sản phẩm trong đơn</span>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3 text-center">SL</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.name || it.title || it.sku}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#BD3F5B]">{it.quantity || 1}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{money(it.price || 0)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {money((it.price || 0) * (it.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Next Transition Controls */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="font-bold text-xs text-slate-900 block">Quy trình điều phối trạng thái đơn</span>
            {allowedNextStatuses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Đơn hàng đã ở trạng thái kết thúc ({ORDER_STATUS_LABELS[currentStatus] || currentStatus}).</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allowedNextStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(order.id, { status: st })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                      st === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    → Chuyển sang: {ORDER_STATUS_LABELS[st] || st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Internal Note */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-slate-800 block">Ghi chú nội bộ vận hành (Chỉ CSKH & Admin thấy)</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Ghi chú về hẹn giờ giao, tình trạng đóng gói, yêu cầu đặc biệt của khách…"
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#BD3F5B] transition"
            />
            <div className="flex items-center justify-between pt-1">
              {noteSuccess ? (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <IconCheck className="w-3.5 h-3.5" /> Đã lưu ghi chú!
                </span>
              ) : <span />}
              <button
                type="button"
                disabled={isSavingNote}
                onClick={handleSaveInternalNote}
                className="btn-luxury-secondary text-xs px-3.5 py-1.5 cursor-pointer"
              >
                {isSavingNote ? 'Đang lưu…' : 'Lưu ghi chú nội bộ'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
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
