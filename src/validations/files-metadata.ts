import { FileStatus, IFilesMetadataBase } from '@/entities/files-metadata';
import { z } from 'zod';
import { ResponseBaseSchema } from './common';

export const presignedUrlSchema = z.object({
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  contentType: z.string().min(1, 'Content type is required'),
  filesize: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size too large (max 100MB)'), // 100MB limit
  expiresIn: z.number().optional().default(3600), // 1 hour default
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
  purpose: z.string().min(1, 'Purpose is required'),
});

export const fileMetadataValidationSchema = z.object({
  ...(ResponseBaseSchema.shape),
  filepath: z.string(),
  status: z.string(),
  expiresAt: z.date(),
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  contentType: z.string().min(1, 'Content type is required'),
  filesize: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size too large (max 100MB)'), // 100MB limit
  expiresIn: z.number().optional().default(3600), // 1 hour default
  resourceType: z.string(),
  resourceId: z.string(),
  purpose: z.string(),
} as Record<keyof Omit<IFilesMetadataBase, 'bucketName'>, any>);

export type PresignedUrlRequest = z.infer<typeof presignedUrlSchema>;

export const presignedUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string(),
  expiresAt: z.date(),
});

export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;

export const createFileMetadataSchema = z.object({
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  filepath: z.string().min(1, 'File path is required').max(500, 'File path too long'),
  contentType: z.string().min(1, 'Content type is required'),
  filesize: z.number().positive('File size must be positive'),
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
  purpose: z.string().min(1, 'Purpose is required'),
});

export const updateFileMetadataSchema = z.object({
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long').optional(),
  filepath: z.string().min(1, 'File path is required').max(500, 'File path too long').optional(),
  contentType: z.string().min(1, 'Content type is required').optional(),
  filesize: z.number().positive('File size must be positive').optional(),
  status: z.string().optional(),
  resourceType: z.string().min(1, 'Resource type is required').optional(),
  resourceId: z.string().min(1, 'Resource ID is required').optional(),
  purpose: z.string().min(1, 'Purpose is required').optional(),
});

export const fileIdSchema = z.object({
  id: z.string().min(1, 'File ID is required'),
});

export const fileGetByResourceQuery = z.object({
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
  purpose: z.string().min(1, 'Purpose is required'),
});
export const fileMetadataUpdateStatusInputSchema = fileIdSchema.extend({
  data: z.object({
    status: z.enum([FileStatus.ACTIVE, FileStatus.FAILED])
  })
});