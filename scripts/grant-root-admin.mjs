import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const targetEmail = 'danh.huynh@fieldman.vn';
const serviceAccountPath = resolve(process.cwd(), 'config', 'skinid-vietnam-service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error(`❌ Không tìm thấy service account key tại: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log(`🔍 Đang tìm kiếm tài khoản ${targetEmail} trên Firebase Auth...`);
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(targetEmail);
    console.log(`✅ Đã tìm thấy user: UID = ${userRecord.uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`⚠️ User chưa tồn tại trên Firebase Auth. Tạo tài khoản với email ${targetEmail}...`);
      userRecord = await auth.createUser({
        email: targetEmail,
        displayName: 'Danh Huỳnh (Super Admin)',
        emailVerified: true
      });
      console.log(`✅ Đã tạo user mới: UID = ${userRecord.uid}`);
    } else {
      throw err;
    }
  }

  // Set Custom User Claims
  console.log(`🛡️ Đang gán Custom Claims { admin: true, role: 'super_admin' }...`);
  await auth.setCustomUserClaims(userRecord.uid, {
    admin: true,
    role: 'super_admin'
  });
  console.log(`✅ Đã gán Custom Claims thành công!`);

  // Update Firestore user document
  console.log(`📄 Đang cập nhật profile Firestore (collection 'users', doc '${userRecord.uid}')...`);
  const userRef = db.collection('users').doc(userRecord.uid);
  await userRef.set({
    email: targetEmail,
    name: userRecord.displayName || 'Danh Huỳnh',
    role: 'super_admin',
    isAdmin: true,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`✅ Đã cập nhật Firestore document thành công!`);
  console.log(`🎉 Tài khoản ${targetEmail} hiện đã có toàn quyền Super Admin (Root)!`);
}

main().catch((err) => {
  console.error('❌ Lỗi khi cấp quyền Admin:', err);
  process.exit(1);
});
