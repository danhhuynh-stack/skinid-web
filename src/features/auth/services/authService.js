import { firebaseServices } from '../../../infrastructure/firebase/index.js';

const { auth, db, sdk } = firebaseServices;

const firebaseMessages = {
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
  'auth/weak-password': 'Mật khẩu chưa đủ mạnh.',
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
  'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này đang tạm ngưng.',
  'auth/unauthorized-domain': 'Đăng nhập chưa được hỗ trợ trên địa chỉ website này.'
};

function announceProfileUpdate(user) {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('skinid:profile-updated', { detail: user }));
}

export function authErrorMessage(error) {
  return firebaseMessages[error?.code] || error?.message || 'Không thể hoàn tất yêu cầu.';
}

async function loadProfile(firebaseUser, initialProfile = {}) {
  const { doc, getDoc, serverTimestamp, setDoc } = sdk.firestore;
  const reference = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(reference);
  const provider = firebaseUser.providerData.some((item) => item.providerId === 'google.com') ? 'google' : 'password';
  const defaults = {
    name: firebaseUser.displayName || initialProfile.name || firebaseUser.email?.split('@')[0] || 'Thành viên SkinID',
    email: firebaseUser.email || '',
    phone: initialProfile.phone || firebaseUser.phoneNumber || '',
    picture: firebaseUser.photoURL || null,
    provider
  };

  if (!snapshot.exists()) {
    await setDoc(reference, { ...defaults, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  const profile = snapshot.data() || {};
  const token = await sdk.auth.getIdTokenResult(firebaseUser).catch(() => ({ claims: {} }));
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    ...defaults,
    ...profile,
    picture: String(profile.picture || '').startsWith('data:image/')
      ? profile.picture
      : (firebaseUser.photoURL || profile.picture || null),
    isAdmin: token.claims?.admin === true,
    customClaims: token.claims || {}
  };
}

export async function fetchHistory(userId) {
  const { collection, getDocs, limit, orderBy, query } = sdk.firestore;
  const result = await getDocs(query(collection(db, 'users', userId, 'skinReports'), orderBy('createdAt', 'desc'), limit(100)));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function fetchOrders(userId) {
  const { collection, getDocs, query, where } = sdk.firestore;
  const result = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
  const getOrderTime = (val) => {
    if (!val) return 0;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    const time = new Date(val).getTime();
    return Number.isNaN(time) ? 0 : time;
  };
  return result.docs
    .map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
    .sort((left, right) => getOrderTime(right.createdAt) - getOrderTime(left.createdAt));
}

export async function loadAuthSession(firebaseUser) {
  const user = await loadProfile(firebaseUser);
  const [history, orders] = await Promise.all([
    fetchHistory(user.uid).catch(() => []),
    fetchOrders(user.uid).catch(() => [])
  ]);
  return { user, history, orders };
}

export function subscribeToAuthSession(onSession, onError) {
  let revision = 0;
  return sdk.auth.onAuthStateChanged(auth, async (firebaseUser) => {
    const currentRevision = ++revision;
    if (!firebaseUser) {
      onSession({ user: null, history: [], orders: [] });
      return;
    }
    try {
      const session = await loadAuthSession(firebaseUser);
      if (currentRevision === revision) onSession(session);
    } catch (error) {
      if (currentRevision === revision) onError?.(error);
    }
  });
}

export async function loginWithEmail(email, password, remember = true) {
  await sdk.auth.setPersistence(auth, remember ? sdk.auth.browserLocalPersistence : sdk.auth.browserSessionPersistence);
  const credential = await sdk.auth.signInWithEmailAndPassword(auth, email.trim(), password);
  return loadProfile(credential.user);
}

export async function registerWithEmail({ name, email, phone = '', password, confirmPassword = password, remember = true }) {
  const normalizedPhone = phone.replace(/[\s.-]/g, '');
  if (!name || name.trim().length < 2) throw new Error('Vui lòng nhập họ tên hợp lệ.');
  if (normalizedPhone && !/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) throw new Error('Số điện thoại Việt Nam chưa đúng định dạng.');
  if (password !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
  if (!password || password.length < 6) throw new Error('Mật khẩu phải có tối thiểu 6 ký tự.');

  await sdk.auth.setPersistence(auth, remember ? sdk.auth.browserLocalPersistence : sdk.auth.browserSessionPersistence);
  const credential = await sdk.auth.createUserWithEmailAndPassword(auth, email.trim(), password);
  await sdk.auth.updateProfile(credential.user, { displayName: name.trim() });
  const { doc, serverTimestamp, setDoc } = sdk.firestore;
  await setDoc(doc(db, 'users', credential.user.uid), {
    name: name.trim(),
    email: email.trim(),
    phone: normalizedPhone,
    provider: 'password',
    updatedAt: serverTimestamp()
  }, { merge: true });
  return loadProfile(credential.user, { name: name.trim(), phone: normalizedPhone });
}

export async function loginWithGoogle() {
  await sdk.auth.setPersistence(auth, sdk.auth.browserLocalPersistence);
  const provider = new sdk.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await sdk.auth.signInWithPopup(auth, provider);
  return loadProfile(credential.user);
}

export function logout() {
  return sdk.auth.signOut(auth);
}

export function resetPassword(email) {
  return sdk.auth.sendPasswordResetEmail(auth, email.trim());
}

export async function updateUserProfile(userId, data) {
  const normalizedPhone = String(data.phone || '').replace(/[\s.-]/g, '');
  if (normalizedPhone && !/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) throw new Error('Số điện thoại Việt Nam chưa đúng định dạng.');
  const safe = {
    name: String(data.name || '').trim(),
    phone: normalizedPhone,
    birthday: String(data.birthday || ''),
    gender: String(data.gender || ''),
    address: String(data.shippingAddress?.fullAddress || data.address || '').trim(),
    shippingAddress: data.shippingAddress || null,
    skinTypeBaseline: String(data.skinTypeBaseline || ''),
    mainConcern: String(data.mainConcern || ''),
    updatedAt: sdk.firestore.serverTimestamp()
  };
  await sdk.firestore.updateDoc(sdk.firestore.doc(db, 'users', userId), safe);
  if (safe.name && auth.currentUser && safe.name !== auth.currentUser.displayName) {
    await sdk.auth.updateProfile(auth.currentUser, { displayName: safe.name });
  }
  const user = await loadProfile(auth.currentUser);
  announceProfileUpdate(user);
  return user;
}

export async function updateProfilePicture(userId, picture) {
  if (!String(picture || '').startsWith('data:image/')) throw new Error('Ảnh đại diện không hợp lệ.');
  if (picture.length > 300_000) throw new Error('Ảnh đại diện sau xử lý vẫn quá lớn.');
  await sdk.firestore.updateDoc(sdk.firestore.doc(db, 'users', userId), {
    picture,
    updatedAt: sdk.firestore.serverTimestamp()
  });
  const user = await loadProfile(auth.currentUser);
  announceProfileUpdate(user);
  return user;
}

export async function changePassword(currentPassword, newPassword) {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser?.email) throw new Error('Chưa đăng nhập bằng tài khoản email.');
  if (firebaseUser.providerData.some((provider) => provider.providerId === 'google.com')) {
    throw new Error('Mật khẩu của tài khoản này do Google quản lý.');
  }
  if (!newPassword || newPassword.length < 6) throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
  const credential = sdk.auth.EmailAuthProvider.credential(firebaseUser.email, currentPassword);
  await sdk.auth.reauthenticateWithCredential(firebaseUser, credential);
  await sdk.auth.updatePassword(firebaseUser, newPassword);
}

export async function clearUserHistory(userId) {
  const history = await fetchHistory(userId);
  await Promise.all(history.map((item) => sdk.firestore.deleteDoc(sdk.firestore.doc(db, 'users', userId, 'skinReports', item.id))));
}
