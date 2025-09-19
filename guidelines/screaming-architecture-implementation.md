# Screaming Architecture Implementation Guide

This guide provides a complete implementation pattern for **Screaming Architecture** in Cloudflare Workers projects using Hono, tRPC, Drizzle ORM, and TypeScript. Use this guide to set up similar architecture in new projects.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Infrastructure Setup](#core-infrastructure-setup)
4. [Module Implementation Pattern](#module-implementation-pattern)
5. [API Integration Patterns](#api-integration-patterns)
6. [Database Layer Implementation](#database-layer-implementation)
7. [Service Factory Pattern](#service-factory-pattern)
8. [Authentication & Middleware](#authentication--middleware)
9. [Project Setup Checklist](#project-setup-checklist)
10. [Migration Guide](#migration-guide)

## Architecture Overview

**Screaming Architecture** makes the business intent immediately visible through folder structure. Domain concepts are the primary organizational principle, not technical concerns.

### Core Principles

1. **Domain-First Organization**: Folders named after business domains (`instance-management`, `collaboration`, `token-sharing`)
2. **Technical Concerns Separated**: Infrastructure in `apps/`, shared utilities in `shared/`
3. **Self-Documenting Structure**: Purpose clear from folder names
4. **Boundary-Driven**: Each module is self-contained with clear interfaces

### Benefits

- **Immediate Domain Understanding**: New developers understand business domains instantly
- **Scalable Module Boundaries**: Easy to split modules into microservices later
- **Reduced Coupling**: Clear separation between business logic and infrastructure
- **Team Autonomy**: Teams can own entire vertical slices

## Project Structure

```
src/
├── app.ts                      # Main application entry point
├── index.ts                    # Worker entry point
├── exports.ts                  # Public API exports
├── trpc-router.ts              # tRPC router (root level)
├── rest-router.ts              # REST router (root level)
│
├── {domain-module}/            # BUSINESS DOMAIN MODULES
│   ├── entities/              # Domain entities & business logic
│   │   ├── interfaces.ts      # Type definitions
│   │   ├── entity.ts         # Entity implementation
│   │   └── index.ts          # Exports
│   ├── use-cases/            # Business logic & services
│   │   ├── interfaces.ts     # Service contracts
│   │   ├── service.ts       # Business logic implementation
│   │   └── index.ts         # Exports
│   ├── controllers/          # HTTP request handlers
│   │   └── {module}.controller.ts
│   ├── routes/              # API route definitions
│   │   ├── {module}.routes.ts      # REST routes
│   │   └── {module}.tRPC-route.ts  # tRPC routes
│   └── validations/         # Input validation schemas
│       └── {module}.validation.ts
│
├── apps/                      # INFRASTRUCTURE LAYER
│   ├── database/             # Database infrastructure
│   │   ├── index.ts         # DB connection & setup
│   │   ├── schemas/         # Drizzle table schemas
│   │   │   └── {module}.schema.ts
│   │   └── repositories/    # Data access implementations
│   │       └── {module}.repository.service.ts
│   ├── durable-objects/     # Cloudflare Durable Objects
│   ├── factories/           # Dependency injection factories
│   │   ├── service.factory.ts
│   │   └── kv-repository.factory.ts
│   ├── integrations/        # External service integrations
│   │   ├── auth/           # Authentication integration
│   │   ├── trpc/           # tRPC core setup
│   │   └── cloudflare/     # Cloudflare APIs
│   ├── kv/                 # KV store operations
│   └── middleware/         # Cross-cutting concerns
│       ├── auth.ts
│       ├── cors.ts
│       └── logging.ts
│
└── shared/                   # SHARED UTILITIES
    ├── interfaces/          # Common interfaces
    ├── response-handler/    # Standardized API responses
    ├── utils/              # Utility functions
    │   ├── entities/       # Base entity patterns
    │   ├── pagination/     # Relay-spec pagination
    │   └── services/       # Base service classes
    └── validations.ts      # Common validation schemas
```

## Core Infrastructure Setup

### 1. Main Application Setup (`src/app.ts`)

```typescript
import { Hono } from 'hono';
import { corsMiddleware } from '@/apps/middleware/cors';
import { loggingMiddleware } from '@/apps/middleware/logging';
import { createTRPCHandler } from './trpc-router';
import { createRESTRouter } from './rest-router';
import packageJson from '../package.json';

const app = new Hono<{ Bindings: CloudflareBindings }>();

console.log(`[SERVICE] Initializing ${packageJson.name} v${packageJson.version}`);

// Global middleware
app.use('*', loggingMiddleware);
app.use('*', corsMiddleware);

// Health endpoints
app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/version", (c) => {
  return c.json({
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  });
});

// API routes
app.all('/trpc/*', createTRPCHandler());
app.route('/', createRESTRouter());

export default app;
```

### 2. tRPC Core Setup (`src/apps/integrations/trpc/trpc.ts`)

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from 'hono';
import { handleUserAuth, handleAdminAuth } from '@/apps/integrations/auth/auth';
import { createDB } from '@/apps/database';

export interface TRPCContext {
  c: Context<{ Bindings: Env; Variables: Variables }>;
  user?: any;
  admin?: any;
  db?: any;
}

export const createTRPCContext = async (c: Context): Promise<TRPCContext> => {
  let user = null;
  let admin = null;

  try {
    if (c.req.header("Authorization")?.startsWith("Bearer ")) {
      user = await handleUserAuth(c);
      c.set("user", user);
    }
  } catch (error) {
    console.warn("tRPC auth context error:", error);
  }

  return {
    c,
    user,
    admin,
    db: createDB(c.env.DB)
  };
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
```

### 3. Root-Level API Routers

#### tRPC Router (`src/trpc-router.ts`)
```typescript
import { createTRPCContext, router } from '@/apps/integrations/trpc/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Context } from 'hono';

// Import module routers
import { instanceRouter } from '@/instance-management/routes/instance.tRPC-route';
import { collaborationRouter } from '@/collaboration/routes/collaboration.tRPC-route';

export const appRouter = router({
  instance: instanceRouter,
  collaboration: collaborationRouter,
  // Add new modules here
});

export type AppRouter = typeof appRouter;

export function createTRPCHandler() {
  return async (c: Context) => {
    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext: () => createTRPCContext(c),
      onError: ({ error, path }) => {
        console.error(`tRPC Error on ${path}:`, JSON.stringify(error, null, 2));
      },
    });
    return response;
  };
}
```

#### REST Router (`src/rest-router.ts`)
```typescript
import { Hono } from 'hono';
import { createInstanceRoutes } from '@/instance-management/routes/instance.routes';

export function createRESTRouter() {
  const app = new Hono<{ Bindings: CloudflareBindings }>();

  // Module routes
  app.route('/instances', createInstanceRoutes());
  // Add new module routes here

  return app;
}

export type RESTRouter = ReturnType<typeof createRESTRouter>;
```

## Module Implementation Pattern

### 1. Entity Layer

#### Interfaces (`src/{module}/entities/interfaces.ts`)
```typescript
import { IEntityBaseProperties, IEntityMethodBaseProperties } from "@/shared/utils/entities";

export interface I{ModuleName} extends IEntityBaseProperties {
  name: string;
  description?: string;
  // Add module-specific properties
}

export interface I{ModuleName}Entity extends IEntityMethodBaseProperties<I{ModuleName}> {
  // Add module-specific methods
  updateName(name: string): void;
  isActive(): boolean;
}
```

#### Entity Implementation (`src/{module}/entities/entity.ts`)
```typescript
import { I{ModuleName}, I{ModuleName}Entity } from "./interfaces";
import { IEntityBaseDependencies, makeBaseEntity } from "@/shared/utils/entities";

export const make{ModuleName}Entity = (
  deps: IEntityBaseDependencies
): new(data?: Partial<I{ModuleName}>) => I{ModuleName}Entity => (
  class extends makeBaseEntity(deps) implements I{ModuleName}Entity {
    private _name: string = '';
    private _description?: string;

    constructor(data?: Partial<I{ModuleName}>) {
      super(data);
      if (data) {
        this._name = data.name || '';
        this._description = data.description;
      }
    }

    get name(): string { return this._name; }
    set name(value: string) { this._name = value; this.markAsUpdated(); }

    get description(): string | undefined { return this._description; }
    set description(value: string | undefined) { this._description = value; this.markAsUpdated(); }

    updateName(name: string): void {
      this.name = name;
    }

    isActive(): boolean {
      return this.name.length > 0;
    }

    toObject(): I{ModuleName} {
      return {
        ...super.toObject(),
        name: this._name,
        description: this._description,
      };
    }
  }
);
```

### 2. Use Cases (Service) Layer

#### Service Interfaces (`src/{module}/use-cases/interfaces.ts`)
```typescript
import { IBaseRepository } from "@/shared/interfaces/base.repository.interface";
import { I{ModuleName} } from '../entities/interfaces';

export interface I{ModuleName}Input extends Pick<I{ModuleName}, 'name' | 'description'> {
  // Add input-specific properties
}

export interface I{ModuleName}RepositoryService extends IBaseRepository<I{ModuleName}> {
  findByName(name: string): Promise<I{ModuleName} | null>;
  // Add module-specific repository methods
}
```

#### Service Implementation (`src/{module}/use-cases/service.ts`)
```typescript
import { I{ModuleName}, I{ModuleName}Entity } from "../entities";
import { BaseService } from "@/shared/utils/services/service";
import { I{ModuleName}Input, I{ModuleName}RepositoryService } from "./interfaces";
import { make{ModuleName}Entity } from "../entities/entity";

export class {ModuleName}Service extends BaseService<I{ModuleName}, I{ModuleName}Entity> {
  constructor(
    protected readonly serviceRepository: I{ModuleName}RepositoryService,
  ) {
    super(make{ModuleName}Entity({ generateId: () => crypto.randomUUID() }));
  }

  async create(input: I{ModuleName}Input): Promise<I{ModuleName}Entity> {
    const entity = new this.EntityClass(input);
    const saved = await this.serviceRepository.insert(entity.toObject());
    return new this.EntityClass(saved);
  }

  async findByName(name: string): Promise<I{ModuleName}Entity | null> {
    const data = await this.serviceRepository.findByName(name);
    return data ? new this.EntityClass(data) : null;
  }
}
```

### 3. Database Layer

#### Schema (`src/apps/database/schemas/{module}.schema.ts`)
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const {module}Table = sqliteTable('{modules}', {
  // Base entity properties (required)
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  _v: integer('version').notNull().default(0),
  
  // Module-specific columns
  name: text('name').notNull(),
  description: text('description'),
});

export type {ModuleName} = typeof {module}Table.$inferSelect;
export type Insert{ModuleName} = typeof {module}Table.$inferInsert;
```

#### Repository (`src/apps/database/repositories/{module}.repository.service.ts`)
```typescript
import { BaseRepositoryService } from "./base.repository.service";
import { I{ModuleName} } from '@/{module-name}/entities/interfaces';
import { I{ModuleName}RepositoryService } from '@/{module-name}/use-cases/interfaces';
import { DB } from '../index';
import { {module}Table } from "../schemas/{module}.schema";
import { eq } from 'drizzle-orm';

export class {ModuleName}RepositoryService extends BaseRepositoryService<I{ModuleName}> implements I{ModuleName}RepositoryService {
  constructor(db: DB) {
    super(db, {module}Table);
  }

  async findByName(name: string): Promise<I{ModuleName} | null> {
    const result = await this.db
      .select()
      .from({module}Table)
      .where(eq({module}Table.name, name))
      .limit(1);
    
    return result[0] || null;
  }
}
```

## API Integration Patterns

### 1. tRPC Route Pattern

```typescript
import { router, publicProcedure, protectedProcedure } from '@/apps/integrations/trpc/trpc';
import { z } from 'zod';
import { ServiceFactory } from '@/apps/factories/service.factory';
import { {module}InsertDataSchema, {module}IdSchema } from '../validations/{module}.validation';

export const {module}Router = router({
  create: protectedProcedure
    .input({module}InsertDataSchema)
    .mutation(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      const entity = await service.create(input);
      return entity.toObject();
    }),

  get: publicProcedure
    .input({module}IdSchema)
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      const entity = await service.findById(input.id);
      if (!entity) throw new Error('{ModuleName} not found');
      return entity.toObject();
    }),
});
```

### 2. REST Route Pattern

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { {ModuleName}Controller } from "../controllers/{module}.controller";
import { {module}InsertDataSchema, {module}IdSchema } from "../validations/{module}.validation";

export function create{ModuleName}Routes() {
  const app = new Hono();

  app.post(
    "/",
    zValidator("json", {module}InsertDataSchema),
    (c) => {
      const controller = new {ModuleName}Controller(c);
      return controller.create(c);
    }
  );

  app.get(
    "/:id",
    zValidator("param", {module}IdSchema),
    (c) => {
      const controller = new {ModuleName}Controller(c);
      return controller.findById(c);
    }
  );

  return app;
}
```

## Service Factory Pattern

```typescript
import { Context } from "hono";
import { createDB, DB } from "@/apps/database";

// Import services
import { {ModuleName}Service } from "@/{module-name}/use-cases/service";
import { {ModuleName}RepositoryService } from "@/apps/database/repositories/{module}.repository.service";

export class ServiceFactory {
  private db: DB;
  private _{module}Service: {ModuleName}Service | null = null;

  constructor(c: Context) {
    this.db = createDB(c.env.DB);
  }

  make{ModuleName}Service(): {ModuleName}Service {
    if (!this._{module}Service) {
      const repository = new {ModuleName}RepositoryService(this.db);
      this._{module}Service = new {ModuleName}Service(repository);
    }
    return this._{module}Service;
  }
}
```

## Project Setup Checklist

### ✅ **Initial Project Structure**
- [ ] Create `src/apps/` for infrastructure
- [ ] Create `src/shared/` for utilities
- [ ] Create module directories for business domains
- [ ] Set up root-level API routers

### ✅ **Infrastructure Layer**
- [ ] Set up database connection in `src/apps/database/`
- [ ] Create base repository and service classes
- [ ] Set up tRPC core in `src/apps/integrations/trpc/`
- [ ] Configure middleware in `src/apps/middleware/`
- [ ] Create service factory in `src/apps/factories/`

### ✅ **Shared Utilities**
- [ ] Create base entity patterns in `src/shared/utils/entities/`
- [ ] Set up pagination utilities in `src/shared/utils/pagination/`
- [ ] Create response handler in `src/shared/response-handler/`
- [ ] Define common validation schemas in `src/shared/validations.ts`

### ✅ **Module Template**
- [ ] Create entity layer template
- [ ] Create use-cases layer template
- [ ] Create controller template
- [ ] Create route templates (REST + tRPC)
- [ ] Create validation template

### ✅ **Integration Points**
- [ ] Set up main app.ts with middleware and routers
- [ ] Configure exports.ts for public API
- [ ] Set up TypeScript path mapping
- [ ] Configure build and deployment scripts

## Migration Guide

### From Traditional Layered Architecture

1. **Identify Business Domains**: Group related features into domain modules
2. **Extract Infrastructure**: Move technical concerns to `apps/`
3. **Consolidate Utilities**: Move shared code to `shared/`
4. **Refactor Routes**: Separate REST and tRPC, move to module folders
5. **Update Imports**: Use domain-based imports instead of layer-based

### From Monolithic Structure

1. **Start with One Module**: Pick a bounded context and implement the pattern
2. **Gradually Extract**: Move related features into the module structure
3. **Establish Boundaries**: Define clear interfaces between modules
4. **Refactor Infrastructure**: Centralize technical concerns in `apps/`

### Key Migration Principles

- **Incremental Changes**: Migrate one module at a time
- **Maintain Compatibility**: Keep existing APIs working during migration
- **Test Coverage**: Ensure good test coverage before and after migration
- **Team Alignment**: Ensure team understands new patterns before migration

## Best Practices

1. **Domain Naming**: Use business language, not technical terms
2. **Module Boundaries**: Each module should be independently deployable
3. **Dependency Direction**: Dependencies should flow inward (domain ← apps)
4. **Interface Segregation**: Keep module interfaces focused and minimal
5. **Testing Strategy**: Test modules in isolation with mocked dependencies

## Conclusion

This screaming architecture implementation provides:

- **Clear Domain Boundaries**: Business logic separated from infrastructure
- **Scalable Structure**: Easy to add new modules or split existing ones
- **Developer Experience**: Immediate understanding of business domains
- **Maintainability**: Changes isolated within module boundaries
- **Team Autonomy**: Teams can own complete vertical slices

Use this guide as a template for implementing screaming architecture in new Cloudflare Workers projects or migrating existing ones.