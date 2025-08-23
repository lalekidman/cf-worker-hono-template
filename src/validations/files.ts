import { z } from 'zod';

export const presignedUrlSchema = z.object({
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  contentType: z.string().min(1, 'Content type is required'),
  filesize: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size too large (max 100MB)'), // 100MB limit
  expiresIn: z.number().optional().default(3600), // 1 hour default
});

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
  uploaded: z.boolean().optional().default(false),
});

export const updateFileMetadataSchema = z.object({
  filename: z.string().min(1, 'File name is required').max(255, 'File name too long').optional(),
  filepath: z.string().min(1, 'File path is required').max(500, 'File path too long').optional(),
  contentType: z.string().min(1, 'Content type is required').optional(),
  filesize: z.number().positive('File size must be positive').optional(),
  uploaded: z.boolean().optional(),
});

export const fileIdSchema = z.object({
  id: z.string().min(1, 'File ID is required'),
});