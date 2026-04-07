# Code Quality Rules

- Run the linter after making changes to catch issues early
- Do not introduce new dependencies without asking first
- Prefer editing existing files over creating new ones
- When fixing a bug, add a test that would have caught it
- Keep functions under 50 lines — extract helpers when needed
- Use the `ActionResult<T>` pattern from `lib/actions/result.ts` for all server action return types
- Use `requireAdmin()` from `lib/auth/require-admin.ts` at the top of every server action
