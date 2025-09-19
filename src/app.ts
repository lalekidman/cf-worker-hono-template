import { Hono } from 'hono';
import { corsMiddleware } from '@/apps/middleware/cors';
import { createTRPCHandler } from './trpc-router';
import { createRESTRouter } from './rest-router';
import packageJson from '../package.json';

const app = new Hono<{ Bindings: CloudflareBindings }>();

console.log(`[SERVICE] Initializing ${packageJson.name} v${packageJson.version}`);

// Global middleware
app.use('*', corsMiddleware);

// Health endpoints
app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/version", (c) => {
  return c.json({
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  });
});

// API routes
app.all('/trpc/*', createTRPCHandler());
app.route('/', createRESTRouter());

export default app
