# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 e-commerce application using App Router with server components, Clerk authentication, Drizzle ORM with PostgreSQL, and shadcn/ui components. The application follows a service-oriented architecture where backend services can be called directly from Server Components without API routes.

## Commands

### Development
- `bun dev` - Start development server (Next.js)
- `bun run build` - Build production bundle
- `bun run lint` - Run Biome linter (check only)
- `bun run format` - Format code with Biome

### Database
- `bun run db:generate` - Generate Drizzle migrations from schema
- `bun run db:migrate` - Run pending migrations
- `bun run db:studio` - Open Drizzle Studio database GUI

### Component Management
- `bunx shadcn@latest add <component>` - Add shadcn/ui components

## Architecture

### Service Layer (`src/lib/services/`)

Backend services follow a standardized structure and can be called directly from Server Components or Server Actions. **No API routes needed.**

Each service directory contains:
- `types.ts` - Type definitions (request/response types)
- `config.ts` - Configuration constants
- `deps.ts` - Dependency injection types
- `internal.ts` - Internal utilities and validation
- `service.ts` - Service interface and factory function
- `index.ts` - Public exports

Service interface (e.g., `ILLMService`) is defined in `service.ts` to provide a clear overview of available functions.

Services are initialized in `src/lib/services/index.ts` with environment-based configuration and can be imported directly:

```typescript
import { llmService, embeddingService, storageService, emailService } from "@/lib/services";
```

Services use Clerk's `auth()` for authentication and automatically handle user context.

### Database (`src/db/`)

- Uses Drizzle ORM with PostgreSQL (postgres.js driver)
- Schema definitions in `src/db/schema.ts`
- Database client exported from `src/db/index.ts`
- Migrations stored in `drizzle/` directory
- Configuration in `drizzle.config.ts`

### Authentication

- Clerk handles authentication with middleware protection
- Middleware in `src/middleware.ts` protects all routes except auth pages
- Can be disabled with `NEXT_PUBLIC_AUTH_DISABLED=true` environment variable
- Access user context in services with `auth()` from `@clerk/nextjs/server`

### Components

- shadcn/ui components in `components/ui/`
- Custom components in `components/` and `src/components/`
- Uses Tailwind CSS v4 with CSS variables
- Path aliases configured: `@/*` maps to root directory

### Result Pattern

`src/lib/utils/result.ts` provides a type-safe Result pattern for error handling:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For AI/LLM services
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `CLERK_SECRET_KEY` - Clerk authentication
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase storage
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase storage
- `RESEND_API_KEY` - Email service (optional)
- `NEXT_PUBLIC_AUTH_DISABLED` - Disable auth (development only)

## Code Style

- Biome for linting and formatting
- Tabs for indentation
- 80 character line width
- Double quotes for JavaScript/TypeScript
- Organize imports on save enabled

## Rules
- when doing frontend changes, always try to reuse already existing code and use the shadcn mcp server when needed