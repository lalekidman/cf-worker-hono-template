# Module Creation Guidelines

This guide provides step-by-step instructions for creating new modules in the app-instance-service, following the established screaming architecture patterns.

## Overview

When creating a new module, follow these steps to maintain consistency with the existing architecture:

1. **Entity-First Development**: Always start by creating the entity layer
2. **Service Layer**: Implement business logic and repository interfaces
3. **Database Layer**: Create schemas and repository implementations
4. **Controller Layer**: Handle HTTP requests and responses
5. **Routes Layer**: Define API endpoints with validation

## 1. Entity Layer Guidelines

### File Structure
Create the following files for each new module:
```
src/{module-name}/
├── entities/
│   ├── interfaces.ts    # Base and entity interfaces
│   ├── entity.ts       # Entity class implementation
│   └── index.ts        # Exports
```

### Interface Creation
Create two interfaces in `interfaces.ts`:

**Base Interface**: Extends `IEntityBaseProperties`
```typescript
import { IEntityBaseProperties, IEntityMethodBaseProperties } from "@/shared/utils/entities";

export interface I{ModuleName} extends IEntityBaseProperties {
  // Add module-specific properties here
}
```

**Entity Interface**: Extends `IEntityMethodBaseProperties<T>`
```typescript
export interface I{ModuleName}Entity extends IEntityMethodBaseProperties<I{ModuleName}> {
  // Add module-specific methods here
}
```

### Entity Class Implementation
Use the factory pattern in `entity.ts`:
```typescript
import { I{ModuleName}, I{ModuleName}Entity } from "./interfaces";
import { IEntityBaseDependencies, makeBaseEntity } from "@/shared/utils/entities";

export const make{ModuleName}Entity = (
  deps: IEntityBaseDependencies
): new(data?: Partial<I{ModuleName}>) => I{ModuleName}Entity => (
  class extends makeBaseEntity(deps) implements I{ModuleName}Entity {
    // Private properties with underscore prefix
    // Getters and setters
    // Business logic methods
    // Override toObject() method
  }
);
```

### Reference Implementation
See `src/instance-management/entities/` for a complete example following these patterns.

## 2. Use Cases (Service) Layer Guidelines

### Service Structure
Create services in `src/{module-name}/use-cases/` with the following files:
```
src/{module-name}/use-cases/
├── interfaces.ts    # Repository interface and input types
├── service.ts      # Service class implementation
└── index.ts        # Exports
```

### Repository Interface
Define repository interfaces in `interfaces.ts` that extend `IBaseRepository`:

```typescript
import { IBaseRepository } from "@/shared/interfaces/base.repository.interface";
import { I{ModuleName} } from '../entities/interfaces';

export interface I{ModuleName}Input extends Pick<I{ModuleName}, 
  // Select relevant properties for input
  > {
    // Add optional properties if needed
  }

export interface I{ModuleName}RepositoryService extends IBaseRepository<I{ModuleName}> {
  // Add module-specific repository methods
}
```

### Service Class Implementation
Services must extend `BaseService` and inject the repository:

```typescript
import { I{ModuleName}, I{ModuleName}Entity, {ModuleName}Entity } from "../entities";
import { BaseService } from "@/shared/utils/services/service";
import { I{ModuleName}Input, I{ModuleName}RepositoryService } from "./interfaces";

export class {ModuleName}Service extends BaseService<I{ModuleName}, I{ModuleName}Entity> {
  constructor(
    protected readonly serviceRepository: I{ModuleName}RepositoryService,
  ) {
    super({ModuleName}Entity);
  }

  // Implement module-specific methods
}
```

### Service Benefits
The `BaseService` provides common operations:
- `findById(id: string)`: Find entity by ID
- `findByIdStrict(id: string)`: Find by ID or throw error
- `deleteById(id: string)`: Delete entity by ID
- `isNotEmpty(data)`: Helper for validation

### Reference Implementation
See `src/instance-management/use-cases/` for a complete example following these patterns.

## 3. Database Layer Guidelines

### Database Structure
Create database components in the following locations:
```
src/apps/database/
├── schemas/
│   └── {module}.schema.ts     # Drizzle schema definition
└── repositories/
    └── {module}.repository.service.ts  # Repository implementation
```

### Schema Definition
Define Drizzle schemas in `src/apps/database/schemas/{module}.schema.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const {module}Table = sqliteTable('{modules}', {
  // Base entity properties (required)
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  _v: integer('version').notNull().default(0),
  
  // Module-specific columns
  // Add your entity properties here
});

export type {ModuleName} = typeof {module}Table.$inferSelect;
export type Insert{ModuleName} = typeof {module}Table.$inferInsert;
```

