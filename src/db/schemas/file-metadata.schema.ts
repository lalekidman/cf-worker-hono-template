import { IFilesMetadataBase } from '@/entities/files-metadata';
import { baseDbSchema } from '@/utils/db'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const filesMetadataSchema = sqliteTable('files_metadata', {
  ...baseDbSchema,
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  filesize: integer('filesize', {mode: "number"}).notNull(),
  bucketName: text('bucket_name').notNull().default(""),
  expiresAt: integer('expires_in', {mode: "timestamp"}),
  contentType: text('content_type').notNull(),
  status: text('status').notNull().default('pending'),
} as Record<keyof IFilesMetadataBase, any>);
