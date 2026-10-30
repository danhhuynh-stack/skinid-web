import { useEffect, useState } from 'react';
import { fetchMediaLibrary, saveMediaItem, deleteMediaItem } from '../../content/index.js';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, currentUrl = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMediaLibrary()
      .then(res => setItems(res || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return setError('Vui lòng nhập đường dẫn hình ảnh.');
    if (!newAlt.trim()) return setError('Bắt buộc nhập văn bản thay thế (Alt text) chuẩn SEO.');
    setUploading(true);
    setError('');
    try {
      const saved = await saveMediaItem({
        url: newUrl.trim(),
        alt: newAlt.trim(),
        name: newAlt.trim().slice(0, 40)
      });
      setItems(prev => [saved, ...prev]);
      setNewUrl('');
      setNewAlt('');
    } catch (err) {
      setError(err.message || 'Lưu ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi thư viện?')) return;
    try {
      await deleteMediaItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert(err.message || 'Xóa ảnh thất bại.');
    }
  };

  const filteredItems = items.filter(i => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (i.name || '').toLowerCase().includes(q) || (i.alt || '').toLowerCase().includes(q) || (i.url || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#BD3F5B]">Tài nguyên số & Hình ảnh</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Thư viện Ảnh (Media Storage)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Form thêm ảnh mới */}
          <form onSubmit={handleAddMedia} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-800">Thêm hình ảnh mới vào Thư viện</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">
                Đường dẫn hình ảnh (URL / Asset path) *
                <input
                  type="text"
                  placeholder="/images/banners/... hoặc https://..."
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#E06D81]/20 focus:border-[#E06D81]"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Văn bản thay thế (Alt text chuẩn SEO) *
                <input
                  type="text"
                  placeholder="Mô tả nội dung bức ảnh..."
                  value={newAlt}
                  onChange={e => setNewAlt(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#E06D81]/20 focus:border-[#E06D81]"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="btn-luxury-primary text-xs flex items-center gap-2"
              >
                {uploading ? 'Đang lưu...' : '+ Thêm vào Thư viện'}
              </button>
            </div>
          </form>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm hình ảnh theo tên, alt text..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#E06D81]"
            />
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Tổng {filteredItems.length} hình ảnh
            </span>
          </div>

          {/* Grid ảnh */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">Đang tải thư viện ảnh...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">Không có hình ảnh nào phù hợp.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map(item => {
                const isSelected = currentUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition hover:shadow-md ${
                      isSelected ? 'border-[#BD3F5B] ring-2 ring-[#BD3F5B]/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.alt || 'Ảnh'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => { e.target.src = '/og-image.jpg'; }}
                      />
                    </div>
                    <div className="p-2.5 bg-white">
                      <p className="text-[11px] font-semibold text-slate-800 truncate" title={item.alt || item.name}>
                        {item.alt || item.name || 'Ảnh không tên'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={item.url}>
                        {item.url}
                      </p>
                    </div>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Xóa khỏi thư viện"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-rose-600 border border-rose-200/70 shadow-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-rose-50"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button type="button" onClick={onClose} className="btn-luxury-secondary text-xs">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
