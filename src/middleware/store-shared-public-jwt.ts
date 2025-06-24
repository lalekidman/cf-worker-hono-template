import { storeSharedPublicJwt } from "@/lib/store-shared-public-jwt";
import { Context, Next } from "hono";

export const storeSharedPublicJwtMiddleware = async (c: Context, next: Next) => {
  const pathname = new URL(c.req.url).pathname;
  if (pathname === '/api/auth/jwks') {
    return await next();
  }
  await storeSharedPublicJwt(c);
  return await next();
}