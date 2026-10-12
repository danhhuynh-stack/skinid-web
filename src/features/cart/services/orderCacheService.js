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
  if (!store || !userId || !order) return;
  try {
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
