const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');

function sourceFiles(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(relative)
      : /\.(?:js|jsx)$/.test(entry.name) ? [relative] : [];
  });
}

test('app routing owns page loading and keeps App composition-only', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8');
  const router = fs.readFileSync(path.join(root, 'src/app/router.jsx'), 'utf8');
  assert.doesNotMatch(app, /\.\/pages\//);
  assert.match(app, /RouterProvider/);
  assert.match(router, /lazyPage/);
  assert.match(router, /path: '\*'/);
});

test('shared modules do not depend on routes, features, or legacy scripts', () => {
  for (const file of sourceFiles('src/shared')) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /from\s+['"][^'"]*(?:features|routes|src\/js)[^'"]*['"]/, file);
  }
});

test('React feature bridges are event-driven instead of polling', () => {
  for (const file of sourceFiles('src/features')) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /setInterval\s*\(/, file);
  }
});

test('the React products route loads catalog through a module repository without legacy bootstrap', () => {
  const bootstrap = fs.readFileSync(path.join(root, 'src/js/app/bootstrap.js'), 'utf8');
  const page = fs.readFileSync(path.join(root, 'src/pages/ProductsPage.jsx'), 'utf8');
  const hook = fs.readFileSync(path.join(root, 'src/features/catalog/hooks/useCatalog.js'), 'utf8');
  const repository = fs.readFileSync(path.join(root, 'src/features/catalog/services/catalogRepository.js'), 'utf8');
  assert.doesNotMatch(page, /useLegacyApplication/);
  assert.doesNotMatch(bootstrap, /reactCatalogScripts|products-react/);
  assert.match(hook, /loadProductCatalog/);
  assert.match(repository, /firebaseServices/);
  assert.match(repository, /catalogFixture\.generated\.js/);
  assert.doesNotMatch(repository, /window\.|document\./);
  const productModal = fs.readFileSync(path.join(root, 'src/features/catalog/ProductDetailModal.jsx'), 'utf8');
  const dialogModals = fs.readFileSync(path.join(root, 'src/components/dialogs/StorefrontModals.jsx'), 'utf8');
  assert.match(productModal, /useBodyScrollLock/);
  assert.match(dialogModals, /useBodyScrollLock/);
  assert.doesNotMatch(productModal, /SkinIDScrollLock/);
  assert.doesNotMatch(dialogModals, /SkinIDScrollLock|window\.openConsultation|window\.openPolicy/);
});

test('React authentication is app-scoped and independent from the legacy manager', () => {
  const providers = fs.readFileSync(path.join(root, 'src/app/providers.jsx'), 'utf8');
  const dialogs = fs.readFileSync(path.join(root, 'src/features/auth/AuthDialogs.jsx'), 'utf8');
  const context = fs.readFileSync(path.join(root, 'src/features/auth/context/AuthContext.jsx'), 'utf8');
  const service = fs.readFileSync(path.join(root, 'src/features/auth/services/authService.js'), 'utf8');
  const header = fs.readFileSync(path.join(root, 'src/components/layout/Header.jsx'), 'utf8');
  const routine = fs.readFileSync(path.join(root, 'src/components/analysis/SkincareRoutine.jsx'), 'utf8');

  assert.match(providers, /<AuthDialogs \/>/);
  assert.match(dialogs, /skinid:auth-dialog-open/);
  assert.match(dialogs, /skinid:history-dialog-open/);
  assert.doesNotMatch(routine, /auth-modal|history-modal/);
  assert.match(context, /subscribeToAuthSession/);
  assert.match(context, /loginWithEmailService/);
  assert.match(service, /signInWithEmailAndPassword/);
  assert.match(service, /createUserWithEmailAndPassword/);
  assert.doesNotMatch(context, /window\.authManager/);
  assert.doesNotMatch(header, /window\.authManager/);
});

test('Firebase uses the npm client and modern feature services avoid auth globals', () => {
  const main = fs.readFileSync(path.join(root, 'src/main.jsx'), 'utf8');
  const firebaseClient = fs.readFileSync(path.join(root, 'src/infrastructure/firebase/client.js'), 'utf8');
  const apiClient = fs.readFileSync(path.join(root, 'src/infrastructure/http/apiClient.js'), 'utf8');

  assert.match(main, /from '\.\/infrastructure\/firebase\/index\.js'/);
  assert.match(firebaseClient, /from 'firebase\/auth'/);
  assert.match(firebaseClient, /from 'firebase\/firestore'/);
  assert.doesNotMatch(firebaseClient, /gstatic\.com|firebasejs\//);
  assert.match(apiClient, /getIdToken\(\)/);
  for (const file of [
    'src/features/admin/services/adminService.js',
    'src/features/skin-analysis/services/skinAnalysisService.js'
  ]) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /infrastructure\/http\/apiClient\.js/, file);
    assert.doesNotMatch(source, /window\.authManager/, file);
  }
  const profileService = fs.readFileSync(path.join(root, 'src/features/profile/services/profileService.js'), 'utf8');
  assert.match(profileService, /infrastructure\/firebase\/index\.js/);
  assert.doesNotMatch(profileService, /auth\/services\//);
  assert.doesNotMatch(profileService, /window\.authManager/);
});

