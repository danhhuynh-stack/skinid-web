'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard, { Product } from '@/components/ProductCard';
import productsData from '@/data/products.json';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, FileCheck, MessageCircleHeart, Sparkle } from 'lucide-react';

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const products = productsData as Product[];

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  const filteredProducts = selectedBrand === 'all'
    ? products.slice(0, 12)
    : products.filter(p => p.brandSlug === selectedBrand).slice(0, 12);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header cartCount={cart.length} />

      {/* Main Content */}
      <main className="flex-1 pb-16">

        {/* 1. DUAL-DOOR HERO SECTION (Mobile-First) */}
        <section className="relative overflow-hidden pt-6 pb-10 px-4 bg-gradient-to-b from-brand-soft via-brand-blush/60 to-brand-soft">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-pink/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-brand-petal/50 text-brand-pink text-xs font-semibold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skin AI + Multibrand E-commerce v2</span>
            </div>

            {/* Title & Description */}
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-brand-espresso leading-tight mb-3">
              Khám Phá Làn Da & Phác Đồ <br />
              <span className="bg-gradient-to-r from-brand-pink to-brand-pink-bright bg-clip-text text-transparent">
                Chăm Sóc Da Cá Nhân Hóa
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto mb-6 leading-relaxed">
              Phân tích làn da thông minh bằng AI công nghệ cao. Đề xuất sản phẩm chính hãng từ <strong className="text-brand-espresso font-semibold">Rilastil, TWON & DVAH</strong> phù hợp với đúng loại da và ngân sách của bạn.
            </p>

            {/* DUAL DOOR ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              
              {/* DOOR 1: Primary Button - AI Scan */}
              <Link
                href="/phan-tich-da"
                className="w-full sm:w-auto min-w-[220px] py-3.5 px-6 rounded-full bg-gradient-to-r from-brand-pink via-brand-pink-bright to-brand-pink text-white font-semibold text-sm shadow-pink-glow hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkle className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform" />
                <span>Phân tích làn da ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* DOOR 2: Secondary Action - Shop Now */}
              <Link
                href="/san-pham"
                className="w-full sm:w-auto min-w-[180px] py-3.5 px-6 rounded-full bg-white/90 border border-brand-petal text-brand-espresso font-medium text-sm hover:bg-brand-blush active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Xem tất cả sản phẩm</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. TRUST BADGES STRIP */}
        <section className="border-y border-brand-petal/30 bg-white/60 py-3.5 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 text-center">
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-pink" />
              <span className="text-[11px] sm:text-xs font-medium text-brand-espresso">100% Chính Hãng</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <FileCheck className="w-4 h-4 text-brand-pink" />
              <span className="text-[11px] sm:text-xs font-medium text-brand-espresso">Giá Đã Gồm VAT 8%</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <MessageCircleHeart className="w-4 h-4 text-brand-pink" />
              <span className="text-[11px] sm:text-xs font-medium text-brand-espresso">Tư Vấn Zalo 1-on-1</span>
            </div>

          </div>
        </section>

        {/* 3. MULTIBRAND SHOWCASE FILTER */}
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-brand-espresso">
                Thương hiệu phân phối
              </h2>
              <p className="text-xs text-brand-muted">Chọn nhãn hàng để xem sản phẩm dược mỹ phẩm đã duyệt</p>
            </div>

            <Link href="/san-pham" className="text-xs text-brand-pink font-semibold flex items-center gap-1 hover:underline">
              Tất cả ({products.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Brand Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedBrand === 'all'
                  ? 'bg-brand-pink text-white shadow-pink-glow'
                  : 'bg-white border border-brand-petal/50 text-brand-espresso hover:bg-brand-blush'
              }`}
            >
              Tất cả thương hiệu ({products.length})
            </button>

            <button
              onClick={() => setSelectedBrand('rilastil')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedBrand === 'rilastil'
                  ? 'bg-brand-pink text-white shadow-pink-glow'
                  : 'bg-white border border-brand-petal/50 text-brand-espresso hover:bg-brand-blush'
              }`}
            >
              <span>Rilastil (Ý)</span>
            </button>

            <button
              onClick={() => setSelectedBrand('twon')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedBrand === 'twon'
                  ? 'bg-brand-pink text-white shadow-pink-glow'
                  : 'bg-white border border-brand-petal/50 text-brand-espresso hover:bg-brand-blush'
              }`}
            >
              <div className="relative w-4 h-4">
                <Image src="/images/brands/logo-twon.png" alt="TWON" fill className="object-contain" />
              </div>
              <span>TWON Body</span>
            </button>

            <button
              onClick={() => setSelectedBrand('dvah')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedBrand === 'dvah'
                  ? 'bg-brand-pink text-white shadow-pink-glow'
                  : 'bg-white border border-brand-petal/50 text-brand-espresso hover:bg-brand-blush'
              }`}
            >
              <div className="relative w-4 h-4">
                <Image src="/images/brands/logo-dvah.png" alt="DVAH" fill className="object-contain" />
              </div>
              <span>DVAH Premium</span>
            </button>
          </div>
        </section>

        {/* 4. PRODUCT CATALOG GRID */}
        <section className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* 5. ROUTINE BY BUDGET COMBO PROMO */}
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="rounded-3xl glass-card p-6 sm:p-8 relative overflow-hidden">
            <div className="max-w-lg relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-pink mb-1 block">
                Phác đồ gợi ý theo Ngân sách
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-brand-espresso mb-2">
                Không biết bắt đầu từ đâu?
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted mb-5 leading-relaxed">
                Trải nghiệm tính năng phân tích da bằng AI của SkinID để nhận trọn bộ Routine (Essential / Select / Signature) được tối ưu riêng cho làn da của bạn.
              </p>

              <Link
                href="/phan-tich-da"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-pink text-white text-xs font-semibold shadow-pink-glow hover:brightness-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu phân tích da miễn phí</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
