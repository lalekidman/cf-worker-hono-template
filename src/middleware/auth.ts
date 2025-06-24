import { createMiddleware } from "hono/factory";
import { userAuth } from "@/lib/auth";
import { Env, Variables } from "@/interfaces";
import { createRemoteJWKSet, createLocalJWKSet, jwtVerify, JWTVerifyResult } from 'jose'
import { ResponseHandler } from "@/utils/response-handler";
import { Context } from "hono";

const handleDecodeJwt = async (c: Context): Promise<JWTVerifyResult['payload']> => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "")!;
  
  let JWKS;
  
  try {
    // Try to get cached JWKS from KV and use createLocalJWKSet
    const cachedJwks = await c.env.JWT_AUTH_KV.get('PUBLIC_JWKS', { type: 'json' });
    if (cachedJwks) {
      JWKS = createLocalJWKSet(cachedJwks);
    } else {
      throw new Error('No cached JWKS found');
    }
  } catch (error) {
    // Fallback to createRemoteJWKSet
    console.log('Using remote JWKS due to:', error);
    JWKS = createRemoteJWKSet(new URL(`/api/auth/user/jwks`, c.req.url));
    
    // Cache the JWKS for future use
    try {
      const response = await fetch(new URL('/api/auth/user/jwks', c.req.url).toString());
      if (response.ok) {
        const jwks = await response.json();
        await c.env.JWT_AUTH_KV.put('PUBLIC_JWKS', JSON.stringify(jwks), {
          expirationTtl: 3600 // Cache for 1 hour
        });
      }
    } catch (cacheError) {
      console.warn('Failed to cache JWKS:', cacheError);
    }
  }
  
  const decoded = await jwtVerify(token, JWKS, {
    audience: c.env.FRONTEND_URL,
    issuer: c.env.FRONTEND_URL,
  });
  return decoded.payload;
}

const handleJwtAuth = async (c: Context, next: () => Promise<void>) => {
  const {
    iat,
    exp,
    sub: userId,
  } = await handleDecodeJwt(c);
  const cacheKey = `jwt_user-${userId}-${iat}`;
  const cacheUser = await c.env.JWT_AUTH_KV.get(cacheKey, {
    type: 'json'
  });
  if (!cacheUser) {
    // is this necessary? we
    const user = await c.env.DB.prepare('SELECT * FROM user WHERE id = ?').bind(userId).first();
    if (!user) {
      return ResponseHandler.unauthorized(c, "Unauthorized - User not found");
    }
    await c.env.JWT_AUTH_KV.put(cacheKey, JSON.stringify(user), {
      ...((exp && iat) && { expirationTtl: (exp || 0) - (iat || 0) }), // set the same expiration time as the JWT
    });
    c.set("user", user);
  } else {
    c.set("user", cacheUser);
  }
  await next();
}

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  try {
    let session = null;
    // Try JWT token first
    if (c.req.header("Authorization")?.startsWith("Bearer ")) {
      await handleJwtAuth(c, next);
      return;
    }
    const headers = c.req.raw.headers;
    // Fallback to session cookie
    if (!session) {
      session = await userAuth(c.env).api.getSession({ headers });
    } 
    if (!session) {
      return ResponseHandler.unauthorized(c, "Unauthorized - No session found");
    }
    c.set("user", session.user);
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return ResponseHandler.unauthorized(c, "Unauthorized - Session verification failed", error);
  }
});

// export const optionalAuthMiddleware = createMiddleware<{
//   Bindings: Env;
//   Variables: Variables;
// }>(async (c, next) => {
//   const authHeader = c.req.header("Authorization");
  
//   try {
//     const a = auth(c.env);
//     let session = null;
    
//     // Try JWT token first
//     if (authHeader?.startsWith("Bearer ")) {
//       const token = authHeader.replace("Bearer ", "");
//       try {
//         session = await a.api.verifyJWT({ token });
//       } catch (jwtError) {
//         console.warn("JWT verification failed:", jwtError);
//       }
//     }
    
//     // Fallback to session cookie
//     if (!session) {
//       session = await a.api.getSession({
//         headers: c.req.raw.headers,
//       });
//     }

//     if (session) {
//       c.set("user", session.user);
//     }
//   } catch (error) {
//     // Ignore errors for optional auth
//     console.warn("Optional auth failed:", error);
//   }
  
//   await next();
// });