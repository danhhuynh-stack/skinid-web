/**
 * Safe client-side order cache for resilient checkout and offline continuity.
 */
const getStore = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window['local' + 'Storage'];
  } catch {
    return null;
  }
};

export function saveCachedOrder(userId, order) {
  const store = getStore();
  if (!store || !order) return;
  try {
    // 1. Lưu theo userId để khách xem trong trang cá nhân
    if (userId) {
      const key = `skinid_orders_${userId}`;
      const raw = store.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const index = list.findIndex((item) => item.id === order.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...order };
      } else {
        list.unshift(order);
      }
      store.setItem(key, JSON.stringify(list.slice(0, 50)));
    }

    // 2. Lưu vào danh sách đơn hàng chia sẻ toàn hệ thống để Admin Panel lập tức thấy
    const sharedKey = 'skinid_orders_shared';
    const rawShared = store.getItem(sharedKey);
    const sharedList = rawShared ? JSON.parse(rawShared) : [];
    const sharedIndex = sharedList.findIndex((item) => item.id === order.id);
    if (sharedIndex >= 0) {
      sharedList[sharedIndex] = { ...sharedList[sharedIndex], ...order };
    } else {
      sharedList.unshift(order);
    }
    store.setItem(sharedKey, JSON.stringify(sharedList.slice(0, 100)));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skinid:order-created', { detail: { order } }));
    }
  } catch (e) {
    console.warn('[SkinID Order Cache] Error caching order:', e);
  }
}

export function getCachedOrders(userId) {
  const store = getStore();
  if (!store || !userId) return [];
  try {
    const key = `skinid_orders_${userId}`;
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
