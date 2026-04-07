Systematically debug an issue in the Blue Taxi Admin dashboard.

1. **Understand the symptom**: Ask what the expected behavior is vs what actually happens. Get specifics — which page, which action, what error message or unexpected result.

2. **Locate the relevant code**: Use the project structure to narrow down:
   - UI issue → check the relevant `containers/` folder
   - Data not showing/saving → check the server action in `app/actions/` and the Supabase query
   - Auth issue → check `middleware.ts`, `lib/auth/require-admin.ts`, and the `(dashboard)/layout.tsx` role check
   - Routing issue → check `app/` directory structure and middleware matcher

3. **Check recent context**: Run `git log --oneline -10` to see if a recent commit introduced the problem.

4. **Trace the data flow**: Most bugs in this app happen at one of these boundaries:
   - Supabase RLS blocking a query silently (returns empty instead of error)
   - Wrong Supabase client used (admin vs server vs browser)
   - Server action not called with `requireAdmin()` or returning wrong shape
   - Client component trying to use server-only APIs

5. **Propose a fix**: Explain what's wrong and why, then implement after the user confirms the approach.
