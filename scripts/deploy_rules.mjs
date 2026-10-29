import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const keyPath = resolve(projectRoot, 'config/skinid-vietnam-service-account.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

async function getAccessToken() {
  const { createSign } = await import('node:crypto');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encClaims = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${encHeader}.${encClaims}`);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${encHeader}.${encClaims}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  return data.access_token;
}

async function deployFirestoreRules() {
  const token = await getAccessToken();
  const rulesContent = readFileSync(resolve(projectRoot, 'firestore.rules'), 'utf8');

  console.log('⏳ Đang tạo Ruleset mới cho Firestore...');
  const createRulesetRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${serviceAccount.project_id}/rulesets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent
          }
        ]
      }
    })
  });

  const rulesetData = await createRulesetRes.json();
  if (!createRulesetRes.ok) {
    throw new Error(`Tạo ruleset thất bại: ${JSON.stringify(rulesetData)}`);
  }
  console.log(`✅ Ruleset đã tạo thành công: ${rulesetData.name}`);

  console.log('⏳ Đang phát hành (release) Ruleset lên Firestore...');
  const releaseName = `projects/${serviceAccount.project_id}/releases/cloud.firestore`;
  const releaseRes = await fetch(`https://firebaserules.googleapis.com/v1/${releaseName}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      release: {
        name: releaseName,
        rulesetName: rulesetData.name
      }
    })
  });

  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) {
    throw new Error(`Release thất bại: ${JSON.stringify(releaseData)}`);
  }
  console.log(`🎉 [THÀNH CÔNG] Đã kích hoạt bộ luật Firestore Security Rules 341 dòng lên ${serviceAccount.project_id}!`);
}

deployFirestoreRules().catch(err => {
  console.error('❌ Lỗi deploy rules:', err.message);
  process.exit(1);
});
