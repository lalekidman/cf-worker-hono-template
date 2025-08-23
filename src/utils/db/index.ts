import { text, integer } from 'drizzle-orm/sqlite-core'

export const baseDbSchema = {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  _v: integer('_v').notNull().default(1)
}
