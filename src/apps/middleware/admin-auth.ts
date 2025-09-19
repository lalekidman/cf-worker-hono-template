import { createMiddleware } from "hono/factory";
// import { adminAuth } from "@/apps/integrations/auth/auth-admin";
import { Env, Variables } from "@/shared/interfaces";
import { createRemoteJWKSet, createLocalJWKSet, jwtVerify, JWTVerifyResult } from 'jose'
import { ResponseHandler } from "@/shared/response-handler";
import { Context } from "hono";

const handleDecodeAdminJwt = async (c: Context): Promise<JWTVerifyResult['payload']> => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "")!;
  
  let JWKS: any;
  
  try {
    // Try to get cached JWKS from KV and use createLocalJWKSet
    const cachedJwks = await c.env.JWT_AUTH_KV.get('ADMIN_PUBLIC_JWKS', { type: 'json' });
    if (cachedJwks) {
      JWKS = createLocalJWKSet(cachedJwks);
    } else {
      throw new Error('No cached admin JWKS found');
    }
  } catch (error) {
    // Fallback to createRemoteJWKSet
    try {
      const response = await fetch(new URL('/api/auth/admin/jwks', c.req.url).toString());
      if (response.ok) {
        const jwks = await response.json();
        await c.env.JWT_AUTH_KV.put('ADMIN_PUBLIC_JWKS', JSON.stringify(jwks), {
          expirationTtl: 3600 // Cache for 1 hour
        });
        JWKS = createLocalJWKSet(jwks as any);
      }
    } catch (cacheError) {
      console.warn('Failed to cache admin JWKS:', cacheError);
    }
  }
  
  const decoded = await jwtVerify(token, JWKS, {
    audience: c.env.FRONTEND_URL,
    issuer: c.env.FRONTEND_URL,
  });
  return decoded.payload;
}

const handleAdminJwtAuth = async (c: Context, next: () => Promise<void>) => {
  const {
    iat,
    exp,
    sub: adminId,
  } = await handleDecodeAdminJwt(c);
  const cacheKey = `jwt_admin-${adminId}-${iat}`;
  const cacheAdmin = await c.env.JWT_AUTH_KV.get(cacheKey, {
    type: 'json'
  });
  if (!cacheAdmin) {
    const admin = await c.env.DB.prepare('SELECT * FROM admin WHERE id = ?').bind(adminId).first();
    if (!admin) {
      return ResponseHandler.unauthorized(c, "Unauthorized - Admin not found");
    }
    await c.env.JWT_AUTH_KV.put(cacheKey, JSON.stringify(admin), {
      ...((exp && iat) && { expirationTtl: (exp || 0) - (iat || 0) }), // set the same expiration time as the JWT
    });
    c.set("admin", admin);
  } else {
    c.set("admin", cacheAdmin);
  }
  await next();
}

export const adminAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  try {
    let session = null;
    // Try JWT token first
    if (c.req.header("Authorization")?.startsWith("Bearer ")) {
      await handleAdminJwtAuth(c, next);
      return;
    }
    const headers = c.req.raw.headers;
    // Fallback to session cookie
    if (!session) {
      session = await adminAuth(c.env).api.getSession({ headers });
    } 
    if (!session) {
      return ResponseHandler.unauthorized(c, "Unauthorized - No admin session found");
    }
    c.set("admin", session.user);
    await next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return ResponseHandler.unauthorized(c, "Unauthorized - Admin session verification failed", error);
  }
});