import { useCart } from '../../features/cart/index.js';

export default function MobileNav() {
  const { toggleCart, totalItems } = useCart();
  return (
    <nav className="mobile-nav" aria-label="Điều hướng nhanh">
      <a href="/#top"><i data-feather="home"></i><span>Trang chủ</span></a>
      <a href="/products"><i data-feather="grid"></i><span>Sản phẩm</span></a>
      <a href="/skin-analysis"><i data-feather="camera"></i><span>Soi da</span></a>
      <button type="button" onClick={toggleCart} aria-label={`Mở giỏ hàng, ${totalItems} sản phẩm`}>
        <i data-feather="shopping-bag"></i><span>Giỏ hàng</span>
        <b id="mobile-cart-badge" className={totalItems ? '' : 'opacity-0'}>{totalItems}</b>
      </button>
    </nav>
  );
}
