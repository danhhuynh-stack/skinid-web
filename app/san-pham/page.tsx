'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard, { Product } from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function ProductCatalog() {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');

  const products = productsData as Product[];

  // Filter logic
  let filtered = products.filter((p) => {
    if (selectedBrand !== 'all' && p.brandSlug !== selectedBrand) return false;
    if (selectedTier !== 'all' && p.tier !== selectedTier) return false;
    return true;
  });

  // Sort logic
  if (sortOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-24">
        
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-espresso">
            Cửa Hàng Dược Mỹ Phẩm Chính Hãng
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Danh mục sản phẩm từ Rilastil, TWON và DVAH — Đã kiểm định & minh bạch giá
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white/80 p-4 rounded-3xl border border-brand-petal/40 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Brand & Tier Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-brand-muted mr-1">
              <Filter className="w-3.5 h-3.5 text-brand-pink" />
              <span>Lọc:</span>
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-brand-soft border border-brand-petal/40 text-xs font-medium text-brand-espresso focus:outline-none focus:ring-1 focus:ring-brand-pink"
            >
              <option value="all">Tất cả nhãn hàng</option>
              <option value="rilastil">Rilastil (Ý)</option>
              <option value="twon">TWON</option>
              <option value="dvah">DVAH Premium</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-brand-soft border border-brand-petal/40 text-xs font-medium text-brand-espresso focus:outline-none focus:ring-1 focus:ring-brand-pink"
            >
              <option value="all">Tất cả phân khúc</option>
              <option value="Essential">Essential (Cơ bản)</option>
              <option value="Select">Select (Trung cấp)</option>
              <option value="Signature">Signature (Cao cấp)</option>
            </select>
          </div>

          {/* Price Sorting */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-pink" />
            <span className="text-xs text-brand-muted">Sắp xếp giá:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-1.5 rounded-full bg-brand-soft border border-brand-petal/40 text-xs font-medium text-brand-espresso focus:outline-none focus:ring-1 focus:ring-brand-pink"
            >
              <option value="default">Mặc định</option>
              <option value="asc">Giá thấp đến cao</option>
              <option value="desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-brand-muted mb-4">
          Hiển thị <strong>{filtered.length}</strong> sản phẩm phù hợp
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
