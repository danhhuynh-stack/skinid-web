'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface Product {
  id: string;
  brand: string;
  brandSlug: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  tier: 'Essential' | 'Select' | 'Signature';
  category: string;
  image: string;
  description?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart?: (p: Product) => void;
}) {
  const [imageError, setImageError] = useState(false);

  // Format currency: 279.000đ
  const formatMoney = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  // Tier badge styling
  const tierBadgeStyle = {
    Essential: 'bg-brand-blush text-brand-espresso border-brand-petal/50',
    Select: 'bg-brand-petal/30 text-brand-espresso border-brand-pink/40',
    Signature: 'bg-gradient-to-r from-brand-pink/20 to-brand-gold/20 text-brand-espresso border-brand-gold/50 font-semibold',
  }[product.tier] || 'bg-brand-blush text-brand-espresso';

  return (
    <div className="group relative rounded-3xl bg-white/80 border border-brand-petal/30 p-3.5 transition-all duration-300 hover:shadow-pink-glow hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
      
      {/* Upper Badges & Brand */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          {/* Brand Tag */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-pink">
            {product.brand}
          </span>

          {/* Tier Badge */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierBadgeStyle}`}>
            {product.tier}
          </span>
        </div>

        {/* Product Image Container (1:1 Aspect Ratio) */}
        <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square w-full rounded-2xl bg-gradient-to-b from-brand-soft to-brand-blush/40 p-4 mb-3 overflow-hidden">
          <Image
            src={imageError ? '/images/products/placeholder.jpg' : product.image}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />

          {/* Quick AI Routine Icon badge */}
          {product.tier === 'Signature' && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            </div>
          )}
        </Link>

        {/* Product Title */}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-brand-espresso line-clamp-2 leading-snug mb-1 group-hover:text-brand-pink transition-colors">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-3 pt-2 border-t border-brand-blush/60 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-brand-espresso">
              {formatMoney(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-brand-muted line-through">
                {formatMoney(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-brand-muted">Đã bao gồm VAT 8%</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          className="p-2.5 rounded-full bg-brand-blush text-brand-pink hover:bg-brand-pink hover:text-white transition-all active:scale-90 shadow-sm"
          title="Thêm vào giỏ hàng"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
