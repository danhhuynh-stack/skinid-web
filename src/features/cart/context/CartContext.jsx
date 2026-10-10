import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import { getProductById } from '../../catalog/index.js';
import { loadUserCart, mergeCartItems, sanitizeCartItems, saveUserCart } from '../services/cartService.js';
import CartToast from '../components/CartToast.jsx';

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
  const [cartToast, setCartToast] = useState(null);
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
    if (!userId) return Promise.resolve(nextItems);
    const run = () => saveUserCart(userId, nextItems).then(() => nextItems);
    const queued = saveQueueRef.current.then(run, run);
    saveQueueRef.current = queued;
    return queued;
  }, []);

  useEffect(() => {
    if (isAuthLoading) return undefined;
    const nextUserId = user?.uid || null;
    const prevUserId = activeUserIdRef.current;
    activeUserIdRef.current = nextUserId;
    if (prevUserId === nextUserId && isHydratedRef.current) return undefined;

    let active = true;
    setIsHydrated(false);
    isHydratedRef.current = false;

    const hydrate = async () => {
      const memoryItems = itemsRef.current;
      if (!nextUserId) {
        if (!active) return;
        replaceItems(memoryItems);
        setIsHydrated(true);
        isHydratedRef.current = true;
        return;
      }
      try {
        const remoteItems = await loadUserCart(nextUserId);
        if (!active) return;
        const merged = mergeCartItems(remoteItems, memoryItems);
        replaceItems(merged);
        enqueueSave(merged);
      } catch {
        if (!active) return;
        replaceItems(memoryItems);
      } finally {
        if (active) {
          setIsHydrated(true);
          isHydratedRef.current = true;
        }
      }
    };

    const task = hydrate();
    hydrationRef.current = task;
    return () => {
      active = false;
    };
  }, [enqueueSave, isAuthLoading, replaceItems, user?.uid]);

  useEffect(() => {
    const onExternalAdd = (event) => {
      const detail = event?.detail || {};
      const productId = detail.productId || detail.id;
      if (productId) addToCartRef.current(productId, detail.quantity || 1);
    };
    const onCheckoutRequest = () => {
      openCheckoutRef.current();
    };
    const onLegacyItems = (event) => {
      const list = Array.isArray(event?.detail) ? event.detail : [];
      for (const entry of list) {
        const productId = entry.productId || entry.id;
        if (productId) addToCartRef.current(productId, entry.quantity || 1);
      }
    };
    const onLegacySync = async (event) => {
      const list = Array.isArray(event?.detail) ? event.detail : [];
      for (const entry of list) {
        const productId = entry.productId || entry.id;
        if (productId) {
          await addToCartRef.current(productId, entry.quantity || 1);
        }
      }
      openCheckoutRef.current();
    };
    window.addEventListener('skinid:cart-add', onExternalAdd);
    window.addEventListener('skinid:cart-checkout', onCheckoutRequest);
    window.addEventListener('cart:item-added', onLegacyItems);
    window.addEventListener('skinid:sync-and-checkout', onLegacySync);
    return () => {
      window.removeEventListener('skinid:cart-add', onExternalAdd);
      window.removeEventListener('skinid:cart-checkout', onCheckoutRequest);
      window.removeEventListener('cart:item-added', onLegacyItems);
      window.removeEventListener('skinid:sync-and-checkout', onLegacySync);
    };
  }, []);

  const commit = useCallback((producer) => {
    const nextItems = replaceItems(producer(itemsRef.current));
    return enqueueSave(nextItems);
  }, [enqueueSave, replaceItems]);

  const addToCart = useCallback((productId, quantity = 1, options = {}) => {
    const requested = Math.max(1, Math.trunc(Number(quantity) || 1));
    const product = getProductById(productId);
    if (product && options.showToast !== false) {
      setCartToast({ product, quantity: requested });
    }
    if (options.openDrawer) {
      setIsOpen(true);
    }
    return commit((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + requested } : item)
        : [...current, { productId, quantity: requested }];
    });
  }, [commit]);
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

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast
        toast={cartToast}
        onClose={() => setCartToast(null)}
        onOpenCart={openCart}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext) || fallbackCart;
}