### Repository Service Implementation
Create repository services in `src/apps/database/repositories/{module}.repository.service.ts`:

```typescript
import { BaseRepositoryService } from "./base.repository.service";
import { I{ModuleName} } from '@/src/{module-name}/entities/interfaces';
import { I{ModuleName}RepositoryService } from '@/src/{module-name}/use-cases/interfaces';
import { DB } from '../index';
import { {module}Table } from "../schemas";

export class {ModuleName}RepositoryService extends BaseRepositoryService<I{ModuleName}> implements I{ModuleName}RepositoryService {
  constructor(db: DB) {
    super(db, {module}Table);
  }

  // Implement module-specific repository methods
}
```

### Reference Implementation
See `src/apps/database/schemas/instances.schema.ts` and `src/apps/database/repositories/instances.repository.service.ts` for complete examples.

## 4. Controller Layer Guidelines

### Controller Implementation
Create controllers in `src/{module-name}/controllers/{module}.controller.ts`:

```typescript
import { Context } from "hono";
import { {ModuleName}Service } from "../use-cases/service";
import { ResponseHandler } from "@/shared/response-handler";

export class {ModuleName}Controller {
  constructor(private readonly {module}Service: {ModuleName}Service) {}

  create = async (c: Context): Promise<Response> => {
    try {
      const body = await c.req.json();
      const entity = await this.{module}Service.create(body);
      return ResponseHandler.created(c, entity.toObject());
    } catch (error) {
      console.error("Failed to create {module}:", error);
      if (error instanceof Error) {
        return ResponseHandler.badRequest(c, "Failed to create {module}", error.message);
      }
      return ResponseHandler.internalServer(c, "Failed to create {module}");
    }
  };

  findById = async (c: Context): Promise<Response> => {
    try {
      const { id } = c.req.param();
      const entity = await this.{module}Service.findById(id);
      
      if (!entity) {
        return ResponseHandler.notFound(c, "{ModuleName} not found");
      }
      
      return ResponseHandler.ok(c, entity.toObject());
    } catch (error) {
      console.error("Failed to fetch {module}:", error);
      return ResponseHandler.internalServer(c, "Failed to fetch {module}");
    }
  };

  // Add more CRUD methods as needed
}
```

### Controller Patterns
- Use dependency injection for services
- Always use `ResponseHandler` for standardized responses
- Handle errors with appropriate HTTP status codes
- Extract parameters using `c.req.param()` and body using `c.req.json()`
- Call `toObject()` on entities before returning responses

### Reference Implementation
See `src/instance-management/controllers/instance.controller.ts` for a complete example.

## 5. Routes Layer Guidelines

### Route Definition
Create routes in `src/{module-name}/routes/{module}.routes.ts`:

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { {ModuleName}Controller } from "../controllers/{module}.controller";
import { 
  {module}IdSchema,
  {module}InsertDataSchema,
  {module}UpdateSchema
} from "../validations/{module}.validation";

export function create{ModuleName}Routes({module}Controller: {ModuleName}Controller) {
  const app = new Hono();

  // POST /{modules} - Create new entity
  app.post(
    "/",
    zValidator("json", {module}InsertDataSchema),
    {module}Controller.create
  );

  // GET /{modules}/:id - Get entity by ID
  app.get(
    "/:id",
    zValidator("param", {module}IdSchema),
    {module}Controller.findById
  );

  // PUT /{modules}/:id - Update entity
  app.put(
    "/:id",
    zValidator("param", {module}IdSchema),
    zValidator("json", {module}UpdateSchema),
    {module}Controller.update
  );

  // DELETE /{modules}/:id - Delete entity
  app.delete(
    "/:id",
    zValidator("param", {module}IdSchema),
    {module}Controller.deleteById
  );

  return app;
}
```

### Route Patterns
- Use factory functions that accept controller instances
- Always add Zod validation using `zValidator`
- Follow RESTful conventions for HTTP methods and paths
- Return Hono app instances for mounting in main router

### Validation Requirements
Create corresponding Zod schemas in `src/{module-name}/validations/{module}.validation.ts` for:
- Parameter validation (e.g., ID validation)
- Request body validation for create/update operations
- Query parameter validation if needed

### Reference Implementation
See `src/instance-management/routes/instance.routes.ts` for a complete example.

## 6. tRPC Routes Layer Guidelines

### tRPC Route Definition
Create tRPC routes in `src/{module-name}/routes/{module}.tRPC-route.ts`:

```typescript
import { router, publicProcedure, protectedProcedure } from '@/apps/integrations/trpc/trpc';
import { z } from 'zod';
import { ServiceFactory } from '@/apps/factories/service.factory';
import { 
  {module}IdSchema,
  {module}InsertDataSchema,
  {module}UpdateSchema
} from '../validations/{module}.validation';

