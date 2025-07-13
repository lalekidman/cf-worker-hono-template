# Relay Pagination Utility

This utility provides Relay-spec cursor-based pagination for Drizzle ORM queries in the Cloudflare Workers environment.

## Features

- **Cursor-based pagination**: Forward and backward pagination using cursors
- **Relay specification compliance**: Follows GraphQL Relay connection specification
- **Drizzle ORM integration**: Works seamlessly with existing Drizzle queries
- **TypeScript support**: Full type safety and inference
- **Flexible cursor fields**: Use any sortable field as cursor (defaults to `createdAt`)
- **Total count support**: Optional total count for UI pagination displays

## Basic Usage

### 1. Import the utility

```typescript
import { RelayPagination, RelayPaginationArgs } from '@/utils/pagination';
```

### 2. Create pagination instance

```typescript
const db = createDB(env.DB);
const pagination = new RelayPagination(db, {
  cursorField: 'createdAt',    // Field to use for cursor-based ordering
  defaultLimit: 20,            // Default number of items per page
  maxLimit: 100,              // Maximum items per page
  includeTotalCount: true      // Include total count in response
});
```

### 3. Use in service methods

```typescript
async listCommunities(
  paginationArgs: RelayPaginationArgs,
  filters: CommunityFilters = {}
): Promise<Connection<Community>> {
  // Build where conditions
  const conditions: SQL[] = [];
  
  if (filters.name) {
    conditions.push(like(communities.name, `%${filters.name}%`));
  }
  
  if (filters.ownerId) {
    conditions.push(eq(communities.ownerId, filters.ownerId));
  }

  return pagination.paginate<Community>(
    communities,      // Drizzle table
    paginationArgs,   // Pagination arguments
    {},              // Options (optional)
    conditions       // WHERE conditions (optional)
  );
}
```

### 4. Use in controllers

```typescript
async listRelay(c: Context) {
  const query = c.req.query();
  
  // Parse relay pagination arguments
  const paginationArgs: RelayPaginationArgs = {};
  if (query.first) paginationArgs.first = parseInt(query.first, 10);
  if (query.after) paginationArgs.after = query.after;
  if (query.last) paginationArgs.last = parseInt(query.last, 10);
  if (query.before) paginationArgs.before = query.before;

  const connection = await this.service.listCommunities(paginationArgs, filters);
  
  return ResponseHandler.relay(c, connection);
}
```

## API Reference

### RelayPaginationArgs

```typescript
interface RelayPaginationArgs {
  first?: number;    // Forward pagination: number of items to fetch
  after?: string;    // Forward pagination: cursor to start after
  last?: number;     // Backward pagination: number of items to fetch
  before?: string;   // Backward pagination: cursor to start before
}
```

### RelayPaginationOptions

```typescript
interface RelayPaginationOptions {
  cursorField?: string;        // Field to use for cursor (default: 'createdAt')
  maxLimit?: number;          // Maximum items per page (default: 100)
  defaultLimit?: number;      // Default items per page (default: 20)
  includeTotalCount?: boolean; // Include total count (default: false)
}
```

### Connection Response

```typescript
interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount?: number;
}

interface Edge<T> {
  node: T;           // The actual data item
  cursor: string;    // Base64 encoded cursor for this item
}

interface PageInfo {
  hasNextPage: boolean;      // Whether more items exist forward
  hasPreviousPage: boolean;  // Whether more items exist backward
  startCursor: string | null; // First cursor in current page
  endCursor: string | null;   // Last cursor in current page
}
```

## URL Query Parameters

### Forward Pagination
```
GET /communities/relay?first=10&after=eyJmaWVsZCI6ImNyZWF0ZWRBdCIsInZhbHVlIjoxNjkwODAwMDAwLCJpZCI6ImNvbW0xMjMifQ==
```

### Backward Pagination
```
GET /communities/relay?last=10&before=eyJmaWVsZCI6ImNyZWF0ZWRBdCIsInZhbHVlIjoxNjkwODAwMDAwLCJpZCI6ImNvbW0xMjMifQ==
```

### First Page
```
GET /communities/relay?first=10
```

## Example Response

```json
{
  "edges": [
    {
      "node": {
        "id": "comm123",
        "name": "My Community",
        "description": "A great community",
        "createdAt": "2023-07-30T12:00:00.000Z",
        "updatedAt": "2023-07-30T12:00:00.000Z",
        "_v": 0
      },
      "cursor": "eyJmaWVsZCI6ImNyZWF0ZWRBdCIsInZhbHVlIjoxNjkwODAwMDAwLCJpZCI6ImNvbW0xMjMifQ=="
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "eyJmaWVsZCI6ImNyZWF0ZWRBdCIsInZhbHVlIjoxNjkwODAwMDAwLCJpZCI6ImNvbW0xMjMifQ==",
    "endCursor": "eyJmaWVsZCI6ImNyZWF0ZWRBdCIsInZhbHVlIjoxNjkwODAwMDAwLCJpZCI6ImNvbW0xMjMifQ=="
  },
  "totalCount": 150
}
```

## Static Helper Methods

### Quick pagination without instantiation

```typescript
import { RelayPagination } from '@/utils/pagination';

const connection = await RelayPagination.paginate<Community>(
  db,
  communities,
  paginationArgs,
  { includeTotalCount: true },
  conditions
);
```

## Cursor Format

Cursors are base64-encoded JSON objects containing:

```typescript
{
  field: "createdAt",           // The cursor field name
  value: 1690800000,           // The field value (timestamp as number)
  id: "comm123"                // The record ID for uniqueness
}
```

## Integration with Existing Code

The relay pagination utility is designed to work alongside existing offset-based pagination. You can:

1. **Keep existing endpoints**: Current `/communities` endpoint with page/limit parameters
2. **Add new relay endpoints**: New `/communities/relay` endpoint with cursor parameters
3. **Use ResponseHandler.relay()**: New response method for relay connections
4. **Maintain type safety**: Full TypeScript support throughout

## Error Handling

The utility includes comprehensive validation:

- Cannot specify both `first` and `last`
- Cannot specify both `after` and `before`
- Limits must be positive integers
- Cursors must be valid base64 encoded JSON
- Automatic handling of invalid cursors

## Performance Considerations

- Uses efficient cursor-based queries with proper indexing
- Fetches one extra record to determine `hasNextPage`/`hasPreviousPage`
- Optional total count to avoid expensive counting queries
- Works well with Cloudflare D1's SQLite backend

## Best Practices

1. **Use meaningful cursor fields**: Choose fields with good distribution and ordering
2. **Set reasonable limits**: Prevent excessive data transfer with `maxLimit`
3. **Handle edge cases**: Empty results, invalid cursors, etc.
4. **Cache cursors**: Client should store cursors for pagination
5. **Index cursor fields**: Ensure database has proper indexes for performance