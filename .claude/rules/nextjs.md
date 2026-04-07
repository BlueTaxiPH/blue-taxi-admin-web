# Next.js Architecture

This project uses patterns that Claude should follow to stay consistent with existing code, even though other approaches are technically valid.

## Thin Pages, Fat Containers

Page files in `app/` are intentionally minimal — they import and render a container from `containers/`. All UI logic, state, and data fetching for a page lives in its container folder. This separation exists because:
- Pages handle routing and metadata only
- Containers are reusable and testable in isolation
- Each container folder has an `index.tsx` barrel export

When adding a new feature, find or create the right container folder first. Don't put UI logic directly in page files.

## Server Actions

Actions live in `app/actions/` as one function per file. This keeps them small, discoverable, and independently importable. The existing pattern is: `"use server"` directive at top, `requireAdmin()` guard, input validation, Supabase query, return `ActionResult<T>`, then `revalidatePath()` if data changed.

## Route Groups

The `(dashboard)` route group wraps all authenticated pages with a shared sidebar layout. Its layout.tsx also verifies the user has admin role — so the middleware handles session refresh and the layout handles role authorization. Both layers are needed.
