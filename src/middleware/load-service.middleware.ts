import { Context, Next } from "hono";

export const loadService = (moduleService: any) => {
  return async(c: Context, next: Next) => {
    const service = new moduleService(c.get("db")!);
    c.set("service", service);
    await next();
    return;
  }
}