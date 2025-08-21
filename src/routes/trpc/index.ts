import { createTRPCContext, router, protectedProcedure } from '@/lib/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Context } from 'hono';
import { presignedUrlSchema } from '@/validations/files';
import { R2Service } from '@/services/r2';

export const appRouter = router({
  files: router({
    generatePresignedUrl: protectedProcedure
      .input(presignedUrlSchema)
      .mutation(async ({ input, ctx }) => {
        const r2Service = new R2Service(ctx.c.env.R2_BUCKET);
        const baseUrl = ctx.c.env.BASE_URL || 'http://localhost:9002';
        
        return await r2Service.generatePresignedUrl(input, baseUrl);
      }),
  }),
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