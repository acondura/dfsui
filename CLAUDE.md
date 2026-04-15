# CLAUDE.md - Project Context: dfsui

## Project Overview
**dfsui** (DataForSEO UI) is a high-performance SEO research platform built with **Next.js 15 (App Router)** and designed specifically for the **Cloudflare Workers/Pages** runtime. It provides a modern interface for interacting with DataForSEO APIs, focusing on keyword research and competitive analysis while optimizing for cost and speed through aggressive caching.

Main goal:
Use the dataforseo API endpoints to fetch data and display it in an extremely useful way.
E.g. Keywords Data API endpoints - get the raw data and also display the real competition by checking SERP for the keyword in slug, meta tigle, meta description, h1 tag and first paragraph text.

Guidelines:
- always use comments in the code to explain what the code does
- high security, double check for bugs and security issues

Overall design:
- left sidebar:
  - top
    - logo
    - links
      - dashboard
      - keywords
      - competition
      - settings
  - bottom
    - workspace selection
    - sign out
- main content area:
  - header
    - balance
    - user email
  - main content

### Core Technologies
- **Framework:** Next.js 15 (App Router)
- **Runtime:** Cloudflare Workers (via `@cloudflare/next-on-pages`)
- **Storage/Caching:** Cloudflare KV (`dfsui` namespace)
- **Styling:** Tailwind CSS 4
- **Auth:** Cloudflare Access JWT validation (`jose`)
- **Icons:** Lucide React
- **Validation:** Zod

---

## Architecture & Key Components

### 1. Authentication & Identity (`src/lib/auth.ts`)
The project integrates with **Cloudflare Access**. In production, it validates the `cf-access-jwt-assertion` header. In development, it defaults to a mock identity (`admin@example.com`). It also manages a **Team/Workspace** system stored in KV, allowing users to switch between personal and shared team environments.

### 2. DataForSEO Integration (`src/lib/dataforseo.ts` & `src/app/dashboard/keywords/actions.ts`)
- **Server Actions:** All API interactions are handled via Next.js Server Actions.
- **Caching Logic:** API responses are cached in Cloudflare KV to reduce API credits usage and improve performance.
- **Cache Keys:** Use structured patterns:
    - Keywords: `keywords_v2:${email}:${locCode}:${mode}:${keyword}`
    - Audit: `audit:${email}:${locationCode}:${keyword}`
- **Modes:** Supports both `labs` (DataForSEO Labs API) and `live` (Google Ads API) research modes.

### 3. Storage Schema (Cloudflare KV)
- `user:${email}:active-team`: Currently selected team ID.
- `user:${email}:teams`: JSON array of team IDs the user belongs to.
- `team:${id}:dfs-user` / `team:${id}:dfs-pass`: DataForSEO credentials for the team.
- `team:${id}:members`: JSON array of emails in the team.

---

## Development Workflow

### Building and Running
- **Development:** `npm run dev` (Runs the Next.js dev server).
- **Linting:** `npm run lint` (Uses ESLint with Next.js config).
- **Production Build:** `npm run build` (Prepares the app for Cloudflare Pages).
- **Cloudflare Deployment:** Uses `wrangler` and `@cloudflare/next-on-pages`.

### Key Commands
```bash
# Start local development
npm run dev

# Run linting
npm run lint

# Build for Cloudflare
npx @cloudflare/next-on-pages
```

---

## Coding Conventions

1.  **Cloudflare Compatibility:** Always use `@cloudflare/next-on-pages`'s `getRequestContext()` to access environment variables and KV namespaces within Server Actions or API routes.
2.  **Server Actions First:** Prefer Server Actions for data mutations and credential-heavy fetching.
3.  **Zod Validation:** Use Zod for all sensitive input parsing (especially emails and IDs).
4.  **Tailwind 4:** Follow Tailwind 4 patterns for styling.
5.  **Security:** Never log or expose `dfs-pass` or JWT contents. Identity must always be verified via `getIdentity(env)` before performing KV operations.
6.  **Caching:** Always check KV before hitting external APIs unless a `bypassCache` flag is explicitly passed.

---

## Project Structure
- `src/app/`: Next.js App Router pages and layouts.
- `src/app/dashboard/`: Core application logic (Keywords, Settings, Actions).
- `src/components/`: Reusable UI components (Sidebar, Tables, Forms).
- `src/lib/`: Core utilities (Auth, DataForSEO, Constants).
- `wrangler.toml.local`: Local Cloudflare Workers configuration for KV bindings.
