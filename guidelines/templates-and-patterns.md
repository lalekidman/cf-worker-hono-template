# Templates and Patterns Reference

This document provides copy-paste templates for implementing the screaming architecture pattern. Use these templates to quickly scaffold new projects or modules.

## File Templates

### 1. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 2. Package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev --port 9004 --inspector-port 9335 --minify",
    "dev:shared": "npm run dev -- --persist-to /tmp/wrangler-shared-state",
    "deploy": "wrangler deploy --minify",
    "deploy:dev": "wrangler deploy --env dev --minify",
    "typegen": "wrangler types --env-interface CloudflareBindings",
    "db:generate": "drizzle-kit generate",
    "db:execute:local": "wrangler d1 execute app-db-local --local",
    "db:execute:dev": "wrangler d1 execute app-db-dev --remote",
    "build": "rm -rf ./dist && tsc -p tsconfig.build.json",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

### 3. Base Entity Template

```typescript
// src/shared/utils/entities/interfaces.ts
export interface IEntityBaseProperties {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  _v: number;
}

export interface IEntityMethodBaseProperties<T> {
  toObject(): T;
  markAsUpdated(): void;
}

export interface IEntityBaseDependencies {
  generateId: () => string;
}
```

```typescript
// src/shared/utils/entities/entity.ts
import { IEntityBaseProperties, IEntityMethodBaseProperties, IEntityBaseDependencies } from './interfaces';

export const makeBaseEntity = (deps: IEntityBaseDependencies) => {
  return class BaseEntity implements IEntityMethodBaseProperties<IEntityBaseProperties> {
    protected _id: string;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    protected _v: number;

    constructor(data?: Partial<IEntityBaseProperties>) {
      this._id = data?.id || deps.generateId();
      this._createdAt = data?.createdAt || new Date();
      this._updatedAt = data?.updatedAt || new Date();
      this._v = data?._v || 0;
    }

    get id(): string { return this._id; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
    get version(): number { return this._v; }

    markAsUpdated(): void {
      this._updatedAt = new Date();
      this._v += 1;
    }

    toObject(): IEntityBaseProperties {
      return {
        id: this._id,
        createdAt: this._createdAt,
        updatedAt: this._updatedAt,
        _v: this._v,
      };
    }
  };
};
```

### 4. Base Repository Template

```typescript
// src/shared/interfaces/base.repository.interface.ts
export interface IBaseRepository<T> {
  insert(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | '_v'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  findMany(options?: {
    limit?: number;
    offset?: number;
    where?: any;
  }): Promise<T[]>;
}
```

```typescript
// src/apps/database/repositories/base.repository.service.ts
import { IBaseRepository } from '@/shared/interfaces/base.repository.interface';
import { DB } from '../index';
import { eq } from 'drizzle-orm';

export abstract class BaseRepositoryService<T extends { id: string }> implements IBaseRepository<T> {
  constructor(
    protected readonly db: DB,
    protected readonly table: any
  ) {}

  async insert(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | '_v'>): Promise<T> {
    const insertData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _v: 0,
    };

    const result = await this.db.insert(this.table).values(insertData).returning();
    return result[0];
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
      _v: (data as any)._v ? (data as any)._v + 1 : 1,
    };

    const result = await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id));

    return result.changes > 0;
  }

  async findMany(options?: {
    limit?: number;
    offset?: number;
    where?: any;
  }): Promise<T[]> {
    let query = this.db.select().from(this.table);

    if (options?.where) {
      query = query.where(options.where);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }
}
```

### 5. Base Service Template

```typescript
// src/shared/utils/services/service.ts
import { IBaseRepository } from '@/shared/interfaces/base.repository.interface';

export abstract class BaseService<T, E> {
  constructor(
    protected readonly EntityClass: new(data?: Partial<T>) => E
  ) {}

  async findById(id: string): Promise<E | null> {
    const data = await this.serviceRepository.findById(id);
    return data ? new this.EntityClass(data) : null;
  }

  async findByIdStrict(id: string): Promise<E> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }

  async deleteById(id: string): Promise<boolean> {
    return await this.serviceRepository.deleteById(id);
  }

  protected isNotEmpty(data: any): boolean {
    return data !== null && data !== undefined && data !== '';
  }

  protected abstract serviceRepository: IBaseRepository<T>;
}
```

### 6. Response Handler Template

```typescript
// src/shared/response-handler/response-handler.ts
import { Context } from 'hono';

export class ResponseHandler {
  static ok(c: Context, data: any, message?: string): Response {
    return c.json({
      success: true,
      data,
      message,
    }, 200);
  }

  static created(c: Context, data: any, message?: string): Response {
    return c.json({
      success: true,
      data,
      message: message || 'Resource created successfully',
    }, 201);
  }

  static badRequest(c: Context, message: string, details?: any): Response {
    return c.json({
      success: false,
      error: message,
      details,
    }, 400);
  }

  static unauthorized(c: Context, message?: string): Response {
    return c.json({
      success: false,
      error: message || 'Unauthorized',
    }, 401);
  }

  static forbidden(c: Context, message?: string): Response {
    return c.json({
      success: false,
      error: message || 'Forbidden',
    }, 403);
  }

  static notFound(c: Context, message?: string): Response {
    return c.json({
      success: false,
      error: message || 'Resource not found',
    }, 404);
  }

  static internalServer(c: Context, message?: string): Response {
    return c.json({
      success: false,
      error: message || 'Internal server error',
    }, 500);
  }
}
```

