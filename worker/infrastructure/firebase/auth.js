import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ApiError } from '../../app/errors.js';

const jwksByProject = new Map();

export async function authenticate(request, env) {
  const primaryProjectId = env.FIREBASE_PROJECT_ID || 'skinid-official';
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    throw new ApiError(401, 'unauthenticated', 'Bạn cần đăng nhập trước khi thực hiện thao tác này.');
  }

  // Support seamless migration between skinid-official and legacy skinid-vn
  const candidateProjects = [primaryProjectId];
  if (!candidateProjects.includes('skinid-official')) candidateProjects.push('skinid-official');
  if (!candidateProjects.includes('skinid-vn')) candidateProjects.push('skinid-vn');

  let lastError = null;
  for (const projectId of candidateProjects) {
    let jwks = jwksByProject.get(projectId);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
      jwksByProject.set(projectId, jwks);
    }

    try {
      const result = await jwtVerify(token, jwks, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
        algorithms: ['RS256']
      });
      return result.payload;
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('[SkinID Auth] Token verification failed:', lastError?.message || lastError);
  throw new ApiError(401, 'invalid_token', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
}
