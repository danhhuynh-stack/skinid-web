import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2]?.trim();
if (!email) {
  console.error('Cách dùng: npm run firebase:set-admin -- admin@example.com');
  process.exitCode = 1;
} else {
  const app = getApps()[0] || initializeApp({ credential: applicationDefault() });
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
  console.log(`Đã cấp quyền admin cho ${email} (${user.uid}). Hãy đăng xuất rồi đăng nhập lại.`);
}
