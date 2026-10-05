import { useState } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useCart } from '../cart/index.js';
import { compactActiveLabel, formatPrice, productBenefit, productDisplayName } from './catalog.presenters.js';
import { isFeaturedProduct } from './featuredProducts.js';

function ShoppingBagIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
}

export default function ProductCard({ product, onOpen }) {
  const { addToCart, openCheckout } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const displayName = productDisplayName(product);
  const actives = (product.mainActives || []).slice(0, 2).map(compactActiveLabel).filter(Boolean);
  const medicalLine = [product.line, ...actives].filter(Boolean).join(' · ');
  const discounted = product.originalPrice && product.originalPrice > product.price;
  const discount = discounted ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const rating = Number(product.rating);
  const reviews = Number(product.reviewCount);
  const sold = Number(product.soldCount);
  const image = fallbackUsed ? product.originalImageUrl : assetUrl(product.image, product.brandSlug);
  const isFeatured = isFeaturedProduct(product.id);

  const handleImageError = () => {
    if (!fallbackUsed && product.originalImageUrl) setFallbackUsed(true);
    else setImageFailed(true);
  };

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    await addToCart(product.id);
  };

  const handleBuyNow = async (event) => {
    event.stopPropagation();
    await addToCart(product.id);
    await openCheckout();
  };

  return (
    <article className="product-card bg-white rounded-2xl flex flex-col h-full relative group overflow-hidden cursor-pointer" onClick={() => onOpen(product.id)}>
      <div className="product-card__badge-layer">
        {(isFeatured || product.tier) && (
          <span className={isFeatured ? 'product-card__featured-label' : 'product-card__tier-label'}>
            {isFeatured ? 'Sản phẩm nổi bật' : product.tier}
          </span>
        )}
        {discounted && <span className="product-card__discount">−{discount}%</span>}
      </div>
      <div className="product-card__media">
        {imageFailed
          ? <div className="w-full h-full missing-image-placeholder text-center px-4 flex items-center justify-center text-xs text-gray-400 font-semibold">{product.brand}</div>
          : <img src={image} alt={product.name} loading="lazy" onError={handleImageError} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ease-in-out" />}
      </div>
      <div className="product-card__content">
        <div className="product-card__actives">{medicalLine}</div>
        <div className="flex-grow">
          <div className="product-card__title-row">
            <h2 className="product-card__name">
              <button type="button" className="product-card__title-link" onClick={(event) => { event.stopPropagation(); onOpen(product.id); }}>{displayName}</button>
            </h2>
          </div>
          <p className="product-card__benefit">{productBenefit(product)}</p>
          {Number.isFinite(rating) && rating > 0 && (
            <div className="product-card__social" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5`}>
              <span className="product-card__star">★</span> {rating.toFixed(1)}{reviews > 0 ? ` (${reviews})` : ''}{sold > 0 ? ` · Đã bán ${sold >= 1000 ? `${(sold / 1000).toFixed(sold % 1000 === 0 ? 0 : 1)}k` : sold}` : ''}
            </div>
          )}
        </div>
        <div className="product-card__footer">
          <div className="product-card__price-row">
            <div className="product-card__prices">
              <span className="product-card__price">{formatPrice(product.price)}</span>
              {discounted && <span className="product-card__original-price">{formatPrice(product.originalPrice)}</span>}
              {product.volume && <span className="product-card__volume">{product.volume}</span>}
            </div>
          </div>
          <div className="product-card__actions">
            <button type="button" className="product-card__cart-button" aria-label={`Thêm ${displayName} vào giỏ`} onClick={handleAddToCart}>
              <ShoppingBagIcon /><span>Thêm vào giỏ</span>
            </button>
            <button type="button" className="product-card__buy-button" aria-label={`Mua ngay ${displayName}`} onClick={handleBuyNow}>
              <span>Mua ngay</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
