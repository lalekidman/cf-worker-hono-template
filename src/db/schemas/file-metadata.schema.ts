import { IFilesMetadataBase } from '@/entities/files-metadata';
import { baseDbSchema } from '@/utils/db'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const filesMetadataSchema = sqliteTable('files_metadata', {
  ...baseDbSchema,
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  filesize: integer('filesize', {mode: "number"}).notNull(),
  expiresIn: integer('expires_in', {mode: "number"}).default(3600), // 1hr
  contentType: text('content_type').notNull(),
  uploaded: integer('uploaded', { mode: 'boolean' }).notNull().default(false),
} as Record<keyof IFilesMetadataBase, any>);
