import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useBodyScrollLock } from '../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../cart/index.js';
import { formatPrice, getProductById, productDisplayName } from './index.js';

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function formatActive(raw) {
  if (!raw || typeof raw !== 'string') return { title: 'Hoạt chất', desc: '' };
  const idx = raw.indexOf(':');
  if (idx === -1) {
    return { title: 'Hoạt chất chính', desc: raw.trim() };
  }
  return {
    title: raw.slice(0, idx).trim(),
    desc: raw.slice(idx + 1).trim()
  };
}

function Certification({ product }) {
  const isRilastil = product.brand === 'Rilastil';
  const number = product.notificationNumber || (isRilastil ? '184920/22/CBMP-QLD' : 'Đang cập nhật');
  const authority = product.approvingAuthority || (isRilastil ? 'Cục Quản lý Dược - Bộ Y Tế' : 'Sở Y Tế');
  const origin = product.origin || (isRilastil ? 'Ý (Italy)' : 'Việt Nam');
  const distributor = 'CÔNG TY TNHH FIELDMAN (MST: 0319200638).';

  return (
    <div className="space-y-1.5 text-xs text-gray-700 pt-1">
      <p>
        <strong className="text-gray-900 font-bold">Số Phiếu tiếp nhận CBMP:</strong>{' '}
        <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
          {number}
        </span>
      </p>
      <p>
        <strong className="text-gray-900 font-bold">{isRilastil ? 'Cơ quan phê duyệt' : 'Cơ quan tiếp nhận'}:</strong>{' '}
        <span>{authority}</span>
      </p>
      <p>
        <strong className="text-gray-900 font-bold">Xuất xứ:</strong>{' '}
        <span>{origin}{isRilastil ? ' (Nhập khẩu chính ngạch từ Ý)' : ''}</span>
      </p>
      <p>
        <strong className="text-gray-900 font-bold">{isRilastil ? 'Nhà phân phối' : 'Thương nhân chịu trách nhiệm'}:</strong>{' '}
        <span>{distributor}</span>
      </p>
    </div>
  );
}

export default function ProductDetailModal() {
  const { addToCart, openCheckout } = useCart();
  const [product, setProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(false);
  const closeTimer = useRef(null);
  useBodyScrollLock(open, 'product-detail');

  const closeModal = useCallback(() => {
    window.closeLicenseModal?.();
    setOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setProduct(null), 250);
  }, []);

  const openModal = useCallback(productId => {
    const selected = getProductById(productId);
    if (!selected) return;
    clearTimeout(closeTimer.current);
    setFallbackImage(false);
    setProduct(selected);
    requestAnimationFrame(() => setOpen(true));
  }, []);

  useEffect(() => {
    window.openProductDetailModal = openModal;
    window.closeProductDetailModal = closeModal;
    const handleOpen = event => openModal(event.detail?.productId);
    const handleKey = event => { if (event.key === 'Escape') closeModal(); };
    document.addEventListener('skinid:open-product-detail', handleOpen);
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(closeTimer.current);
      document.removeEventListener('skinid:open-product-detail', handleOpen);
      document.removeEventListener('keydown', handleKey);
      if (window.openProductDetailModal === openModal) delete window.openProductDetailModal;
      if (window.closeProductDetailModal === closeModal) delete window.closeProductDetailModal;
    };
  }, [closeModal, openModal]);

  if (!product) return null;
  const discounted = product.originalPrice && product.originalPrice > product.price;
  const discount = discounted ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const rawUses = product.uses || product.description || 'Sản phẩm dược mỹ phẩm chuyên sâu chính hãng.';
  const uses = typeof rawUses === 'string' ? rawUses.replace(/[_─—–-]{3,}[\s\S]*/g, '').trim() || rawUses : rawUses;
  const image = fallbackImage ? product.originalImageUrl : assetUrl(product.image, product.brandSlug);
  const volume = product.volume ? product.volume.trim() : 'Tiêu chuẩn';

  const handleAddToCart = async () => {
    closeModal();
    await addToCart(product.id, 1, { openDrawer: true });
  };

  const handleBuyNow = async () => {
    closeModal();
    await addToCart(product.id, 1, { showToast: false });
    await openCheckout();
  };

  return (
    <div id="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="pmodal-title" className={`flex ${open ? 'opacity-100' : 'opacity-0'}`} onClick={event => { if (event.target === event.currentTarget) closeModal(); }}>
      <div id="product-detail-modal-content" className={open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}>
        <div className="pmodal-scroll">
          <button className="modal-close" type="button" onClick={closeModal} aria-label="Đóng"><CloseIcon /></button>
          <div className="pmodal-head">
            <div className="pmodal-image">
              <img src={image} alt={product.name} onError={() => { if (!fallbackImage && product.originalImageUrl) setFallbackImage(true); }} />
            </div>
            <div>
              <span className="modal-kicker">{product.line || product.brand || 'CHĂM SÓC DA'}</span>
              <h2 id="pmodal-title">{productDisplayName(product)}</h2>
              <div className="pmodal-price">
                <span>{formatPrice(product.price)}</span>
                {discounted && <span id="pmodal-original-price">{formatPrice(product.originalPrice)}</span>}
                {discounted && <span className="pmodal-discount-tag">-{discount}%</span>}
              </div>
              <p>{uses}</p>
              <div className="spec">
                <h4>Dung tích</h4>
                <p>{volume}{product.unit ? ` / ${product.unit.toLocaleLowerCase('vi-VN')}` : ''}</p>
                {product.productCode && <><h4>Mã sản phẩm</h4><p>{product.productCode}</p></>}
                <h4>Hướng dẫn sử dụng</h4>
                <p>{product.usage || 'Sử dụng hàng ngày vào sáng và tối.'}</p>
              </div>
            </div>
          </div>

          <div className="spec">
            <h4>Thành phần nổi bật</h4>
            <div className="space-y-2 mt-2">
              {product.keyActives?.length ? product.keyActives.map((active, index) => {
                const { title, desc } = formatActive(active);
                return (
                  <div key={index} className="text-xs leading-relaxed">
                    <span className="font-bold text-gray-900 uppercase tracking-wide text-brand-dark">{title}:</span>
                    <span className="text-gray-700"> {desc}</span>
                  </div>
                );
              }) : <p className="text-xs text-gray-600">Được bào chế với các hoạt chất sinh học tối ưu cho da liễu.</p>}
            </div>
          </div>

          <section className="spec">
            <h4>Danh sách thành phần đầy đủ</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{product.fullIngredients || 'Được kiểm nghiệm da liễu nghiêm ngặt.'}</p>
          </section>

          <div className="spec">
            <h4>Thông tin sản phẩm &amp; Chứng nhận pháp lý</h4>
            <Certification product={product} />
          </div>
        </div>

        <div className="pmodal-actions">
          <button className="btn btn--primary pmodal-buy-now" type="button" onClick={handleBuyNow}>Mua ngay</button>
          <button className="btn btn--outline pmodal-add-cart" type="button" onClick={handleAddToCart}>Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  );
}
