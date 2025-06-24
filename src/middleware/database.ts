import { createMiddleware } from "hono/factory";
import { createDB, DB } from "@/db";
import { Env, Variables } from "@/interfaces";

export const databaseMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables & { db: DB };
}>(async (c, next) => {
  const db = createDB(c.env.DB);
  c.set("db", db);
  await next();
});