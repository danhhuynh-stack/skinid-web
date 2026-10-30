import { useState } from 'react';
import { generateBulkCoupons } from '../services/operationsService.js';
import { IconClose, IconCheck, IconAlert } from './AdminIcons.jsx';

export default function BulkCouponModal({
  isOpen,
  onClose,
  onSaveBulkCoupons
}) {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('SKINID-');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(300000);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const numCount = Number(count);
    if (!numCount || numCount < 1 || numCount > 100) {
      setError('Số lượng mã cần tạo phải từ 1 đến 100 mã.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generated = generateBulkCoupons({
        count: numCount,
        prefix,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        maxUses: 1
      });

      await onSaveBulkCoupons(generated);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể tạo mã giảm giá hàng loạt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Tạo mã Voucher hàng loạt (1 lần dùng)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sinh hàng loạt mã ngẫu nhiên duy nhất cho chiến dịch Marketing</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số lượng mã cần tạo</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#BD3F5B]"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tiền tố mã (Prefix)</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="VD: VIP-, TET2027-"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none uppercase font-mono focus:bg-white focus:border-[#BD3F5B]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Loại giảm giá</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-[#BD3F5B]"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {discountType === 'percent' ? 'Mức giảm (%)' : 'Mức giảm (VNĐ)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#BD3F5B]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đơn hàng tối thiểu (VNĐ)</label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#BD3F5B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hạn sử dụng</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer focus:bg-white focus:border-[#BD3F5B]"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            💡 Mỗi mã được tạo sẽ có 6 ký tự ngẫu nhiên duy nhất phía sau tiền tố và chỉ dùng được <strong>1 lần duy nhất</strong> (single-use) nhằm chống lạm dụng mã khuyến mãi.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-luxury-secondary text-xs px-4 py-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-luxury-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? 'Đang tạo…' : `⚡ Tạo ngay ${count} mã Voucher`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
