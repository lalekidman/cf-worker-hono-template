import { createMiddleware } from "hono/factory";
import { Env, Variables } from "@/shared/interfaces";
import { createLocalJWKSet, jwtVerify, JWTVerifyResult } from 'jose'
import { ResponseHandler } from "@/shared/response-handler";
import { Context } from "hono";

const handleDecodeJwt = async (c: Context<{ Bindings: Cloudflare.Env }>): Promise<JWTVerifyResult['payload']> => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.replace("Bearer ", "")!;
  
  let JWKS;
  if (!token) {
    throw new Error("Unauthorized - No token found");
  }
  try {
    // Try to get cached JWKS from KV and use createLocalJWKSet
    JWKS = await c.env.JWT_AUTH_KV.get('PUBLIC_JWKS', { type: 'json' });
    if (!JWKS) {
      throw new Error('No cached JWKS found');
    }
  } catch (error) {
    console.log('Using remote JWKS due to:', error);
    try {
      const response = await c.env.IAM_SERVICE.fetch('http://iam-api-worker/api/auth/user/jwks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        JWKS = await response.json();
        await c.env.JWT_AUTH_KV.put('PUBLIC_JWKS', JSON.stringify(JWKS), {
          expirationTtl: 3600 // Cache for 1 hour
        });
      }
    } catch (cacheError) {
      console.warn('Failed to cache JWKS:', cacheError);
    }
  }
  const localJWKS = createLocalJWKSet(JWKS as any);
  
  const decoded = await jwtVerify(token, localJWKS, {
    audience: c.env.FRONTEND_URL,
    issuer: c.env.FRONTEND_URL,
  });
  return decoded.payload;
}

const handleJwtAuth = async (c: Context, next: () => Promise<void>) => {
  const {
    iat,
    sub: userId,
  } = await handleDecodeJwt(c);
  const cacheKey = `jwt_user-${userId}-${iat}`;
  const cacheUser = await c.env.JWT_AUTH_KV.get(cacheKey, {
    type: 'json'
  });
  if (!cacheUser) {
    const authorization = c.req.header("Authorization");
    const token = authorization?.replace("Bearer ", "")!;
    // if not cache, then fetch user using the token right?
    const user = await c.env.IAM_SERVICE.fetch('http://iam-api-worker/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (user.ok) {
      const userData = await user.json();
      await c.env.JWT_AUTH_KV.put(cacheKey, JSON.stringify(userData), {
        expirationTtl: 3600 // Cache for 1 hour
      });
    } else {
      return ResponseHandler.unauthorized(c, "Unauthorized - User not found");
    }
  }
  c.set("user", cacheUser);
  return await next();
}

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  try {
    // Try JWT token first
    if (c.req.header("Authorization")?.startsWith("Bearer ")) {
      return await handleJwtAuth(c, next);
    }
    throw new Error("Unauthorized - Session verification failed");
  } catch (error) {
    console.error("Auth middleware error:", error);
    return ResponseHandler.unauthorized(c, "Unauthorized - Session verification failed", error);
  }
});
