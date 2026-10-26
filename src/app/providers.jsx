import { AuthDialogs, AuthProvider } from '../features/auth/index.js';
import { CartDrawer, CartProvider, CheckoutModal } from '../features/cart/index.js';
import { SkinAnalysisBridge } from '../features/skin-analysis/index.js';
import { SystemSettingsProvider, TrackingScripts } from '../features/system/index.js';

export function AppProviders({ children }) {
  return (
    <SystemSettingsProvider>
      <TrackingScripts />
      <AuthProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
        <AuthDialogs />
        <SkinAnalysisBridge />
      </AuthProvider>
    </SystemSettingsProvider>
  );
}
