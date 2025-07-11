import { Hono } from 'hono'
import { corsMiddleware } from '@/middleware/cors';
import pck from '../package.json';
import { errorController } from './controllers';
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use('*', corsMiddleware);
app.get("/ver", (c) => {
  return c.json({
    name: pck.name,
    version: pck.version,
    description: pck.description,
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.onError(errorController as any);
export default app
