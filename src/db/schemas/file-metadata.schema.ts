import { IFilesMetadataBase } from '@/entities/files-metadata';
import { baseDbSchema } from '@/utils/db'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const filesMetadataSchema = sqliteTable('files_metadata', {
  ...baseDbSchema,
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  filesize: integer('filesize', {mode: "number"}).notNull(),
  bucketName: text('bucket_name').notNull().default(""),
  expiresAt: integer('expires_in', {mode: "timestamp"}),
  contentType: text('content_type').notNull(),
  status: text('status').notNull().default('pending'),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  purpose: text('purpose').notNull(),
} as Record<keyof IFilesMetadataBase, any>, (table) => ({
  resourceTypeIdx: index('files_metadata_resource_type_idx').on(table.resourceType),
  resourceIdIdx: index('files_metadata_resource_id_idx').on(table.resourceId),
  purposeIdx: index('files_metadata_purpose_idx').on(table.purpose),
  resourceTypeResourceIdIdx: index('files_metadata_resource_type_resource_id_idx').on(table.resourceType, table.resourceId),
  resourceTypeResourceIdPurposeIdx: index('files_metadata_resource_type_resource_id_purpose_idx').on(table.resourceType, table.resourceId, table.purpose),
}));
