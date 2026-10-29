import { useState } from 'react';

export default function AdminSeoInspector({
  title = '',
  description = '',
  slug = '',
  image = '',
  canonicalUrl = '',
  basePath = 'products',
  onChangeTitle,
  onChangeDescription,
  onChangeSlug,
  onChangeCanonical
}) {
  const [devicePreview, setDevicePreview] = useState('mobile'); // 'mobile' | 'desktop'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://skinid.vn';
  const displayUrl = `${origin}/${basePath}/${slug || 'ten-san-pham-hoac-bai-viet'}`;

  const titleLength = (title || '').length;
  const descLength = (description || '').length;

  const titleColor = titleLength === 0 ? 'text-slate-400' : (titleLength > 65 ? 'text-rose-600 font-bold' : (titleLength >= 40 ? 'text-emerald-600 font-semibold' : 'text-amber-600'));
  const descColor = descLength === 0 ? 'text-slate-400' : (descLength > 160 ? 'text-rose-600 font-bold' : (descLength >= 110 ? 'text-emerald-600 font-semibold' : 'text-amber-600'));

  return (
    <div className="space-y-5 bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            SEO Master Suite &amp; Google SERP Preview
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Xem trước giao diện hiển thị trên Google Search và mạng xã hội (Facebook, Zalo)
          </p>
        </div>
        <div className="inline-flex items-center bg-white border border-stone-200 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setDevicePreview('mobile')}
            className={`px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${devicePreview === 'mobile' ? 'bg-stone-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setDevicePreview('desktop')}
            className={`px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${devicePreview === 'desktop' ? 'bg-stone-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Desktop
          </button>
        </div>
      </div>

      {/* Google SERP Snippet Preview Box */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs font-sans">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
            S
          </div>
          <span className="text-[11px] text-slate-600 font-medium">SkinID Dược Mỹ Phẩm</span>
        </div>
        <div className="text-[11px] text-emerald-800 truncate mb-1">
          {displayUrl}
        </div>
        <h5 className={`text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2 ${devicePreview === 'mobile' ? 'text-sm' : 'text-base'}`}>
          {title || 'Tiêu đề hiển thị trên Google Search...'}
        </h5>
        <p className="text-xs text-[#4d5156] line-clamp-2 mt-1 leading-relaxed">
          {description || 'Mô tả tóm tắt nội dung sẽ xuất hiện trên trang kết quả tìm kiếm của Google khi người dùng tìm kiếm...'}
        </p>
      </div>

      {/* Inputs with Live Character Counters */}
      <div className="space-y-4 pt-2">
        {/* Title Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              SEO Meta Title:
            </label>
            <span className={`text-[11px] ${titleColor}`}>
              {titleLength} / 65 ký tự (Khuyến nghị: 50 - 60)
            </span>
          </div>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onChangeTitle?.(e.target.value)}
            placeholder="VD: Kem Chống Nắng Kiềm Dầu Rilastil Sun Secret SPF50+ | SkinID.vn"
            className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Description Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              SEO Meta Description:
            </label>
            <span className={`text-[11px] ${descColor}`}>
              {descLength} / 160 ký tự (Khuyến nghị: 120 - 155)
            </span>
          </div>
          <textarea
            rows="2"
            value={description || ''}
            onChange={(e) => onChangeDescription?.(e.target.value)}
            placeholder="VD: Kem chống nắng kiểm soát dầu thừa, nâng tông tự nhiên và chống tia UVA/UVB toàn diện từ Viện Da liễu Ý..."
            className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Slug Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Custom URL Slug:
            </label>
            <div className="flex items-center rounded-xl border border-stone-200 bg-white overflow-hidden">
              <span className="px-2.5 py-2 bg-stone-100 text-slate-500 text-[11px] font-mono border-r border-stone-200">
                /{basePath}/
              </span>
              <input
                type="text"
                value={slug || ''}
                onChange={(e) => onChangeSlug?.(e.target.value)}
                placeholder="ten-san-pham"
                className="flex-1 px-2.5 py-2 text-xs bg-transparent outline-none font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Canonical URL (Tùy chọn):
            </label>
            <input
              type="text"
              value={canonicalUrl || ''}
              onChange={(e) => onChangeCanonical?.(e.target.value)}
              placeholder="https://skinid.vn/..."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
