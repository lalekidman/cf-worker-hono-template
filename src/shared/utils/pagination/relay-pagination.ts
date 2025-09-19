import { SQL, and, or, gt, lt, eq, desc, asc } from 'drizzle-orm';
import { DB } from '@/apps/database';
import { 
  RelayPaginationArgs, 
  RelayPaginationOptions,
  Connection,
  PageInfo,
  Edge
} from './interfaces';
import { validateCursor, createEdge } from './cursor';

export class RelayPagination {
  private defaultOptions: Required<RelayPaginationOptions> = {
    cursorField: 'createdAt',
    maxLimit: 100,
    defaultLimit: 20,
    includeTotalCount: false
  };

  constructor(
    private readonly db: DB,
    private readonly table: any,
    options: RelayPaginationOptions = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Apply relay pagination to a Drizzle query
   */
  async paginate<T extends Record<string, any>>(
    paginationArgs: RelayPaginationArgs,
    options: RelayPaginationOptions = {},
    whereConditions: SQL[] = []
  ): Promise<Connection<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const { first, after, last, before } = paginationArgs;
    
    // Validate pagination arguments
    this.validatePaginationArgs(paginationArgs);
    
    // Determine pagination direction and limit
    const isForward = first !== undefined || after !== undefined;
    const limit = this.getLimit(first, last, opts.maxLimit, opts.defaultLimit);
    
    // Build query conditions
    const conditions = this.buildCursorConditions(
      paginationArgs,
      whereConditions
    );
    
    // Build order clause
    const orderClause = this.buildOrderClause(opts.cursorField, isForward);
    
    // Execute query with one extra record to check for more pages
    const queryLimit = limit + 1;
    
    // Build and execute query
    const results = await this.executeQuery(conditions, orderClause, queryLimit);
    
    // Check if there are more results
    const hasMore = results.length > limit;
    if (hasMore) {
      results.pop(); // Remove the extra record
    }
    
    // Reverse results if querying backward
    if (!isForward) {
      results.reverse();
    }
    
    // Get total count if requested
    let totalCount: number | undefined;
    if (opts.includeTotalCount) {
      totalCount = await this.getTotalCount(whereConditions);
    }
    
    // Build edges
    const edges: Edge<T>[] = results.map(entity => 
      createEdge(entity, opts.cursorField)
    );
    
    // Build page info
    const pageInfo = this.buildPageInfo(
      edges,
      paginationArgs,
      hasMore,
      isForward
    );
    
    return {
      ...(totalCount !== undefined && { totalCount }),
      pageInfo,
      edges,
    };
  }

  /**
   * Execute the pagination query
   */
  private async executeQuery(
    conditions: SQL[],
    orderClause: any[],
    limit: number
  ): Promise<any[]> {
    let query = this.db.select().from(this.table);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    return await query
      .orderBy(...orderClause)
      .limit(limit);
  }

  /**
   * Validate pagination arguments
   */
  private validatePaginationArgs(args: RelayPaginationArgs): void {
    const { first, after, last, before } = args;
    
    if (first !== undefined && last !== undefined) {
      throw new Error('Cannot specify both first and last');
    }
    
    if (first !== undefined && first <= 0) {
      throw new Error('first must be a positive integer');
    }
    
    if (last !== undefined && last <= 0) {
      throw new Error('last must be a positive integer');
    }
    
    if (after !== undefined && before !== undefined) {
      throw new Error('Cannot specify both after and before');
    }
  }

  /**
   * Get the limit for the query
   */
  private getLimit(
    first: number | undefined,
    last: number | undefined,
    maxLimit: number,
    defaultLimit: number
  ): number {
    const requestedLimit = first || last || defaultLimit;
    return Math.min(requestedLimit, maxLimit);
  }

  /**
   * Build cursor-based where conditions
   */
  private buildCursorConditions(
    options: RelayPaginationArgs,
    additionalConditions: SQL[] = []
  ): SQL[] {
    const {
      after,
      before,
      orderBy = 'asc',
    } = options;
    const conditions: SQL[] = [...additionalConditions];
    const cursor = after || before;
    if (cursor) {
      const cursorData = validateCursor(cursor);
      if (cursorData) {
        const cursorCondition = this.buildMultiFieldCursorCondition(cursorData, orderBy, !!after);
        conditions.push(cursorCondition);
      }
    }
    
    return conditions;
  }

  /**
   * Build order clause for the query
   */
  private buildOrderClause(
    cursorField: string | string[],
    isForward: boolean
  ) {
    const cursorFields = Array.isArray(cursorField) ? cursorField : [cursorField];
    const idColumn = this.table.id;
    
    const orderColumns = cursorFields.map(field => {
      const column = this.table[field];
      return isForward ? asc(column) : desc(column);
    });
    
    // Always add id as the final sort field
    orderColumns.push(isForward ? asc(idColumn) : desc(idColumn));
    
    return orderColumns;
  }

  /**
   * Build multi-field cursor condition
   */
  private buildMultiFieldCursorCondition(
    cursor: any,
    orderBy: 'asc' | 'desc',
    isAfter: boolean
  ): SQL {
    const table = this.table;
    const fields = cursor.fields;
    const isAsc = orderBy === 'asc';
    // Build lexicographic comparison for multiple fields
    const buildConditions = (fieldIndex: number): SQL => {
      if (fieldIndex >= fields.length) {
        // Final comparison with id
        const idComparison = isAfter
          ? (isAsc ? gt(table.id, cursor.id) : lt(table.id, cursor.id))
          : (isAsc ? lt(table.id, cursor.id) : gt(table.id, cursor.id));
        return idComparison;
      }
      
      const field = fields[fieldIndex];
      const column = table[field.field];
      const value = field.value;
      
      const greaterThan = isAfter
        ? (isAsc ? gt(column, value) : lt(column, value))
        : (isAsc ? lt(column, value) : gt(column, value));
      
      const equalAndNext = and(
        eq(column, value),
        buildConditions(fieldIndex + 1)
      );
      
      return or(greaterThan, equalAndNext)!;
    };
    
    return buildConditions(0);
  }

  /**
   * Get total count for the query
   */
  private async getTotalCount(whereConditions: SQL[]): Promise<number> {
    let countQuery = this.db.select({
      count: this.table.id
    }).from(this.table);
    
    if (whereConditions.length > 0) {
      countQuery.where(and(...whereConditions));
    }
    
    const result = await countQuery;
    return result.length;
  }

  /**
   * Build page info object
   */
  private buildPageInfo(
    edges: Edge<any>[],
    paginationArgs: RelayPaginationArgs,
    hasMore: boolean,
    isForward: boolean
  ): PageInfo {
    const { after, before } = paginationArgs;
    
    return {
      hasNextPage: isForward ? hasMore : !!before,
      hasPreviousPage: isForward ? !!after : hasMore,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
    };
  }

  /**
   * Static helper method to create a relay pagination instance
   */
  static create(db: DB, options: RelayPaginationOptions = {}): RelayPagination {
    return new RelayPagination(db, options);
  }

  /**
   * Static helper method to paginate with a single call
   */
  static async paginate<T extends Record<string, any>>(
    db: DB,
    table: any,
    paginationArgs: RelayPaginationArgs,
    options: RelayPaginationOptions = {},
    whereConditions: SQL[] = []
  ): Promise<Connection<T>> {
    const pagination = new RelayPagination(db, table, options);
    return pagination.paginate<T>(paginationArgs, options, whereConditions);
  }
}