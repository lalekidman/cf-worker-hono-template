import { R2Service } from "@/lib/r2";
import { protectedProcedure, router } from "@/lib/trpc";
import { presignedUrlSchema, createFileMetadataSchema, updateFileMetadataSchema, fileIdSchema, fileMetadataUpdateStatusInputSchema, fileMetadataValidationSchema, fileGetByResourceQuery } from "@/validations";
import { FilesMetadataService } from "@/services/files-metadata";
import { TRPCError } from "@trpc/server";
import { FilesMetadataRepositoryService } from "@/db/services/files-metadata.repository.service";
import z from "zod";
const getR2Service = (bucketName: string, env: Cloudflare.Env) => {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  return new R2Service(accountId, accessKeyId, secretAccessKey, bucketName);
}
export const filesMetadataRoute = router({
  createPresign: protectedProcedure
    .input(presignedUrlSchema)
    .mutation(async ({ input, ctx }) => {
      const accountId = ctx.c.env.R2_ACCOUNT_ID;
      const accessKeyId = ctx.c.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = ctx.c.env.R2_SECRET_ACCESS_KEY;
      const bucketName = ctx.c.env.R2_BUCKET_NAME || 'general-dev';

      if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error('R2 credentials not configured');
      }
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      const filemetadata = await service.findOneOrCreate({
        ...input,
        filepath: "uploads",
        bucketName
      });
      const r2Service = getR2Service(filemetadata.bucketName, ctx.c.env);
      return await r2Service.generatePresignedUrl({
        bucketName: filemetadata.bucketName,
        contentType: filemetadata.contentType,
        filesize: filemetadata.filesize,
        key: filemetadata.location,
        expiresIn: (filemetadata.createdAt.getTime() - filemetadata.expiresAt.getTime())
      });
    }),

  get: protectedProcedure
    .input(fileIdSchema)
    .output(fileMetadataValidationSchema.extend({url: z.string()}))
    .query(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      const file = await service.findByIdStrict(input.id);
      const r2Service = getR2Service(file.bucketName, ctx.c.env);
      const url = await r2Service.generatePresignedDownloadUrl(file.location);
      
      return {
        ...file.toObject(),
        url
      }
    }),

  getByResource: protectedProcedure
    .input(fileGetByResourceQuery)
    .output(fileMetadataValidationSchema.extend({url: z.string()}).nullable())
    .query(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      const file = await service.getOneLatestActiveByResource(input.resourceType, input.resourceId, {
        purpose: input.purpose
      })
      if (!file) {
        return null;
      }
      const r2Service = getR2Service(file.bucketName, ctx.c.env);
      const url = await r2Service.generatePresignedDownloadUrl(file.location);
      
      return {
        ...file.toObject(),
        url
      }
    }),

  updateStatus: protectedProcedure
    .input(fileMetadataUpdateStatusInputSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      const result = await service.update(input.id, {
        status: input.data.status
      });
      return result
    }),

  delete: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      return service.deleteById(input.id);
    }),
})