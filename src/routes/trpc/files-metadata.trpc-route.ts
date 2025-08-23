import { R2Service } from "@/lib/r2";
import { protectedProcedure, router } from "@/lib/trpc";
import { presignedUrlSchema, createFileMetadataSchema, updateFileMetadataSchema, fileIdSchema, fileMetadataUpdateStatusInputSchema } from "@/validations";
import { FilesMetadataService } from "@/services/files-metadata";
import { TRPCError } from "@trpc/server";
import { FilesMetadataRepositoryService } from "@/db/services/files-metadata.repository.service";

export const filesMetadataRoute = router({
  generatePresignedUrl: protectedProcedure
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
      const filemetadata = await service.create({
        ...input,
        filepath: "uploads",
        bucketName
      });
      const r2Service = new R2Service(accountId, accessKeyId, secretAccessKey, filemetadata.bucketName);
      return await r2Service.generatePresignedUrl({
        ...filemetadata.toObject(),
        expiresIn: input.expiresIn
      });
    }),

  get: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      return service.findById(input.id);
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

  deleteFileMetadata: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FilesMetadataService(new FilesMetadataRepositoryService(ctx.db));
      return service.deleteById(input.id);
    }),
})