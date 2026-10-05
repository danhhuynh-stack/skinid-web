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

export default function ProductList() {
  const { products, isReady } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const { brand, step, benefit, sort, query } = readCatalogQuery(searchParams);

  useEffect(() => {
    const normalized = normalizeCatalogQuery(searchParams);
    if (normalized.changed) setSearchParams(normalized.searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const update = (key, value) => {
    setSearchParams(updateCatalogQuery(searchParams, key, value), { replace: true });
  };

  const visibleProducts = useMemo(() => {
    const filtered = filterProducts(products, { brand, step, benefit, query });
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, brand, step, benefit, query, sort]);

  const reset = () => setSearchParams({}, { replace: true });
  const openProduct = productId => document.dispatchEvent(new CustomEvent('skinid:open-product-detail', { detail: { productId } }));

  return (
    <section id="catalog" className="section catalog-section">
      <div className="container">
        <label id="catalog-search" className="catalog-search">
          <span className="catalog-search__icon"><SearchIcon /></span>
          <span className="sr-only">Tìm sản phẩm</span>
          <input id="product-search" type="search" value={query} onChange={event => update('search', event.target.value)} placeholder="Tìm theo tên sản phẩm, thương hiệu, thành phần…" />
        </label>
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
      </div>
    </section>
  );
}