test('the React profile route owns account mutations without the legacy auth manager', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/ProfilePage.jsx'), 'utf8');
  const hook = fs.readFileSync(path.join(root, 'src/features/profile/hooks/useProfile.js'), 'utf8');
  const timeline = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileHistoryTimeline.jsx'), 'utf8');
  const overview = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileHistoryOverview.jsx'), 'utf8');
  const orders = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileOrders.jsx'), 'utf8');
  const scanDetail = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileScanDetailModal.jsx'), 'utf8');
  const identityForm = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileIdentityForm.jsx'), 'utf8');
  const hero = fs.readFileSync(path.join(root, 'src/features/profile/components/ProfileHero.jsx'), 'utf8');
  const bootstrap = fs.readFileSync(path.join(root, 'src/js/app/bootstrap.js'), 'utf8');
  const legacyLoader = fs.readFileSync(path.join(root, 'src/hooks/useLegacyApplication.js'), 'utf8');
  assert.match(page, /useProfile\(\)/);
  assert.match(page, /<ProfileHistoryOverview history=\{history\} \/>/);
  assert.match(page, /<ProfileHistoryTimeline history=\{history\} user=\{user\} \/>/);
  assert.match(page, /<ProfileOrders orders=\{orders\}/);
  assert.match(page, /<ProfileScanDetailModal history=\{history\} user=\{user\} \/>/);
  assert.match(page, /onSubmit=\{handlePasswordChange\}/);
  assert.match(page, /activeTab === 'profile'/);
  assert.match(page, /<ProfileIdentityForm user=\{user\}/);
  assert.doesNotMatch(page, /window\.|document\.|VietnamAddress|switchProfileTab/);
  assert.doesNotMatch(hook, /window\.authManager/);
  assert.match(timeline, /skinid:scan-detail-open/);
  assert.doesNotMatch(timeline, /window\.|innerHTML/);
  assert.match(overview, /<svg/);
  assert.doesNotMatch(overview, /window\.|innerHTML|new\s+Chart\s*\(/);
  assert.match(orders, /useCart\(\)/);
  assert.doesNotMatch(orders, /window\.|innerHTML/);
  assert.match(scanDetail, /skinid:scan-detail-open/);
  assert.match(scanDetail, /<RadarChart values=\{metrics\.health\} \/>/);
  assert.doesNotMatch(scanDetail, /window\.|innerHTML|new\s+Chart\s*\(/);
  assert.match(identityForm, /fetchVietnamWards/);
  assert.match(identityForm, /value=\{form\.name\}/);
  assert.doesNotMatch(identityForm, /window\.|document\.|innerHTML/);
  assert.doesNotMatch(hero, /window\.|document\.|innerHTML/);
  assert.doesNotMatch(bootstrap, /profile-dashboard\.js/);
  assert.equal(fs.existsSync(path.join(root, 'src/js/account/profile-dashboard.js')), false);
  assert.doesNotMatch(page, /useLegacyApplication|data-feather/);
  assert.doesNotMatch(bootstrap, /profileScripts|page === 'profile'/);
  assert.doesNotMatch(legacyLoader, /profile:\s*\[/);
});

test('React cart owns state, persistence, drawer, and checkout', () => {
  const providers = fs.readFileSync(path.join(root, 'src/app/providers.jsx'), 'utf8');
  const context = fs.readFileSync(path.join(root, 'src/features/cart/context/CartContext.jsx'), 'utf8');
  const service = fs.readFileSync(path.join(root, 'src/features/cart/services/cartService.js'), 'utf8');
  const drawer = fs.readFileSync(path.join(root, 'src/features/cart/components/CartDrawer.jsx'), 'utf8');
  const checkout = fs.readFileSync(path.join(root, 'src/features/cart/components/CheckoutModal.jsx'), 'utf8');
  const checkoutService = fs.readFileSync(path.join(root, 'src/features/cart/services/checkoutService.js'), 'utf8');
  const header = fs.readFileSync(path.join(root, 'src/components/layout/Header.jsx'), 'utf8');
  assert.match(providers, /<CartDrawer \/>/);
  assert.match(context, /loadUserCart/);
  assert.match(context, /saveUserCart/);
  assert.doesNotMatch(context, /window\.cartManager|window\.addToCart/);
  assert.match(service, /users.*commerce.*cart/s);
  assert.match(providers, /<CheckoutModal \/>/);
  assert.match(drawer, /openCheckout/);
  assert.doesNotMatch(drawer, /legacy-checkout|location\.assign/);
  assert.match(checkout, /createShippingAddress/);
  assert.match(checkout, /createOrder/);
  assert.match(checkoutService, /apiRequest\('\/orders'/);
  assert.match(checkoutService, /Idempotency-Key/);
  assert.doesNotMatch(header, /window\.cartManager/);
});

test('the admin route owns its UI and Firestore operations without legacy bootstrap', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/AdminPage.jsx'), 'utf8');
  const hook = fs.readFileSync(path.join(root, 'src/features/admin/hooks/useAdmin.js'), 'utf8');
  const service = fs.readFileSync(path.join(root, 'src/features/admin/services/adminService.js'), 'utf8');
  const bootstrap = fs.readFileSync(path.join(root, 'src/js/app/bootstrap.js'), 'utf8');
  assert.match(page, /useAdmin\(\)/);
  assert.doesNotMatch(page, /useLegacyApplication|innerHTML/);
  assert.match(hook, /fetchAdminDashboard/);
  assert.match(service, /firebaseServices/);
  assert.match(service, /saveAdminProduct/);
  assert.doesNotMatch(bootstrap, /adminScripts|admin-dashboard/);
  assert.equal(fs.existsSync(path.join(root, 'src/js/admin/admin-dashboard.js')), false);
});
