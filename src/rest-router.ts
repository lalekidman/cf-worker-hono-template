import { Hono } from 'hono';
// import { createApplicationRoutes } from '@/application-management/routes/application.routes';

export function createRESTRouter() {
  const app = new Hono<{ Bindings: CloudflareBindings }>();

  // Module routes - will be added as modules are created
  // app.route('/applications', createApplicationRoutes());
  // Add new module routes here

  return app;
}

export type RESTRouter = ReturnType<typeof createRESTRouter>;