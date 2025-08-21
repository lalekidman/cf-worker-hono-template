import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from 'hono';
import { Env, Variables } from '@/interfaces';
import { handleUserDecodeJwt, handleAdminDecodeJwt } from '@/lib/auth';
import { createDB } from '@/db'

export interface TRPCContext {
  c: Context<{ Bindings: Env; Variables: Variables }>;
  user?: any;
  admin?: any;
  db?: any;
}

const handleUserAuth = async (c: Context) => {
  const {
    iat,
    exp,
    sub: userId,
  } = await handleUserDecodeJwt(c);
  const cacheKey = `jwt_user-${userId}-${iat}`;
  let user = await c.env.JWT_AUTH_KV.get(cacheKey, {
    type: 'json'
  });
  if (!user) {
    const authorization = c.req.header("Authorization");
    const token = authorization?.replace("Bearer ", "")!;
    // if no cache found, then fetch the user from the IAM service
    const result = await c.env.AUTH_SERVICE.fetch('http://auth-api-worker/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (result.ok) {
      user = await result.json();
      await c.env.JWT_AUTH_KV.put(cacheKey, JSON.stringify(user), {
        expirationTtl: 3600 // Cache for 1 hour
      });
    }
  }
  return user;
}
const handleAdminAuth = async (c: Context) => {
  const {
    iat,
    exp,
    sub: userId,
  } = await handleAdminDecodeJwt(c);
  let user = null;
  const cacheKey = `jwt_admin-${userId}-${iat}`;
  const cacheUser = await c.env.JWT_AUTH_KV.get(cacheKey, {
    type: 'json'
  });
  if (!cacheUser) {
    const authorization = c.req.header("Authorization");
    const token = authorization?.replace("Bearer ", "")!;
    // if no cache found, then fetch the user from the IAM service
    const result = await c.env.AUTH_SERVICE.fetch('http://auth-api-worker/api/admin/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (result.ok) {
      user = await result.json();
      await c.env.JWT_AUTH_KV.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 3600 // Cache for 1 hour
      });
    }
  }
  return user;
}


export const createTRPCContext = async (c: Context): Promise<TRPCContext> => {
  let user = null;
  let admin = null;

  try {
    // Try JWT token first
    if (c.req.header("Authorization")?.startsWith("Bearer ")) {
      user = await handleUserAuth(c);
      c.set("user", user);
      // admin = await handleAdminAuth(c);
    }
  } catch (error) {
    console.warn("tRPC auth context error:", error);
  }

  return {
    c,
    user,
    admin,
    db: createDB(c.env.DB)
  };
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Authenticated procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now guaranteed to be defined
    },
  });
});