### 7. Common Validation Schemas

```typescript
// src/shared/validations.ts
import { z } from 'zod';

export const idValidationSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const ResponseBaseSchema = z.object({
  id: z.string(),
  _v: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const QueryBaseValidationSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional().transform(val => val ? val.split(',') : undefined),
  order: z.string().optional().transform(val => val ? val.split(',') : undefined),
  filter: z.string().optional().transform(val => val ? val.split(',') : undefined),
  fields: z.string().optional().transform(val => val ? val.split(',') : undefined),
  include: z.string().optional().transform(val => val ? val.split(',') : undefined),
  exclude: z.string().optional().transform(val => val ? val.split(',') : undefined),
});

export const relayPaginationQueryValidationSchema = QueryBaseValidationSchema.extend({
  first: z.string().optional().transform(val => val ? parseInt(val) : 10),
  after: z.string().optional(),
  last: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  before: z.string().optional(),
});

export type IdInput = z.infer<typeof idValidationSchema>;
export type RelayPaginationQueryInput = z.infer<typeof relayPaginationQueryValidationSchema>;
```

## Module Scaffolding Commands

### Create New Module Script

```bash
#!/bin/bash
# create-module.sh

MODULE_NAME=$1
MODULE_DIR="src/$MODULE_NAME"

if [ -z "$MODULE_NAME" ]; then
  echo "Usage: ./create-module.sh <module-name>"
  exit 1
fi

echo "Creating module: $MODULE_NAME"

# Create directory structure
mkdir -p "$MODULE_DIR/entities"
mkdir -p "$MODULE_DIR/use-cases"
mkdir -p "$MODULE_DIR/controllers"
mkdir -p "$MODULE_DIR/routes"
mkdir -p "$MODULE_DIR/validations"

# Create placeholder files
touch "$MODULE_DIR/entities/interfaces.ts"
touch "$MODULE_DIR/entities/entity.ts"
touch "$MODULE_DIR/entities/index.ts"
touch "$MODULE_DIR/use-cases/interfaces.ts"
touch "$MODULE_DIR/use-cases/service.ts"
touch "$MODULE_DIR/use-cases/index.ts"
touch "$MODULE_DIR/controllers/${MODULE_NAME}.controller.ts"
touch "$MODULE_DIR/routes/${MODULE_NAME}.routes.ts"
touch "$MODULE_DIR/routes/${MODULE_NAME}.tRPC-route.ts"
touch "$MODULE_DIR/validations/${MODULE_NAME}.validation.ts"

# Create database files
mkdir -p "src/apps/database/schemas"
mkdir -p "src/apps/database/repositories"
touch "src/apps/database/schemas/${MODULE_NAME}.schema.ts"
touch "src/apps/database/repositories/${MODULE_NAME}.repository.service.ts"

echo "Module $MODULE_NAME created successfully!"
echo "Next steps:"
echo "1. Implement entity interfaces and class"
echo "2. Create use-case service"
echo "3. Add validation schemas"
echo "4. Implement database schema and repository"
echo "5. Create controllers and routes"
echo "6. Add to service factory"
echo "7. Register routes in main routers"
```

## Environment Configuration

### Wrangler Configuration (`wrangler.toml`)

```toml
name = "your-service-name"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.development]
vars = { ENVIRONMENT = "development" }

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.development.d1_databases]]
binding = "DB"
database_name = "your-service-dev"
database_id = "your-dev-database-id"

[[env.production.d1_databases]]
binding = "DB"
database_name = "your-service-prod"
database_id = "your-prod-database-id"

[[env.development.kv_namespaces]]
binding = "KV_STORE"
id = "your-dev-kv-id"

[[env.production.kv_namespaces]]
binding = "KV_STORE"
id = "your-prod-kv-id"
```

### Drizzle Configuration (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/apps/database/schemas/*.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

## Quick Start Commands

```bash
# Initialize new project
npm init -y
npm install hono @hono/zod-validator @trpc/server drizzle-orm drizzle-kit zod jose

# Install dev dependencies
npm install -D @types/node @cloudflare/workers-types wrangler typescript vitest

# Create initial structure
mkdir -p src/{apps,shared,guidelines}
mkdir -p src/apps/{database,integrations,factories,middleware}
mkdir -p src/shared/{interfaces,utils,response-handler}

# Generate TypeScript types
npm run typegen

# Generate database migrations
npm run db:generate

# Start development
npm run dev
```

This templates document provides all the necessary boilerplate code to quickly implement the screaming architecture pattern in new projects.