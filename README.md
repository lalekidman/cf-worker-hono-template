# Application Management System

A Cloudflare Workers application built with **Screaming Architecture** principles, using Hono, tRPC, Drizzle ORM, and TypeScript.

## 🏗️ Architecture Overview

This project implements **Screaming Architecture** by Uncle Bob, where the business intent is immediately visible through the folder structure. The system screams **"Application Management"** - managing mini-apps with publishing, authoring, and content management capabilities.

### Project Structure

```
src/
├── app.ts                           # Main application entry point
├── index.ts                         # Worker entry point  
├── trpc-router.ts                   # tRPC router (root level)
├── rest-router.ts                   # REST router (root level)
│
├── application-management/          # 🎯 BUSINESS DOMAIN
│   ├── entities/                   # Domain entities & business logic
│   ├── use-cases/                  # Business services & logic
│   ├── controllers/                # HTTP request handlers
│   ├── routes/                     # API route definitions
│   └── validations/                # Input validation schemas
│
├── apps/                           # 🔧 INFRASTRUCTURE LAYER
│   ├── database/                   # Database infrastructure
│   ├── integrations/               # External service integrations
│   ├── middleware/                 # Cross-cutting concerns
│   └── factories/                  # Dependency injection
│
└── shared/                         # 🔄 SHARED UTILITIES
    ├── interfaces/                 # Common interfaces
    ├── utils/                      # Reusable utilities
    └── response-handler/           # Standardized responses
```

## 🚀 Key Benefits

- **Domain-First Organization**: Business logic clearly separated from infrastructure
- **Immediate Understanding**: New developers instantly understand the business domain
- **Scalable Boundaries**: Easy to add new modules or split into microservices
- **Team Autonomy**: Teams can own complete vertical slices
- **Reduced Coupling**: Clear separation between business and technical concerns

## 📋 Quick Start

### Development

```bash
npm install
npm run dev
```

### Deployment

```bash
npm run deploy
```

### Database Management

```bash
# Generate migrations
npm run db:generate

# Apply migrations (local)
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:prod
```

### Type Generation

[Generate/synchronize types based on Worker configuration](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
npm run typegen
```

## 🛠️ Technology Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **API**: tRPC + REST
- **Database**: Drizzle ORM + D1
- **Language**: TypeScript
- **Authentication**: JWT with KV caching
- **Validation**: Zod

## 🏛️ Architecture Principles

### Screaming Architecture Implementation

1. **Business Domains First**: Folder structure reflects business capabilities
2. **Infrastructure Separation**: Technical concerns isolated in `apps/`
3. **Shared Utilities**: Common code centralized in `shared/`
4. **Clear Boundaries**: Each module is self-contained with defined interfaces
5. **Dependency Inversion**: Business logic doesn't depend on infrastructure

### Cloudflare Workers Configuration

Pass `CloudflareBindings` as generics when instantiating Hono:

```ts
// src/app.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## 📚 Implementation Guidelines

For detailed implementation patterns and migration guides, see:
- `guidelines/screaming-architecture-implementation.md`
- `guidelines/module-creation.md`
- `guidelines/templates-and-patterns.md`

## 🔄 Adding New Business Domains

To add a new business domain (e.g., `user-management`):

1. Create domain folder: `src/user-management/`
2. Implement domain layers: `entities/`, `use-cases/`, `controllers/`, `routes/`
3. Add infrastructure: database schemas, repositories
4. Update root routers: `trpc-router.ts` and `rest-router.ts`
5. Register services in `apps/factories/service.factory.ts`

This architecture makes the system's business intent immediately clear while maintaining clean separation of concerns and scalability.
