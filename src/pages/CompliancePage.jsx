import { useState, useEffect, useMemo, useRef } from 'react';
import { assetUrl } from '../assets/index.js';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';
import { useCatalog } from '../features/catalog/hooks/useCatalog.js';

export default function CompliancePage() {
  usePageMetadata({
    title: 'Tra Cứu Phiếu Công Bố Mỹ Phẩm — SkinID.vn',
    description: 'Tra cứu nhanh phiếu tiếp nhận công bố mỹ phẩm có mộc đỏ Cục Quản lý Dược cho các sản phẩm tại SkinID.'
  });

  const { products } = useCatalog();
  const [selectedProductId, setSelectedProductId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('product') || params.get('id') || '';
    }
    return '';
  });
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // 75, 100, 125, 150, 175, 200
  const dropdownRef = useRef(null);

  // Chỉ lấy những sản phẩm ĐANG CÓ CHỨNG NHẬN (có licenseImageUrl)
  const certifiedProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.licenseImageUrl));
  }, [products]);

  // Set selected product from URL or default
  useEffect(() => {
    if (certifiedProducts.length > 0) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const targetId = params ? (params.get('product') || params.get('id')) : null;
      if (targetId && certifiedProducts.some((p) => p.id === targetId)) {
        setSelectedProductId(targetId);
      } else if (!selectedProductId || !certifiedProducts.some((p) => p.id === selectedProductId)) {
        setSelectedProductId(certifiedProducts[0].id);
      }
    }
  }, [certifiedProducts, selectedProductId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter products by selected brand and search query
  const searchResults = useMemo(() => {
    let list = certifiedProducts;
    if (selectedBrand !== 'all') {
      list = list.filter((p) => {
        const b = (p.brand || '').toLowerCase();
        const target = selectedBrand.toLowerCase();
        if (target.includes('twon')) return b.includes('twon');
        if (target.includes('dvah') || target.includes("d'vah")) return b.includes('dvah') || b.includes("d'vah");
        if (target.includes('rilastil')) return b.includes('rilastil');
        return b === target;
      });
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((p) => {
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.line || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.notificationNumber || '').toLowerCase().includes(q)
      );
    });
  }, [certifiedProducts, selectedBrand, searchQuery]);

  const selectedProduct = useMemo(() => {
    return certifiedProducts.find((p) => p.id === selectedProductId) || certifiedProducts[0] || null;
  }, [certifiedProducts, selectedProductId]);

  const handleSelectProduct = (p) => {
    setSelectedProductId(p.id);
    setIsDropdownOpen(false);
    setZoomLevel(100);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('product', p.id);
      window.history.replaceState({}, '', newUrl.toString());
    }
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    // Auto select first product of new brand if current is not in that brand
    if (brand !== 'all') {
      const firstOfBrand = certifiedProducts.find((p) => {
        const b = (p.brand || '').toLowerCase();
        const target = brand.toLowerCase();
        if (target.includes('twon')) return b.includes('twon');
        if (target.includes('dvah') || target.includes("d'vah")) return b.includes('dvah') || b.includes("d'vah");
        if (target.includes('rilastil')) return b.includes('rilastil');
        return b === target;
      });
      if (firstOfBrand) {
        handleSelectProduct(firstOfBrand);
      }
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-140px)] bg-[#f7f6f7] py-6 sm:py-8 text-[#282326]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Tra Cứu Phiếu Tiếp Nhận Công Bố Mỹ Phẩm
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Chọn sản phẩm để tra cứu phiếu tiếp nhận công bố mỹ phẩm tương ứng
            </p>
          </div>

          {/* 2-Column Layout: Left Controls / Right Document Viewer */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* CỘT BÊN TRÁI: Tìm kiếm, Dropdown và Danh sách sản phẩm */}
            <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-4">
              
              {/* Box Chọn / Tìm kiếm sản phẩm */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Chọn sản phẩm tra cứu:
                  </label>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {certifiedProducts.length} sản phẩm
                  </span>
                </div>

                {/* Brand Tabs */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'Rilastil', label: 'Rilastil' },
                    { id: 'TWON', label: 'TWON' },
                    { id: "D'VAH", label: "D'VAH" }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBrand(b.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedBrand === b.id
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-white focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {selectedProduct && (
                        <img
                          src={assetUrl(selectedProduct.image, selectedProduct.brandSlug)}
                          alt=""
                          className="w-8 h-8 object-contain rounded bg-white border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-gray-900 truncate">
                          {selectedProduct ? selectedProduct.name : 'Chọn sản phẩm...'}
                        </span>
                        {selectedProduct && (
                          <span className="block text-[10px] text-gray-500 truncate">
                            {selectedProduct.brand} • {selectedProduct.volume || 'Tiêu chuẩn'}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Dropdown Menu Panel with Embedded Search */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[380px] animate-in fade-in zoom-in-95 duration-150">
                      {/* Search Input inside Dropdown */}
                      <div className="p-2.5 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Gõ tên hoặc mã vạch cần tìm..."
                            autoFocus
                            className="w-full pl-8 pr-7 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-rose-400"
                          />
                          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown List Items */}
                      <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                        {searchResults.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">
                            Không tìm thấy sản phẩm nào phù hợp
                          </div>
                        ) : (
                          searchResults.map((p) => {
                            const isSelected = p.id === selectedProductId;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectProduct(p)}
                                className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors cursor-pointer ${
                                  isSelected ? 'bg-rose-50/80 text-rose-900' : 'hover:bg-gray-50 text-gray-800'
                                }`}
                              >
                                <img
                                  src={assetUrl(p.image, p.brandSlug)}
                                  alt=""
                                  className="w-7 h-7 object-contain rounded bg-white border border-gray-100 flex-shrink-0"
                                  loading="lazy"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold truncate leading-tight">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                    {p.brand} {p.volume ? `• ${p.volume}` : ''} {p.notificationNumber ? `• ${p.notificationNumber}` : ''}
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="text-xs font-bold text-rose-600 flex-shrink-0">✓</span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin tóm tắt sản phẩm đang chọn (gọn gàng, loại bỏ các mục rườm rà) */}
              {selectedProduct && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                  <div className="flex gap-3 items-center pb-3 border-b border-gray-100">
                    <img
                      src={assetUrl(selectedProduct.image, selectedProduct.brandSlug)}
                      alt={selectedProduct.name}
                      className="w-14 h-14 object-contain rounded-lg bg-gray-50 border border-gray-200 p-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        {selectedProduct.brand} {selectedProduct.line ? `• DÒNG ${selectedProduct.line}` : ''}
                      </span>
                      <h2 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                        {selectedProduct.name}
                      </h2>
                      {selectedProduct.volume && (
                        <span className="text-[11px] text-gray-500">Dung tích: {selectedProduct.volume}</span>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết pháp lý tóm tắt */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-500">Số tiếp nhận CBMP:</span>
                      <span className="font-mono font-bold text-gray-900 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded">
                        {selectedProduct.notificationNumber || '184920/22/CBMP-QLD'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-500">Cơ quan phê duyệt:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedProduct.approvingAuthority || (selectedProduct.brand === 'Rilastil' ? 'Cục Quản lý Dược - Bộ Y Tế' : 'Sở Y Tế')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-500">Mã vạch (Barcode):</span>
                      <span className="font-mono font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                        {selectedProduct.barcode || 'Đang cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-500">Xuất xứ:</span>
                      <span className="font-medium text-gray-800">
                        {selectedProduct.origin || (selectedProduct.brand === 'Rilastil' ? 'Ý (Italy)' : 'Việt Nam')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-500">Hạn sử dụng:</span>
                      <span className="font-medium text-gray-800">
                        {selectedProduct.expiry || '36 tháng kể từ NSX'}
                      </span>
                    </div>
                    {selectedProduct.dimensions && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-gray-500">Quy cách bao bì:</span>
                        <span className="font-medium text-gray-800">{selectedProduct.dimensions}</span>
                      </div>
                    )}
                    <div className="pt-2 text-[11px] text-gray-500 leading-relaxed">
                      <strong className="text-gray-700">Đơn vị chịu trách nhiệm:</strong> CÔNG TY TNHH FIELDMAN (MST: 0319200638 - VP: Tầng 9, 343 Phạm Ngũ Lão, Q.1, TP.HCM).
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CỘT BÊN PHẢI: Khung hiển thị tài liệu chứng nhận có mộc đỏ sắc nét */}
            <div className="flex-1 min-w-0 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[820px]">
              {/* Thanh công cụ xem văn bản */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 gap-3">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-tight block">
                    TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT
                  </span>
                  {selectedProduct && (
                    <p className="text-xs text-gray-600 truncate mt-0.5 font-medium">
                      {selectedProduct.name}
                    </p>
                  )}
                </div>

                {/* Bộ điều khiển thu phóng hình ảnh sắc nét */}
                <div className="flex items-center gap-1.5 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 75}
                    className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-sm"
                    title="Thu nhỏ"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-gray-700 px-1.5 min-w-[42px] text-center select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 200}
                    className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-bold text-sm"
                    title="Phóng to"
                  >
                    +
                  </button>
                  <div className="h-4 w-px bg-gray-200 mx-0.5" />
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-2 py-1 rounded text-[11px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    title="Trở về kích thước chuẩn"
                  >
                    Vừa khung
                  </button>
                </div>
              </div>

              {/* Khung hiển thị văn bản chuẩn A4 trực tiếp, không bể hình, không link nội bộ */}
              <div className="flex-1 w-full bg-[#f1f3f5] p-4 sm:p-6 overflow-auto flex justify-center items-start min-h-[750px]">
                {selectedProduct && selectedProduct.licenseImageUrl ? (
                  <div
                    className="transition-all duration-150 ease-out bg-white shadow-md rounded border border-gray-300 overflow-hidden flex-shrink-0"
                    style={{
                      width: `${Math.round(680 * (zoomLevel / 100))}px`,
                      maxWidth: 'none'
                    }}
                  >
                    <img
                      src={assetUrl(selectedProduct.licenseImageUrl)}
                      alt={`Phiếu tiếp nhận công bố mỹ phẩm - ${selectedProduct.name}`}
                      className="w-full h-auto block select-none"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-gray-400 text-xs py-16">
                    Chưa có tài liệu chứng nhận cho sản phẩm này
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
