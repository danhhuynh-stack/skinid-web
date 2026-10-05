import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ApiError } from '../../app/errors.js';

const jwksByProject = new Map();

export async function authenticate(request, env) {
  const projectId = env.FIREBASE_PROJECT_ID || 'skinid-df273';
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    throw new ApiError(401, 'unauthenticated', 'Bạn cần đăng nhập trước khi thực hiện thao tác này.');
  }

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
  } catch {
    throw new ApiError(401, 'invalid_token', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }
}
