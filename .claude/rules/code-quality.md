# Code Quality

This project has specific patterns that differ from typical Next.js apps. Follow these to keep the codebase consistent.

## Server Action Pattern

Every server action uses two project-specific utilities:
- `requireAdmin()` from `lib/auth/require-admin.ts` — call at the top of every action. This checks both authentication and admin role against the `users` table. Without it, any authenticated user could invoke admin operations.
- `ActionResult<T>` from `lib/actions/result.ts` — use `success(data)` and `failure(message)` helpers for return values. The frontend relies on this shape for consistent error handling.

Skipping either of these breaks the auth boundary or the frontend's error display. Check existing actions in `app/actions/` for reference.

## Change Discipline

- Run `npm run lint` after changes — ESLint is configured with Next.js core-web-vitals and TypeScript rules, so it catches real issues.
- Don't add dependencies without asking. This is a small, focused admin app and unnecessary packages bloat the bundle and create maintenance burden.
- Prefer editing existing files. The `containers/` pattern means most new UI belongs inside an existing domain folder, not in a new file.
