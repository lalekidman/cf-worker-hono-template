import { createTRPCContext, router, protectedProcedure } from '@/lib/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Context } from 'hono';
import { filesRoute } from './files.route';

export const appRouter = router({
  files: filesRoute,
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
// export type AppRouter = ReturnType<typeof appRoute>;