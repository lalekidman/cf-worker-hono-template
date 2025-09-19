import { createTRPCContext, router } from '@/apps/integrations/trpc/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Context } from 'hono';

// Import module routers - will be added as modules are created
// import { applicationRouter } from '@/application-management/routes/application.tRPC-route';

export const appRouter = router({
  // application: applicationRouter,
  // Add new modules here
});

export type AppRouter = typeof appRouter;

export function createTRPCHandler() {
  return async (c: Context) => {
    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext: () => createTRPCContext(c),
      onError: ({ error, path }) => {
        console.error(`tRPC Error on ${path}:`, JSON.stringify(error, null, 2));
      },
    });
    return response;
  };
}