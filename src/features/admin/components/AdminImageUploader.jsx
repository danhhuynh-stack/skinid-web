import { useRef, useState } from 'react';
import { compressAndProcessImage } from '../services/imageUploadService.js';

export default function AdminImageUploader({
  value,
  onChange,
  label = 'Hình ảnh sản phẩm / bài viết',
  helpText = 'Khuyến nghị ảnh vuông hoặc tỉ lệ 4:3, tối đa 5MB. Hệ thống tự động tối ưu hóa WebP.',
  previewHeight = 'h-40'
}) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const result = await compressAndProcessImage(file);
      onChange(result.dataUrl);
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
          >
            Xóa ảnh
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center ${
          dragOver ? 'border-[#D04862] bg-rose-50/50' : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
        />

        {value ? (
          <div className="relative group w-full flex flex-col items-center">
            <div className={`${previewHeight} w-full max-w-xs rounded-xl overflow-hidden bg-white border border-stone-200 p-2 flex items-center justify-center shadow-2xs`}>
              <img
                src={value}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-50 cursor-pointer shadow-2xs"
              >
                Đổi ảnh khác
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D04862] flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Kéo thả file ảnh vào đây hoặc
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              Chọn ảnh từ máy
            </button>
            <span className="text-[11px] text-slate-400 mt-2">{helpText}</span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-2xl flex items-center justify-center">
            <span className="text-xs font-bold text-[#D04862] animate-pulse">Đang nén &amp; tải ảnh...</span>
          </div>
        )}
      </div>

      {/* Hoặc nhập URL thủ công */}
      <div className="pt-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc nhập đường dẫn URL ảnh (VD: /images/products/... hoặc https://...)"
            className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:border-rose-400 font-mono text-slate-700"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
