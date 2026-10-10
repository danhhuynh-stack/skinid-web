const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const auth = read('src/features/auth/services/authService.js');
const profile = read('src/features/profile/services/profileService.js');
const cart = read('src/features/cart/services/cartService.js');
const checkout = read('src/features/cart/services/checkoutService.js');
const analysis = read('src/features/skin-analysis/services/skinAnalysisService.js');
const profilePdf = read('src/features/profile/services/profilePdfExport.js');

assert.match(auth, /createUserWithEmailAndPassword/);
assert.match(auth, /signInWithEmailAndPassword/);
assert.match(auth, /signInWithPopup/);
assert.match(auth, /sendPasswordResetEmail/);
assert.match(auth, /reauthenticateWithCredential/);
assert.match(auth, /skinReports/);
assert.match(auth, /collection\(db, 'orders'\)/);
assert.match(profile, /cancelUserOrder/);
assert.match(checkout, /apiRequest\('\/orders'/);
assert.match(auth, /GoogleAuthProvider/);
assert.match(auth, /updateProfilePicture/);
assert.match(cart, /loadUserCart/);
assert.match(cart, /saveUserCart/);
assert.match(cart, /'commerce', 'cart'/);
assert.match(auth, /shippingAddress/);
assert.match(auth, /firebaseUser\.photoURL \|\| profile\.picture/);
assert.match(analysis, /saveSkinReport/);
assert.match(profilePdf, /scan = null/);
assert.match(profilePdf, /scan\s*\?\s*\[scan\]/);
assert.doesNotMatch(profilePdf, /if \(!user\) throw/);
for (const source of [auth, profile, cart, checkout, analysis]) {
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
  assert.doesNotMatch(source, /password:\s*['"]/);
}
assert(!fs.existsSync(path.join(__dirname, '../src/js/account/auth-firebase.js')));

console.log('PASS: modular Auth, Firestore profile/history/cart and Worker checkout flows replace legacy globals.');
