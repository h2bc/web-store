# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

No test framework is currently configured in this project.

## Architecture

This is a Next.js 15 e-commerce frontend built with TypeScript, Tailwind CSS v4, and React 19. The application uses the App Router with route groups.

### Prerequisites

Requires a Medusa server running locally on port 9000. For quick setup: `npx create-medusa-app@latest`

### Key Integrations

- **Medusa.js**: E-commerce backend integration via `@medusajs/js-sdk`
  - SDK instance: `lib/medusa.js` (Note: .js extension despite being used in TypeScript)
  - Configured with environment variables for backend URL and publishable key
- **shadcn/ui**: Component library with Radix UI primitives
- **Form handling**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast messages
- **Styling**: Tailwind CSS v4 with CVA (class-variance-authority) and tailwind-merge

### Directory Structure

Route groups organize the application:

- `app/(landing)/` - Landing page with separate layout
- `app/(main)/` - Main application pages (about, contact, gallery, shop, shipping-returns) sharing a common layout with header/footer
- `components/` - Organized by feature area:
  - `ui/` - shadcn/ui base components (button, input, form, etc.)
  - `layout/` - Header and footer components
  - `shop/` - Product cards, grids, filters, and detail views
  - `contact/` - Contact form components
  - `feedback/` - Error handling components
- `lib/` - Utilities and SDK configurations
  - `data/` - Server-side data access layer (DAL) modules
  - `cache.ts` - Custom cache wrapper around Next.js `unstable_cache`
  - `cookies.ts` - Cookie management utilities (region_id, cart_id)
  - `breakpoints.ts` - Centralized Tailwind breakpoint constants
  - `utils.ts` - Common utilities (cn helper, etc.)

### Naming Conventions

- **Components**: kebab-case for file names (e.g., `product-card.tsx`, `site-header.tsx`)
- All component names follow this convention as per recent refactoring

### Data Access Pattern

The codebase uses a **Data Layer Adapter (DLA)** pattern:

1. **Data Layer** (`lib/data/`) - Server-side modules marked with `'use server'`, containing:
   - Business logic and external API calls to Medusa backend
   - Caching via `cached` wrapper from `lib/cache.ts`
   - Error handling and fallbacks
   - Return structured objects with `{ data, error }` pattern
2. **Server Actions** (`actions.ts` files) - DEPRECATED in favor of direct data layer imports
   - Previously used as entry points for client-server interaction
   - Being phased out; new code should call data layer functions directly from Server Components
3. Current flow: Server Component → Data Layer (direct import)

Examples:

- Shop page directly calls `getProducts()` from `lib/data/products.ts` (Server Component)
- Contact form previously used Server Actions but is being refactored to call `submitContactMessage` from `lib/data/contact.ts` directly

### Region Management

- Regions/currencies are managed via cookies with a 1-year expiration
- Cookie utilities in `lib/cookies.ts` (`getRegionId`, `setRegionId`)
- Region data fetched from Medusa backend with custom cache wrapper (`cached` from `lib/cache.ts`, 1-hour revalidation)
- Proxy (`proxy.ts`) sets default region_id cookie if not present
- Fallback to `NEXT_PUBLIC_DEFAULT_REGION_ID` environment variable
- Selected via region selector in header

### Cart Management

- Cart ID managed via cookies with a 1-year expiration
- Cookie utilities in `lib/cookies.ts` (`getCartId`, `setCartId`)
- Cart data fetched from Medusa backend via `lib/data/cart.ts`
- Cached with dynamic tags based on cart ID

### Caching

The project uses a custom cache wrapper (`cached` from `lib/cache.ts`) instead of Next.js `unstable_cache` directly:

- Wraps `unstable_cache` with ability to disable caching via `DISABLE_CACHE=true` environment variable
- Used throughout all data layer functions for consistent caching behavior
- Supports same API as `unstable_cache`: cache keys, revalidation times, and tags
- Cache revalidation times vary by data type:
  - Products: 60 seconds
  - Regions: 3600 seconds (1 hour)
  - Cart: No automatic revalidation (invalidated on cart updates)

### Environment Variables

Required in `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Medusa store API key
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` - Medusa backend URL (defaults to http://localhost:9000)
- `NEXT_PUBLIC_DEFAULT_REGION_ID` - Fallback region ID (used by proxy)
- `NEXT_PUBLIC_BASE_URL` - Frontend URL (defaults to http://localhost:3000)
- `DISABLE_CACHE` - Set to `true` to disable Next.js caching during development (optional, defaults to false)

### Styling Approach

- Tailwind CSS v4 with PostCSS
- Centralized breakpoints in `lib/breakpoints.ts` matching Tailwind defaults
- Custom fonts: UnifrakturMaguntia (Google) and Edwardian Script ITC (local)
- Component variants managed with `class-variance-authority`
- Utility `cn()` function combines clsx + tailwind-merge for conditional classes

### Next.js Configuration

- Image optimization configured for Medusa backend (`localhost:9000/static/**`)
- Cache headers set for static assets (products, fonts: 1 year immutable)
- Turbopack enabled for dev and build
- Proxy runs on all routes except API routes, static files, and Next.js internal routes

### Code Patterns

- TypeScript strict mode enabled
- ESLint with Next.js, TypeScript, and Prettier integration
- File-based routing with App Router and route groups
- React Server Components by default, Client Components marked with `"use client"`
- Cookie-based state persistence for user preferences (region, cart)
- Server-side validation with Zod, client-side with React Hook Form
- XSS prevention with `xss` library in data layer (e.g., contact form sanitization)
