/**
 * Relay pagination interfaces following GraphQL Relay specification
 */

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount?: number;
}

export interface RelayPaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  orderBy?: 'asc' | 'desc';
}

export interface CursorFieldData {
  field: string;
  value: any;
  isDate: boolean;
}

export interface CursorData {
  fields: CursorFieldData[];
  id: string;
}

// Legacy interface for backward compatibility
export interface LegacyCursorData {
  field: string;
  value: any;
  id: string;
  isDate: boolean;
}

export interface RelayPaginationOptions {
  cursorField?: string | string[];
  maxLimit?: number;
  defaultLimit?: number;
  includeTotalCount?: boolean;
}

export interface RelayPaginationResult<T> {
  data: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
  totalCount?: number;
}

export interface DrizzleColumn {
  name: string;
  dataType: string;
  notNull: boolean;
  hasDefault: boolean;
  enumValues?: string[];
  primary?: boolean;
}

export interface DrizzleTableLike {
  [key: string]: DrizzleColumn;
}

export interface AdditionalConditions<T = any> {
  fieldName: keyof T;
  value: any;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'nlike' | 'ilike' | 'nilike' | 'is' | 'isNot' | 'isNotNull' | 'isNull';
}