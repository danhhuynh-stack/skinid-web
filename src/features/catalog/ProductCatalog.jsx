import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { filterProducts, useCatalog } from './index.js';
import { CATALOG_OPTIONS, normalizeCatalogQuery, readCatalogQuery, updateCatalogQuery } from './catalog.query.mjs';

function ChevronIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

function ResetFilterIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /></svg>;
}

function CatalogDropdown({ id, kind, label, value, onChange, sort = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const options = CATALOG_OPTIONS[kind];
  const selected = options.find(option => option.value === value) || options[0];

  useEffect(() => {
    const close = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <div ref={rootRef} className={`catalog-filter-select${sort ? ' catalog-filter-select--sort' : ''}`} data-catalog-dropdown>
      <div className="catalog-dropdown">
        <button id={id} className="catalog-dropdown__trigger" type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`Lọc theo ${label.toLowerCase()}`} onClick={() => setOpen(current => !current)}>
          <span>{value === 'all' && !sort ? label : selected.label}</span><ChevronIcon />
        </button>
        <div className="catalog-dropdown__panel" role="listbox" aria-label={label} hidden={!open}>
          {options.map(option => (
            <button key={option.value} className={`catalog-dropdown__option${option.value === value ? ' is-active' : ''}`} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }}>
              <span className="catalog-dropdown__check" aria-hidden="true">✓</span><span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRICE_OPTIONS = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: 'under-500k', label: 'Dưới 500k' },
  { value: '500k-1000k', label: '500k – 1 triệu' },
  { value: 'over-1000k', label: 'Trên 1 triệu' }
];

function FilterIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
}

function CloseModalIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export default function ProductList() {
  const { products, isReady } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const { brand, step, benefit, sort, query } = readCatalogQuery(searchParams);
  const priceRange = searchParams.get('price') || 'all';
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeFilterCount = (brand !== 'all' ? 1 : 0) + (step !== 'all' ? 1 : 0) + (benefit !== 'all' ? 1 : 0) + (priceRange !== 'all' ? 1 : 0);

  useEffect(() => {
    const normalized = normalizeCatalogQuery(searchParams);
    if (normalized.changed) setSearchParams(normalized.searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const update = (key, value) => {
    setSearchParams(updateCatalogQuery(searchParams, key, value), { replace: true });
  };

  const handlePriceChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'all' || val === priceRange) next.delete('price');
    else next.set('price', val);
    setSearchParams(next, { replace: true });
  };

  const visibleProducts = useMemo(() => {
    let filtered = filterProducts(products, { brand, step, benefit, query });
    if (priceRange === 'under-500k') {
      filtered = filtered.filter(p => Number(p.price) < 500000);
    } else if (priceRange === '500k-1000k') {
      filtered = filtered.filter(p => Number(p.price) >= 500000 && Number(p.price) <= 1000000);
    } else if (priceRange === 'over-1000k') {
      filtered = filtered.filter(p => Number(p.price) > 1000000);
    }

    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, brand, step, benefit, query, sort, priceRange]);

  const reset = () => setSearchParams({}, { replace: true });
  const openProduct = productId => document.dispatchEvent(new CustomEvent('skinid:open-product-detail', { detail: { productId } }));

  return (
    <section id="catalog" className="section catalog-section">
      <div className="container">
        <label id="catalog-search" className="catalog-search">
          <span className="catalog-search__icon"><SearchIcon /></span>
          <span className="sr-only">Tìm sản phẩm</span>
          <input id="product-search" type="search" value={query} onChange={event => update('search', event.target.value)} placeholder="Tìm sản phẩm, thương hiệu..." />
        </label>

        {/* Mobile Filter & Sort Quick Bar */}
        <div className="catalog-mobile-quick-bar" aria-label="Bộ lọc nhanh mobile">
          <button
            type="button"
            className={`catalog-mobile-trigger${activeFilterCount > 0 ? ' is-active' : ''}`}
            onClick={() => setMobileFilterOpen(true)}
          >
            <FilterIcon />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && <span className="catalog-mobile-badge">{activeFilterCount}</span>}
          </button>
          <div className="catalog-mobile-meta">
            <span className="catalog-mobile-count">{isReady ? `${visibleProducts.length} sản phẩm` : 'Đang tải…'}</span>
            <CatalogDropdown id="catalog-sort-mobile" kind="sort" label="Sắp xếp" value={sort} onChange={value => update('sort', value)} sort />
          </div>
        </div>

        {/* Desktop Price & Toolbar */}
        <div className="catalog-price-quick-bar" aria-label="Lọc nhanh theo mức giá">
          <span className="catalog-price-quick-title">Khoảng giá:</span>
          <div className="catalog-price-quick-pills">
            {PRICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`catalog-price-quick-pill${priceRange === opt.value ? ' is-active' : ''}`}
                onClick={() => handlePriceChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="shop-toolbar" aria-label="Bộ lọc và sắp xếp sản phẩm">
          <div className="catalog-filter-cluster">
            <CatalogDropdown id="brand-filter-select" kind="brand" label="Thương hiệu" value={brand} onChange={value => update('brand', value)} />
            <CatalogDropdown id="step-filter-select" kind="step" label="Danh mục" value={step} onChange={value => update('step', value)} />
            <CatalogDropdown id="benefit-filter-select" kind="benefit" label="Nhu cầu" value={benefit} onChange={value => update('benefit', value)} />
          </div>
          <div id="filter-result-count" className="catalog-result-count">
            {isReady ? <><strong>{visibleProducts.length}</strong> sản phẩm</> : 'Đang tải sản phẩm…'}
          </div>
          <CatalogDropdown id="catalog-sort" kind="sort" label="Sắp xếp" value={sort} onChange={value => update('sort', value)} sort />
          <button className="catalog-reset" type="button" onClick={reset}><ResetFilterIcon /><span>Xóa bộ lọc</span></button>
        </div>

        {/* Product Grid */}
        <div id="product-grid" aria-live="polite" aria-busy={!isReady}>
          {isReady && visibleProducts.map(product => <ProductCard key={product.id} product={product} onOpen={openProduct} />)}
          {isReady && visibleProducts.length === 0 && (
            <div className="col-span-full text-center py-20 px-6 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
              <h2 className="text-base font-semibold text-gray-900">Không tìm thấy sản phẩm phù hợp</h2>
              <p className="text-xs text-gray-500 mt-2 max-w-md">Bộ lọc hiện tại không có kết quả khớp. Hãy xóa tiêu chí lọc để xem toàn bộ danh mục.</p>
              <button type="button" className="catalog-reset mt-5" onClick={reset}><ResetFilterIcon /><span>Xóa bộ lọc &amp; Xem tất cả</span></button>
            </div>
          )}
        </div>

        {/* Mobile Filter Bottom-Sheet Drawer */}
        {mobileFilterOpen && (
          <div className="catalog-sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setMobileFilterOpen(false); }}>
            <div className="catalog-sheet-panel">
              <div className="catalog-sheet-header">
                <div className="flex items-center gap-2">
                  <FilterIcon />
                  <h3>Bộ lọc sản phẩm</h3>
                  {activeFilterCount > 0 && <span className="catalog-sheet-badge">{activeFilterCount} đang chọn</span>}
                </div>
                <button type="button" className="catalog-sheet-close" onClick={() => setMobileFilterOpen(false)} aria-label="Đóng bộ lọc">
                  <CloseModalIcon />
                </button>
              </div>
              <div className="catalog-sheet-body">
                <div className="catalog-sheet-group">
                  <h4>Khoảng giá</h4>
                  <div className="catalog-sheet-pills">
                    {PRICE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`catalog-sheet-pill${priceRange === opt.value ? ' is-active' : ''}`}
                        onClick={() => handlePriceChange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="catalog-sheet-group">
                  <h4>Thương hiệu</h4>
                  <div className="catalog-sheet-pills">
                    {CATALOG_OPTIONS.brand.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`catalog-sheet-pill${brand === opt.value ? ' is-active' : ''}`}
                        onClick={() => update('brand', opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="catalog-sheet-group">
                  <h4>Danh mục chăm sóc</h4>
                  <div className="catalog-sheet-pills">
                    {CATALOG_OPTIONS.step.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`catalog-sheet-pill${step === opt.value ? ' is-active' : ''}`}
                        onClick={() => update('step', opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="catalog-sheet-group">
                  <h4>Nhu cầu làn da</h4>
                  <div className="catalog-sheet-pills">
                    {CATALOG_OPTIONS.benefit.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`catalog-sheet-pill${benefit === opt.value ? ' is-active' : ''}`}
                        onClick={() => update('benefit', opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="catalog-sheet-footer">
                <button
                  type="button"
                  className="catalog-sheet-reset"
                  onClick={() => { reset(); }}
                >
                  Thiết lập lại
                </button>
                <button
                  type="button"
                  className="catalog-sheet-apply"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Xem {visibleProducts.length} sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
