import { Context, Next } from "hono";
import { z } from "zod";

export const bodyValidationMiddleware = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const parsed = schema.parse(body);
    c.set('parsedBody', parsed);
    await next();
    return;
  }
}

export const queryValidationMiddleware = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    const query = await c.req.query();
    const parsed = schema.parse(query);
    c.set('parsedQuery', parsed);
    await next();
    return;
  }
}

export const paramsValidationMiddleware = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    const params = await c.req.param();
    const parsed = schema.parse(params);
    c.set('parsedParams', parsed);
    await next();
    return;
  }
}