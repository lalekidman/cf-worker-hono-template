import { DB } from "@/db";
import { IBaseRepositoryService } from "./interfaces.repository";
import { and, eq, gte, inArray, isNotNull, isNull, lt, lte, ne, SQL } from "drizzle-orm";
import { IEntityBaseProperties } from "@/utils/entities";
import { AdditionalConditions, Connection, RelayPagination, RelayPaginationArgs, RelayPaginationOptions } from "../pagination";

export abstract class BaseRepositoryService<T extends IEntityBaseProperties> implements IBaseRepositoryService<T> {
  protected readonly operators = {
    eq,
    ne,
    gte,
    lt,
    lte,
    in: inArray,
    isNull: (field: any, _: any) => isNull(field),
    isNotNull: (field: any, _: any) => isNotNull(field),
  }
  constructor(
    protected readonly db: DB,
    protected readonly table: any
  ) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    return result.length > 0 ? this.mapResult(result[0]) : null;
  }
  async findOne(entity: Partial<T>): Promise<T | null> {
    const conditions = Object.entries(entity)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (value === null) {
        return isNull(this.table[key]);
      }
      return eq(this.table[key], value);
    });
    const result = await this.db.select().from(this.table).where(and(...conditions)).limit(1);
    return result.length > 0 ? this.mapResult(result[0]) : null;
  }
  async find(conditions?: AdditionalConditions<T>[]): Promise<T[]> {
    const c = conditions ? await this.buildConditions(conditions) : [];
    const cursor = this.db.select().from(this.table);
    if (c.length > 0) {
      cursor.where(and(...c));
    }
    const result = await cursor.execute();
    return result.map(this.mapResult) as T[];
  }

  async insert (data: T): Promise<boolean> {
    const _data = {
      ...data,
      createdAt: (data.createdAt as any) instanceof Date ? data.createdAt : new Date(data.createdAt),
      updatedAt: (data.updatedAt as any) instanceof Date ? data.updatedAt : new Date(data.updatedAt),
    }
    const result = await this.db.insert(this.table).values(_data as any).execute();
    return result.success;
  }

  async update(id: string, data: Partial<T>): Promise<boolean> {
    const updatedAtIsDate = (data.updatedAt as any) instanceof Date;
    const _data = {
      ...data,
      updatedAt: updatedAtIsDate ? data.updatedAt : new Date(data.updatedAt || Date.now()),
      _v: Number(data._v || 1),
    }
    const result = await this.db.update(this.table).set(_data as any).where(eq(this.table.id, id)).execute();
    return result && result.success;
  }

  async delete(entity: Partial<T>): Promise<any> {
    const conditions = Object.entries(entity)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (value === null) {
        return isNull(this.table[key]);
      }
      return eq(this.table[key], value);
    });
    const result = await this.db.delete(this.table).where(and(...conditions)).returning();
    return result && Array.isArray(result) ? result.length > 0 : false;
  }
  async deleteById(id: string): Promise<boolean> {
    const result = await this.db.delete(this.table).where(eq(this.table.id, id)).execute();
    return result.success;
  }
  
  protected mapResult (row: any): T|null {
    return row ? {
      ...(row),
      // createdAt: typeof row.createdAt === 'number' ? row.createdAt : row.createdAt.getTime(),
      // updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : row.updatedAt.getTime(),
    } : null
  }

  async buildConditions(additionalConditions: AdditionalConditions<T>[]): Promise<SQL[]> {
    return additionalConditions.map((condition) => {
      // @ts-expect-error
      return this.operators[condition.operator](this.table[condition.fieldName], condition.value);
    });
  }
}