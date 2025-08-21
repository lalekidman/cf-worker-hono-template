import { createLocalJWKSet, jwtVerify, JWTVerifyResult } from 'jose'
import { Context } from "hono";

export const makeDecodeJwtHandler = ({
  kvKey,
  urlPath
}: {kvKey: string, urlPath: string}) => {
  return async (c: Context): Promise<JWTVerifyResult['payload']> => {
    const authorization = c.req.header("Authorization");
    const token = authorization?.replace("Bearer ", "")!;
    
    let JWKS;
    if (!token) {
      throw new Error("Unauthorized - No token found");
    }
    try {
      // Try to get cached JWKS from KV and use createLocalJWKSet
      JWKS = await c.env.JWT_AUTH_KV.get(kvKey, { type: 'json' });
      if (!JWKS) {
        throw new Error('No cached JWKS found');
      }
    } catch (error) {
      console.log('Using remote JWKS due to:', error);
      try {
        const url = new URL(urlPath, "http://auth-service");
        const response = await c.env.AUTH_SERVICE.fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          JWKS = await response.json();
          await c.env.JWT_AUTH_KV.put(kvKey, JSON.stringify(JWKS), {
            expirationTtl: 3600 // Cache for 1 hour
          });
        }
      } catch (cacheError) {
        console.warn('Failed to cache JWKS:', cacheError);
      }
    }
    const localJWKS = createLocalJWKSet(JWKS as any);
    
    const decoded = await jwtVerify(token, localJWKS, {
      audience: c.env.BASE_URL,
      issuer: c.env.BASE_URL,
    });
    return decoded.payload;
  }
}

export const handleUserDecodeJwt = makeDecodeJwtHandler({
  kvKey: 'PUBLIC_JWKS',
  urlPath: '/auth/user/jwks',
});
export const handleAdminDecodeJwt = makeDecodeJwtHandler({
  kvKey: 'ADMIN_PUBLIC_JWKS',
  urlPath: '/auth/admin/jwks',
});