export const {module}Router = router({
  // Create entity - protected procedure
  create: protectedProcedure
    .input({module}InsertDataSchema)
    .mutation(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const {module}Service = factory.make{ModuleName}Service();
      
      // Get authenticated user if needed
      const user = ctx.user;
      
      const entity = await {module}Service.create({
        ...input,
        // Add user context if needed
        createdBy: user?.id,
      });
      
      return entity.toObject();
    }),

  // Get entity by ID - public procedure
  get: publicProcedure
    .input({module}IdSchema)
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      
      const entity = await service.findById(input.id);
      if (!entity) {
        throw new Error('{ModuleName} not found');
      }
      
      return entity.toObject();
    }),

  // List entities with pagination - public procedure
  list: publicProcedure
    .input(z.object({
      first: z.number().min(1).max(100).default(10),
      after: z.string().optional(),
      // Add other filtering options
    }).optional())
    .query(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      
      const result = await service.listRelay(input);
      return result;
    }),

  // Update entity - protected procedure
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: {module}UpdateSchema
    }))
    .mutation(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      
      const entity = await service.update(input.id, input.data);
      if (!entity) {
        throw new Error('{ModuleName} not found');
      }
      
      return entity.toObject();
    }),

  // Delete entity - protected procedure
  delete: protectedProcedure
    .input({module}IdSchema)
    .mutation(async ({ input, ctx }) => {
      const factory = new ServiceFactory(ctx.c);
      const service = factory.make{ModuleName}Service();
      
      const success = await service.deleteById(input.id);
      if (!success) {
        throw new Error('Failed to delete {module}');
      }
      
      return { success: true };
    }),
});
```

### tRPC Procedure Types

**1. Public Procedures** (`publicProcedure`):
- No authentication required
- Use for public data access, health checks, etc.
- Example: Get public entity information

**2. Protected Procedures** (`protectedProcedure`):
- Requires valid JWT authentication
- `ctx.user` is guaranteed to be available
- Use for create, update, delete operations
- Example: User-specific operations

### tRPC Input Validation
Always use Zod schemas for input validation:

```typescript
// Simple ID validation
.input(z.object({ id: z.string() }))

// Complex validation with existing schemas
.input({module}InsertDataSchema)

// Optional parameters
.input(z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(10)
}).optional())
```

### Error Handling in tRPC
Use `TRPCError` for structured error responses:

```typescript
import { TRPCError } from '@trpc/server';

// In your procedure
if (!entity) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: '{ModuleName} not found',
  });
}

// For validation errors
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid input data',
  cause: validationError,
});
```

### Service Factory Integration
Always use the ServiceFactory for dependency injection:

```typescript
// In tRPC procedures
const factory = new ServiceFactory(ctx.c);
const {module}Service = factory.make{ModuleName}Service();

// Access other services if needed
const instanceService = factory.makeInstanceService();
const shareTokenService = factory.makeShareTokenService();
```

### Context Usage
The tRPC context provides access to:

```typescript
ctx.c        // Hono context (for env variables, etc.)
ctx.user     // Authenticated user (in protectedProcedure)
ctx.admin    // Admin user (if implemented)
ctx.db       // Database instance
```

## 7. Integrating tRPC Routes with Main Router

After creating your tRPC routes, integrate them with the main tRPC router:

### Step 1: Import in Main tRPC Router
Edit `src/trpc-router.ts` to include your new router:

```typescript
import { createTRPCContext, router } from '@/apps/integrations/trpc/trpc';
import { instanceRouter } from '@/instance-management/routes/instance.tRPC-route';
import { collaborationRouter } from '@/collaboration/routes/collaboration.tRPC-route';
import { {module}Router } from '@/{module-name}/routes/{module}.tRPC-route'; // Add this line

export const appRouter = router({
  instance: instanceRouter,
  collaboration: collaborationRouter,
  {module}: {module}Router, // Add this line
});
```

### Step 2: Update Service Factory (if needed)
If your module requires a new service, add it to `src/apps/factories/service.factory.ts`:

```typescript
export class ServiceFactory {
  private _{module}Service: {ModuleName}Service | null = null;

