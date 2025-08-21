import { z } from 'zod';

export const presignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  contentType: z.string().min(1, 'Content type is required'),
  fileSize: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size too large (max 100MB)'), // 100MB limit
  expiresIn: z.number().optional().default(3600), // 1 hour default
});

export type PresignedUrlRequest = z.infer<typeof presignedUrlSchema>;

export const presignedUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string(),
  expiresAt: z.date(),
});

export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;