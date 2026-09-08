# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Medusa v2 e-commerce application (version 2.10.2). Medusa is a composable commerce platform built with TypeScript that provides modular commerce functionality through independent modules.

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm start` - Start production server

### Database
- `npx medusa db:generate <module-name>` - Generate migrations for a specific module
- `npx medusa db:migrate` - Run database migrations (also syncs module links)

### Testing
- `npm run test:unit` - Run unit tests
- `npm run test:integration:http` - Run HTTP integration tests for API routes
- `npm run test:integration:modules` - Run module integration tests

### Scripts
- `npm run seed` - Seed database (executes `./src/scripts/seed.ts`)
- `npx medusa exec ./src/scripts/<script-name>.ts` - Execute custom CLI script

## Architecture

### File-Based Routing

Medusa uses file-based routing for several customization types:

**API Routes** (`src/api/`):
- Create `route.ts` files to define REST endpoints
- Path structure maps to URL: `src/api/store/hello/route.ts` → `/store/hello`
- Dynamic routes use `[param]` syntax: `src/api/products/[productId]/route.ts`
- Export HTTP method handlers: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`
- Access container via `req.scope.resolve()` to get module services

**Admin Customizations** (`src/admin/`):
- Widget files extend admin dashboard with React components
- Export `config` with `defineWidgetConfig()` to specify injection zones
- TypeScript configuration in `src/admin/tsconfig.json` extends root config

**Workflows** (`src/workflows/`):
- Multi-step business logic using `createWorkflow()` and `createStep()`
- Steps return `StepResponse` for data passing between steps
- Execute from API routes, jobs, or subscribers via workflow function

**Subscribers** (`src/subscribers/`):
- Event handlers triggered by Medusa events
- Export handler function and `config` object with `event` property
- Receive `{ event, container }` parameters for accessing event data and services

**Scheduled Jobs** (`src/jobs/`):
- Background tasks with cron schedules
- Export handler function and `config` with `name`, `schedule`, and optional `numberOfExecutions`

**Custom Modules** (`src/modules/`):
- Reusable packages of functionality with models and services
- Must define models (`models/` directory), service extending `MedusaService`, and export module definition
- Register modules in `medusa-config.ts` under `modules` array
- Generate migrations with `npx medusa db:generate <module-name>`

**Module Links** (`src/links/`):
- Define relationships between data models across modules using `defineLink()`
- Maintains module isolation while creating associations
- Sync with `npx medusa db:migrate`

**CLI Scripts** (`src/scripts/`):
- Custom tooling scripts that accept `{ container, args }` parameters
- Execute with `npx medusa exec ./src/scripts/<script>.ts [args]`

### Dependency Injection

All customizations use Medusa's dependency injection container (`MedusaContainer`):
- In API routes: `req.scope.resolve("service-name")`
- In workflows, subscribers, jobs, scripts: `container.resolve("service-name")`
- Core Medusa modules available by key (e.g., `"product"`, `"cart"`, `"order"`)
- Custom modules resolved by their registered module key

### Configuration

**Environment Variables** (`.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` - CORS configurations
- `JWT_SECRET`, `COOKIE_SECRET` - Security secrets

**Medusa Config** (`medusa-config.ts`):
- Loads environment variables with `loadEnv()`
- Define project config (database, HTTP settings)
- Register custom modules in `modules` array

### Testing

Integration tests use `@medusajs/test-utils`:
- Use `medusaIntegrationTestRunner()` wrapper
- Access `api` client and `getContainer()` in test suite
- Tests organized by type in `integration-tests/` directory
- Jest configuration in `jest.config.js` with SWC for TypeScript

## Technology Stack

- **Runtime**: Node.js >=20
- **Language**: TypeScript 5.6+
- **ORM**: MikroORM 6.4.3 with PostgreSQL
- **Framework**: Medusa 2.10.2
- **Testing**: Jest 29 with SWC
- **Admin UI**: React 18 with Vite 5
- **Dependency Injection**: Awilix 8

## Important Notes

- Build output goes to `.medusa/server` (TypeScript) and `.medusa/admin` (React admin)
- All modules use Node16 module resolution
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Middleware defined in `src/api/middlewares.ts` using `defineMiddlewares()`