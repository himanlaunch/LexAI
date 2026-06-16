# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### LexAI Web (`artifacts/lexai-web`)
- **Type**: React + Vite SPA
- **Preview path**: `/` (root)
- **Workflow**: `LexAI` — runs on port 5000 via `cd artifacts/lexai-web && PORT=5000 BASE_PATH=/ node_modules/.bin/vite --config vite.config.ts --host 0.0.0.0`
- **Routes**:
  - `/` — Landing page (faithful reproduction of the LexAI mockup)
  - `/services` — All legal services grid + practice areas
  - `/documents` — Document templates with Generate buttons
  - `/dashboard` — Stats cards and recent activity
- **Design**: Apple-inspired, uses SF Pro system font stack, blue (#0071e3) primary color
- **Key files**:
  - `src/pages/Home.tsx` — Full landing page with all sections + interactive widgets
  - `src/pages/Services.tsx`, `Documents.tsx`, `Dashboard.tsx` — Placeholder routes
  - `src/components/layout/Nav.tsx`, `Footer.tsx` — Shared layout
  - `src/lib/constants.ts` — Color palette, font stack, services data
  - `src/hooks/use-in-view.ts` — IntersectionObserver hook for scroll animations

### Mockup Sandbox (`artifacts/mockup-sandbox`)
- **Type**: Design mockup sandbox
- **Preview path**: `/__mockup`
- Contains the original LexAI landing page mockup at `src/components/mockups/lexai-landing/LandingPage.tsx`

### API Server (`artifacts/api-server`)
- **Type**: Express 5 API
- **Preview path**: `/api`
- Currently only has a health check endpoint at `/api/healthz`

## Notes

- The LexAI workflow uses direct Vite invocation (`node_modules/.bin/vite`) instead of `pnpm run dev` to work around a port detection issue with the platform's workflow health checker when using pnpm filter.
- The artifact.toml for lexai-web is set to port 5000, matching the LexAI workflow.
