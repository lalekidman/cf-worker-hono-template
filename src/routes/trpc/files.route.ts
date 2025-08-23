import { R2Service } from "@/lib/r2";
import { protectedProcedure, router } from "@/lib/trpc";
import { presignedUrlSchema, createFileMetadataSchema, updateFileMetadataSchema, fileIdSchema } from "@/validations";
import { FilesMetadataService } from "@/services/files-metadata";
import { TRPCError } from "@trpc/server";
import { FilesMetadataRepositoryService } from "@/db/services/files-metadata.repository.service";

export const filesRoute = router({
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
      const r2Service = new R2Service(accountId, accessKeyId, secretAccessKey, bucketName);
      const filemetadata = await service.create({
        ...input,
        filepath: "uploads"
      });
      return await r2Service.generatePresignedUrl({
        ...filemetadata.toObject(),
        expiresIn: input.expiresIn
      });
    }),

  createFileMetadata: protectedProcedure
    .input(createFileMetadataSchema)
    .mutation(async ({ input, ctx }) => {
      // Note: This would need proper dependency injection setup
      // const filesMetadataService = ctx.filesMetadataService as FilesMetadataService;
      
      // For now, throwing error to indicate DI setup needed
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'FilesMetadataService dependency injection not configured'
      });

      // Implementation would be:
      // const success = await filesMetadataService.create(input);
      // if (!success) {
      //   throw new TRPCError({
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: 'Failed to create file metadata'
      //   });
      // }
      // return { success: true };
    }),

  getFileMetadata: protectedProcedure
    .input(fileIdSchema)
    .query(async ({ input, ctx }) => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'FilesMetadataService dependency injection not configured'
      });
      
      // Implementation would be:
      // const filesMetadataService = ctx.filesMetadataService as FilesMetadataService;
      // const file = await filesMetadataService.findById(input.id);
      // if (!file) {
      //   throw new TRPCError({
      //     code: 'NOT_FOUND',
      //     message: 'File metadata not found'
      //   });
      // }
      // return file;
    }),

  markFileAsUploaded: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ input, ctx }) => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'FilesMetadataService dependency injection not configured'
      });

      // Implementation would be:
      // const filesMetadataService = ctx.filesMetadataService as FilesMetadataService;
      // const success = await filesMetadataService.markFileAsUploaded(input.id);
      // if (!success) {
      //   throw new TRPCError({
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: 'Failed to mark file as uploaded'
      //   });
      // }
      // return { success: true };
    }),

  deleteFileMetadata: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ input, ctx }) => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'FilesMetadataService dependency injection not configured'
      });

      // Implementation would be:
      // const filesMetadataService = ctx.filesMetadataService as FilesMetadataService;
      // const success = await filesMetadataService.deleteById(input.id);
      // if (!success) {
      //   throw new TRPCError({
      //     code: 'NOT_FOUND',
      //     message: 'File metadata not found or delete failed'
      //   });
      // }
      // return { success: true };
    }),
})