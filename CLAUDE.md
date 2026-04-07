# Blue Taxi Admin Web

Admin dashboard for managing the Blue Taxi ride-hailing platform — drivers, passengers, trips, pricing, insurance, and payments.

## Stack

- Framework: Next.js 16 with App Router
- Language: TypeScript (strict mode)
- Database: Supabase (PostgreSQL + Auth + Storage)
- UI: Shadcn/ui (new-york style) + Tailwind CSS v4 + Lucide icons
- Deployment: Vercel
- Package Manager: npm

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run start        # Start production server
```

## Project Structure

```
app/
  (dashboard)/       # Route group — all admin pages share sidebar layout
    dashboard/       # Main dashboard overview
    drivers/         # Driver list + [id] detail pages
    passengers/      # Passenger list + [id] profile pages
    payments/        # Payment management
    pricing-and-services/  # Fare config, city management, service availability
    insurance-reports/     # Insurance coverage + trip manifests
    system-settings/       # Platform configuration
    trip-management/       # Trip oversight
    layout.tsx       # Shared sidebar + auth guard layout
  actions/           # Server Actions (one action per file)
  login/             # Public login page
  forgot-password/   # Public password reset
containers/          # Page-level UI components organized by domain
  dashboard/         # Dashboard cards and header
  driver-detail/     # Driver profile, documents, avatar upload
  driver-management/ # Driver table, filters, pagination, add modal
  passenger-management/
  passenger-profile/
  pricing-and-services/
  insurance-reports/
  payments/
  system-settings/
  login-page/
components/
  ui/                # Shadcn components (do not edit manually)
  icons/             # Custom SVG icon components
  app-sidebar.tsx    # Main navigation sidebar
lib/
  supabase/          # Three clients: client.ts (browser), server.ts, admin-client.ts
  auth/              # require-admin.ts — auth guard for server actions
  actions/           # result.ts — ActionResult<T> type + success/failure helpers
  utils.ts           # cn() and other utilities
  compress-image.ts  # Client-side image compression before upload
  document-types.ts  # Driver document type definitions
types/               # Shared TypeScript types (driver, passenger, dashboard, platform-fee)
hooks/               # React hooks (use-mobile.ts)
middleware.ts        # Supabase auth session refresh + route protection
```

## Architecture Decisions

- **Thin pages, fat containers**: Page files (`app/**/page.tsx`) only import and render container components from `containers/`. All UI logic lives in containers.
- **Server Actions pattern**: Each action is a separate file in `app/actions/`. Actions use `requireAdmin()` for auth and return `ActionResult<T>` from `lib/actions/result.ts`.
- **Three Supabase clients**: Browser client (`"use client"`), server client (cookies-based for Server Components/Actions), and admin client (service role, bypasses RLS).
- **Route group `(dashboard)`**: All authenticated pages share a layout with sidebar navigation and admin role verification.
- **Container barrel exports**: Each container folder has an `index.tsx` that re-exports its main page component.

## Code Conventions

- Named exports for all non-page components
- Path alias `@/` for all imports
- Server actions: one function per file, `"use server"` directive at top
- Container components use PascalCase filenames matching the component name
- Shadcn components live in `components/ui/` — install via `npx shadcn@latest add`

## Environment Variables

Required (see `.env`):
```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY      # Service role key (server-only, never NEXT_PUBLIC_)
```

## Key Patterns

### Server Action Flow
1. `requireAdmin()` verifies the caller is an authenticated admin
2. Validate input
3. Execute Supabase query (using server client or admin client)
4. Return `success(data)` or `failure(message)`
5. Call `revalidatePath()` if data changed

### Auth Flow
- Middleware (`middleware.ts`) refreshes Supabase session on every request
- Public routes: `/login`, `/`, `/forgot-password`
- All other routes redirect to `/login` if no session
- Dashboard layout additionally checks admin role from `users` table

## .claude/ Directory

This project uses the full `.claude/` structure:
- `/commands` — Run with `/project:command-name`. Available: review, scaffold-component, debug
- `/agents` — Subagents for research and QA. Invoke via Agent tool
- `/rules` — Auto-loaded rules for: nextjs, supabase, supabase-postgres, ui, ui-ux-guidelines, code-quality

See individual files in `.claude/` for details.

## When Compacting

Always preserve:
- Files modified in this session
- Current task objective and progress
- Test commands run and their results
- Active branch context
