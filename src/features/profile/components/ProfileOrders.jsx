import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { assetUrl } from '../../../assets/index.js';
import { useCart } from '../../cart/index.js';
import { getProductById } from '../../catalog/index.js';

const statusStyles = {
  pending: { label: 'Chờ xác nhận', className: 'bg-[#FEF3C7] text-[#92400E] border-0' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-[#CCFBF1] text-[#115E59] border-0' },
  shipping: { label: 'Đang giao hàng', className: 'bg-[#DBEAFE] text-[#1E40AF] border-0' },
  delivered: { label: 'Đã giao thành công', className: 'bg-[#D1FAE5] text-[#065F46] border-0' },
  completed: { label: 'Hoàn tất', className: 'bg-[#D1FAE5] text-[#065F46] border-0' },
  cancelled: { label: 'Đã hủy', className: 'bg-[#FEE2E2] text-[#991B1B] border-0' }
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(Number(value) || 0);

function formatOrderDate(value, fallback) {
  try {
    if (typeof value?.toDate === 'function') return value.toDate().toLocaleString('vi-VN');
    if (value instanceof Date) return value.toLocaleString('vi-VN');
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString('vi-VN');
    if (value) return new Date(value).toLocaleString('vi-VN');
  } catch {
    return fallback || 'Gần đây';
  }
  return fallback || 'Gần đây';
}

function OrderItem({ item }) {
  const product = getProductById(item.productId);
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.price) || (Number(item.lineTotal) || 0) / quantity;
  const image = assetUrl(item.image || product?.image || '/images/products/placeholder.jpg', product?.brandSlug);
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0 text-xs">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={image}
          alt={item.name || product?.name || 'Sản phẩm'}
          className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 flex-shrink-0 border border-gray-100"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = assetUrl('/images/products/placeholder.jpg');
          }}
        />
        <div className="min-w-0">
          <p className="font-bold text-gray-800 truncate">{item.name || product?.name || 'Sản phẩm'}</p>
          <p className="text-gray-400 text-[11px]">SL: {quantity} × {formatPrice(unitPrice)}</p>
        </div>
      </div>
      <strong className="text-gray-900 flex-shrink-0">{formatPrice(item.lineTotal || unitPrice * quantity)}</strong>
    </div>
  );
}

function OrderCard({ order, onCancel, onReorder, cancellingId }) {
  const [confirming, setConfirming] = useState(false);
  const status = statusStyles[order.status] || statusStyles.pending;
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const customer = order.customer || {};
  const shortId = String(order.id || '').slice(0, 8).toUpperCase();
  const isCancelling = cancellingId === order.id;
  const items = order.items || [];
  const totalQuantity = items.reduce((total, item) => total + (Number(item.quantity) || 1), 0);

  return (
    <article className="profile-order-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm sm:text-base font-black text-gray-900">#{shortId}</strong>
            <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatOrderDate(order.createdAt, order.dateFormatted)}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-gray-400 block">Tổng thanh toán</span>
          <span className="text-base sm:text-lg font-black text-brand-primary">{formatPrice(order.total || order.subtotal)}</span>
        </div>
      </div>

      <div className="bg-gray-50/60 rounded-2xl p-3.5 space-y-2">
        <p className="text-xs text-gray-600"><strong>{customer.name || 'Khách hàng'}</strong>{customer.phone ? ` (${customer.phone})` : ''} — {customer.address || 'Chưa có địa chỉ'}</p>
        <p className="text-[11px] text-gray-500">
          {order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Chuyển khoản ngân hàng'} ·{' '}
          <span className={order.paymentStatus === 'paid' ? 'text-teal-600 font-bold' : 'text-gray-500'}>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
        </p>
      </div>

      <details className="profile-order-items">
        <summary>
          <span><strong>Mặt hàng trong đơn</strong><small>{items.length} mặt hàng · {totalQuantity} sản phẩm</small></span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="profile-order-items__list">
          {items.length ? items.map((item, index) => <OrderItem key={`${item.productId || 'item'}-${index}`} item={item} />) : <p className="text-xs text-gray-500 py-3">Chưa có thông tin mặt hàng.</p>}
        </div>
      </details>

      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-gray-400">Phí vận chuyển: {Number(order.shippingFee) === 0 ? <strong className="text-teal-600">Miễn phí</strong> : formatPrice(order.shippingFee)}</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={() => onReorder(order)} className="profile-action profile-action--primary">Mua lại</button>
          {canCancel && !confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="profile-action profile-action--danger">Hủy đơn</button>
          )}
          {canCancel && confirming && (
            <>
              <button type="button" onClick={() => setConfirming(false)} disabled={isCancelling} className="profile-action profile-action--quiet">Giữ đơn</button>
              <button type="button" onClick={() => onCancel(order.id)} disabled={isCancelling} className="profile-action profile-action--danger">{isCancelling ? 'Đang hủy…' : 'Xác nhận hủy'}</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProfileOrders({ orders = [], isLoading = false, onCancel }) {
  const { addToCart, openCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [placedOrder] = useState(() => searchParams.get('placed'));
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!placedOrder || !searchParams.has('placed')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('placed');
    next.set('tab', 'orders');
    setSearchParams(next, { replace: true });
  }, [placedOrder, searchParams, setSearchParams]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    setError('');
    try {
      await onCancel(orderId);
    } catch (requestError) {
      setError(requestError.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order) => {
    for (const item of order.items || []) {
      if (item.productId) addToCart(item.productId, Number(item.quantity) || 1);
    }
    openCart();
  };

  if (isLoading && !orders.length) {
    return <div className="text-center py-10 text-gray-400"><div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><p className="text-xs">Đang tải danh sách đơn hàng...</p></div>;
  }

  return (
    <div className="space-y-4">
      {placedOrder && (
        <div className="order-success-banner" role="status"><div><strong>Đặt hàng thành công</strong><p>Mã đơn #{placedOrder} đã được tiếp nhận. SkinID sẽ sớm xác nhận với bạn.</p></div></div>
      )}
      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error}</div>}
      {!orders.length ? (
        <div className="profile-empty-panel text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-brand-blush/60 text-brand-primary flex items-center justify-center shadow-sm text-3xl" aria-hidden="true">▣</div>
          <h4 className="font-black text-gray-800 text-base mb-1">Chưa Có Đơn Hàng Nào</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">Bạn chưa thực hiện đơn đặt hàng nào tại SkinID. Khám phá các sản phẩm dược mỹ phẩm chính hãng ngay!</p>
          <a href="/products" className="profile-btn profile-btn--primary">Khám phá sản phẩm ngay →</a>
        </div>
      ) : orders.map((order) => (
        <OrderCard key={order.id} order={order} onCancel={handleCancel} onReorder={handleReorder} cancellingId={cancellingId} />
      ))}
    </div>
  );
}
