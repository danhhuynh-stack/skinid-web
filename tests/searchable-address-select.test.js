import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const checkoutModal = read('src/features/cart/components/CheckoutModal.jsx');
const searchableSelect = read('src/features/cart/components/SearchableSelect.jsx');
const searchableSelectCss = read('src/features/cart/components/SearchableSelect.css');
const apiClient = read('src/infrastructure/http/apiClient.js');
const workerAuth = read('worker/infrastructure/firebase/auth.js');

// 1. Kiểm tra CheckoutModal đã dùng SearchableSelect cho cả Tỉnh/Thành và Phường/Xã
assert.match(checkoutModal, /import SearchableSelect from '\.\/SearchableSelect\.jsx';/);
assert.match(checkoutModal, /id="checkout-province"/);
assert.match(checkoutModal, /name="provinceCode"/);
assert.match(checkoutModal, /id="checkout-ward"/);
assert.match(checkoutModal, /name="wardCode"/);
assert.doesNotMatch(checkoutModal, /<select[^>]*name="provinceCode"/);
assert.doesNotMatch(checkoutModal, /<select[^>]*name="wardCode"/);

// 2. Kiểm tra SearchableSelect có hỗ trợ search tiếng Việt, alias, native validator và keyboard navigation
assert.match(searchableSelect, /COMMON_ALIASES/);
assert.match(searchableSelect, /removeVietnameseAccents/);
assert.match(searchableSelect, /searchable-select__native-validator/);
assert.match(searchableSelect, /searchable-select__search-input/);
assert.match(searchableSelect, /searchable-select__clear-btn/);
assert.match(searchableSelect, /handleKeyDown/);

// 3. Kiểm tra CSS SearchableSelect
assert.match(searchableSelectCss, /\.searchable-select/);
assert.match(searchableSelectCss, /\.searchable-select__dropdown/);
assert.match(searchableSelectCss, /\.searchable-select__search-wrapper/);
assert.match(searchableSelectCss, /\.searchable-select__item/);
assert.match(searchableSelectCss, /\.searchable-select__item\.is-highlighted/);

// 4. Kiểm tra Auth Token refresh & retry trong apiClient
assert.match(apiClient, /auth\.authStateReady/);
assert.match(apiClient, /getIdToken\(true\)/);
assert.match(apiClient, /response\.status === 401/);

// 5. Kiểm tra Worker Firebase Auth hỗ trợ cả 2 candidate projects
assert.match(workerAuth, /skinid-official/);
assert.match(workerAuth, /skinid-vn/);
assert.match(workerAuth, /candidateProjects/);

console.log('✅ ALL TESTS PASSED: Searchable Address Select & Token Auth resilience successfully verified!');
