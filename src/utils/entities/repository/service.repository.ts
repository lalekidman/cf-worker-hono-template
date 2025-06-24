import { DB } from "@/db";
import { IBaseRepository } from "./interfaces.repository";
import { eq } from "drizzle-orm";
import { SQLiteTable, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { TableConfig } from "drizzle-orm/gel-core";

export abstract class BaseRepositoryService<T extends {id: string}> implements IBaseRepository<T> {
  constructor(
    private readonly db: DB,
    protected readonly table: SQLiteTableWithColumns<T & TableConfig>
  ) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    return result[0] as T || null;
  }

  async save(entity: T): Promise<T> {
    const result = await this.db.insert(this.table).values(entity as any).returning();
    return result[0] as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const result = await this.db.update(this.table).set(data as any).where(eq(this.table.id, id)).returning();
    return result[0] as T || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(this.table).where(eq(this.table.id, id));
    return result.changes > 0;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db.select({ id: this.table.id }).from(this.table).where(eq(this.table.id, id)).limit(1);
    return result.length > 0;
  }
}