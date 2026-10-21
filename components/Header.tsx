'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Search, PhoneCall, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Logo SkinID */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-28 h-10 md:w-36 md:h-12 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="SkinID.vn Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Thanh tìm kiếm (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md relative mx-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm Rilastil, TWON, DVAH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-soft border border-brand-petal/40 rounded-full py-2 pl-10 pr-4 text-sm text-brand-espresso placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brand-pink" />
        </div>

        {/* Nút bấm & Action */}
        <div className="flex items-center gap-2.5">
          {/* Hotline Button */}
          <a
            href={`tel:${siteConfig.hotline.replace(/\./g, '')}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blush text-brand-espresso text-xs font-medium hover:bg-brand-petal/30 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-brand-pink" />
            <span>{siteConfig.hotline}</span>
          </a>

          {/* Skin AI Quick Button */}
          <Link
            href="/phan-tich-da"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-bright text-white text-xs font-semibold shadow-pink-glow hover:brightness-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden xs:inline">Skin Scan AI</span>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/gio-hang"
            className="relative p-2 rounded-full bg-brand-blush text-brand-espresso hover:bg-brand-petal/40 transition-all active:scale-95"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5 text-brand-espresso" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-pink-bright text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