  make{ModuleName}Service(): {ModuleName}Service {
    if (!this._{module}Service) {
      const repository = new {ModuleName}RepositoryService(this.db);
      this._{module}Service = new {ModuleName}Service(repository);
    }
    return this._{module}Service;
  }
}
```

### Step 3: Update Exports (if needed)
Update `src/exports.ts` to include new validation schemas:

```typescript
// Re-export validation schemas
export * from '@/shared/validations';
export * from '@/instance-management/validations/instance.validation';
export * from '@/collaboration/validations/collaboration.validation';
export * from '@/{module-name}/validations/{module}.validation'; // Add this line
```

### tRPC Router Structure
The final tRPC router structure will be:

```
/trpc/{module}.{procedure}

Examples:
/trpc/instance.create
/trpc/instance.get
/trpc/collaboration.instances.share
/trpc/{module}.create
/trpc/{module}.list
```

### Testing tRPC Routes
You can test tRPC routes using:

1. **Direct HTTP calls**:
   ```bash
   POST /trpc/{module}.create
   GET /trpc/{module}.get?input={"id":"123"}
   ```

2. **tRPC Client** (in frontend):
   ```typescript
   const result = await trpc.{module}.create.mutate({
     name: "Test Entity",
     description: "Test Description"
   });
   ```

### Reference Implementation
See `src/instance-management/routes/instance.tRPC-route.ts` and `src/collaboration/routes/collaboration.tRPC-route.ts` for complete examples.

## Module Structure Summary

The final structure for a new module should look like this:
```
src/{module-name}/
├── entities/
│   ├── interfaces.ts
│   ├── entity.ts
│   └── index.ts
├── use-cases/
│   ├── interfaces.ts
│   ├── service.ts
│   └── index.ts
├── controllers/
│   └── {module}.controller.ts
├── routes/
│   ├── {module}.routes.ts       # REST routes
│   └── {module}.tRPC-route.ts   # tRPC routes
└── validations/
    └── {module}.validation.ts
```

Plus corresponding database files:
```
src/apps/database/
├── schemas/
│   └── {module}.schema.ts
└── repositories/
    └── {module}.repository.service.ts
```

## Integration with Main Routers

After creating your module routes, integrate them with the main routers:

### REST Integration
Add to `src/rest-router.ts`:
```typescript
import { create{ModuleName}Routes } from '@/{module-name}/routes/{module}.routes';

export function createRESTRouter() {
  const app = new Hono<{ Bindings: CloudflareBindings }>();
  
  // Existing routes...
  app.route('/instances', createInstanceRoutes());
  
  // Add your module routes
  app.route('/{modules}', create{ModuleName}Routes());
  
  return app;
}
```

### tRPC Integration
Add to `src/trpc-router.ts`:
```typescript
import { {module}Router } from '@/{module-name}/routes/{module}.tRPC-route';

export const appRouter = router({
  // Existing routers...
  instance: instanceRouter,
  collaboration: collaborationRouter,
  
  // Add your module router
  {module}: {module}Router,
});
```

## Quick Start Checklist

When creating a new module, follow this checklist:

### ✅ **Core Module Files**
- [ ] Create `src/{module-name}/entities/` (interfaces, entity, index)
- [ ] Create `src/{module-name}/use-cases/` (interfaces, service, index)
- [ ] Create `src/{module-name}/validations/{module}.validation.ts`

### ✅ **Database Layer**
- [ ] Create `src/apps/database/schemas/{module}.schema.ts`
- [ ] Create `src/apps/database/repositories/{module}.repository.service.ts`
- [ ] Add to service factory: `make{ModuleName}Service()`

### ✅ **API Layer (Choose One or Both)**
- [ ] **REST**: Create `src/{module-name}/routes/{module}.routes.ts`
- [ ] **REST**: Create `src/{module-name}/controllers/{module}.controller.ts`
- [ ] **REST**: Add to `src/rest-router.ts`
- [ ] **tRPC**: Create `src/{module-name}/routes/{module}.tRPC-route.ts`
- [ ] **tRPC**: Add to `src/trpc-router.ts`

### ✅ **Exports & Documentation**
- [ ] Add validation exports to `src/exports.ts`
- [ ] Update API documentation
- [ ] Add tests in `src/__tests__/{module-name}/`

This modular approach ensures consistency across the codebase while maintaining the screaming architecture pattern where the purpose of each module is immediately clear from the folder structure.