# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server on port 9002
npm run dev

# Deploy to Cloudflare Workers
npm run deploy

# Generate TypeScript types for Cloudflare bindings
npm run typegen

# Database operations
npm run db:generate          # Generate Drizzle migrations
npm run db:migrate           # Run migrations locally
npm run db:migrate:prod      # Run migrations in production
```

## Architecture Overview

This is a **Cloudflare Workers microservice** built with **Hono.js** that serves as a file/application service within a larger backend ecosystem.

### Core Technology Stack
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js with TypeScript
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **API**: tRPC for type-safe endpoints
- **Auth**: JWT with JOSE library, KV caching
- **Validation**: Zod schemas

### Key Architecture Patterns
- **Clean Architecture**: Entities, use-cases, services, controllers separation
- **Service Bindings**: Integrates with external `AUTH_SERVICE`
- **URL Path Handling**: Configurable first segment dropping via `DROP_FIRST_SEGMENT`
- **Advanced Pagination**: Relay-spec cursor-based pagination in `/src/utils/pagination/`

### Project Structure
```
src/
├── app.ts                  # Main Hono app setup
├── index.ts               # Worker entry point with URL handling
├── controllers/           # HTTP controllers and error handling
├── routes/               # Route definitions (includes tRPC)
├── lib/                  # Core libraries (auth, tRPC config)
├── middleware/           # Auth, CORS, admin middleware
├── db/                   # Database schemas and services
├── entities/             # Domain entities (mini-app/application)
├── services/             # Business logic services
├── use-cases/           # Use case implementations
├── utils/               # Utilities including pagination system
├── validations/         # Zod validation schemas
└── interfaces/          # TypeScript type definitions
```

### Environment Configuration
- **Local**: No path prefix, runs on localhost:9002
- **Dev**: Path prefix `/applications`, routes via `dev-api.10x.io/applications/*`
- **Bindings**: D1 database (`applications`), KV storage (`JWT_AUTH_KV`), service binding (`AUTH_SERVICE`)

### Authentication
Multi-layered JWT authentication with JWKS caching in Cloudflare KV. Supports both user and admin authentication paths with tRPC protected procedures.

### Database
Uses Cloudflare D1 with Drizzle ORM. Database binding name is `DB` pointing to `applications` database. Migrations are manually managed via SQL files.

### Path Aliases
TypeScript path alias `@/*` maps to `./src/*` for clean imports.