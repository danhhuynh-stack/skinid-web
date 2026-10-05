import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import { getProductById } from '../../catalog/index.js';
import { loadUserCart, mergeCartItems, sanitizeCartItems, saveUserCart } from '../services/cartService.js';

const CartContext = createContext(null);

const fallbackCart = Object.freeze({
  items: [], totalItems: 0, subtotal: 0, isOpen: false, isCheckoutOpen: false, isHydrated: true,
  addToCart: async () => [], removeItem: async () => [], updateQuantity: async () => [], clearCart: async () => [],
  openCart: () => {}, closeCart: () => {}, toggleCart: () => {}, openCheckout: async () => false,
  closeCheckout: () => {}, completeCheckout: () => {}
});

export function CartProvider({ children }) {
  const { user, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const itemsRef = useRef([]);
  const activeUserIdRef = useRef(null);
  const isHydratedRef = useRef(false);
  const saveQueueRef = useRef(Promise.resolve());
  const hydrationRef = useRef(Promise.resolve());
  const openCheckoutRef = useRef(async () => false);

  const replaceItems = useCallback((nextItems) => {
    const sanitized = sanitizeCartItems(nextItems);
    itemsRef.current = sanitized;
    setItems(sanitized);
    return sanitized;
  }, []);

  const enqueueSave = useCallback((nextItems) => {
    const userId = activeUserIdRef.current;
    if (!userId || !isHydratedRef.current) return Promise.resolve(nextItems);
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveUserCart(userId, nextItems));
    return saveQueueRef.current;
  }, []);

  useEffect(() => {
    if (isAuthLoading) return undefined;
    let active = true;
    const userId = user?.uid || null;
    const previousUserId = activeUserIdRef.current;
    const shouldMergeGuest = !previousUserId;

    isHydratedRef.current = false;
    setIsHydrated(false);
    hydrationRef.current = (async () => {
      if (!userId) {
        activeUserIdRef.current = null;
        if (previousUserId) replaceItems([]);
        return;
      }
      const remoteItems = await loadUserCart(userId);
      if (!active) return;
      const guestItems = shouldMergeGuest ? itemsRef.current : [];
      const mergedItems = mergeCartItems(remoteItems, guestItems);
      activeUserIdRef.current = userId;
      replaceItems(mergedItems);
      if (guestItems.length) {
        isHydratedRef.current = true;
        await enqueueSave(mergedItems);
      }
    })().catch((error) => {
      console.error('[SkinID Cart] Không thể tải giỏ hàng:', error);
      if (active) activeUserIdRef.current = userId;
    }).finally(() => {
      if (!active) return;
      isHydratedRef.current = true;
      setIsHydrated(true);
    });

    return () => { active = false; };
  }, [enqueueSave, isAuthLoading, replaceItems, user?.uid]);

  useEffect(() => {
    const addOne = (event) => {
      const productId = String(event.detail?.productId || '');
      if (productId) addToCartRef.current(productId, event.detail?.quantity || 1);
    };
    const addMany = (event) => {
      for (const productId of event.detail?.productIds || []) {
        if (productId) addToCartRef.current(String(productId), 1);
      }
      setIsOpen(true);
    };
    const buyNow = async (event) => {
      const productId = String(event.detail?.productId || '');
      if (!productId) return;
      await addToCartRef.current(productId, event.detail?.quantity || 1);
      await openCheckoutRef.current();
    };
    document.addEventListener('skinid:cart-add', addOne);
    document.addEventListener('skinid:cart-add-many', addMany);
    document.addEventListener('skinid:buy-now', buyNow);
    return () => {
      document.removeEventListener('skinid:cart-add', addOne);
      document.removeEventListener('skinid:cart-add-many', addMany);
      document.removeEventListener('skinid:buy-now', buyNow);
    };
  }, []);

  const commit = useCallback((producer) => {
    const nextItems = replaceItems(producer(itemsRef.current));
    return enqueueSave(nextItems);
  }, [enqueueSave, replaceItems]);

  const addToCart = useCallback((productId, quantity = 1) => commit((current) => {
    const requested = Math.max(1, Math.trunc(Number(quantity) || 1));
    const existing = current.find((item) => item.productId === productId);
    return existing
      ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + requested } : item)
      : [...current, { productId, quantity: requested }];
  }), [commit]);
  const addToCartRef = useRef(addToCart);
  addToCartRef.current = addToCart;

  const removeItem = useCallback((productId) => commit(
    (current) => current.filter((item) => item.productId !== productId)
  ), [commit]);

  const updateQuantity = useCallback((productId, quantity) => commit((current) => {
    const nextQuantity = Math.trunc(Number(quantity) || 0);
    return nextQuantity <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item);
  }), [commit]);

  const clearCart = useCallback(() => commit(() => []), [commit]);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((current) => !current), []);

  const openCheckout = useCallback(async () => {
    if (!user?.uid) {
      openAuthModal('Đăng nhập để tiếp tục thanh toán và theo dõi đơn hàng.');
      return false;
    }
    await hydrationRef.current;
    await saveQueueRef.current.catch(() => undefined);
    await saveUserCart(user.uid, itemsRef.current);
    if (!itemsRef.current.length) return false;
    setIsOpen(false);
    setIsCheckoutOpen(true);
    return true;
  }, [openAuthModal, user?.uid]);
  openCheckoutRef.current = openCheckout;
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
  const completeCheckout = useCallback(() => {
    replaceItems([]);
    setIsCheckoutOpen(false);
  }, [replaceItems]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0), [items]);

  const value = useMemo(() => ({
    items, totalItems, subtotal, isOpen, isCheckoutOpen, isHydrated,
    addToCart, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart,
    openCheckout, closeCheckout, completeCheckout
  }), [items, totalItems, subtotal, isOpen, isCheckoutOpen, isHydrated, addToCart, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart, openCheckout, closeCheckout, completeCheckout]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext) || fallbackCart;
}
