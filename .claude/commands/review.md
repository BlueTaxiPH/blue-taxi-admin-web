Review the current working branch changes for quality, correctness, and project consistency.

1. Run `git diff` to see all modifications. If there are staged changes, also run `git diff --cached`.
2. Run `npm run lint` — report any failures with file paths.
3. Run `npx tsc --noEmit` — report type errors.
4. Review each changed file for:
   - **Server actions**: Must call `requireAdmin()` and return `ActionResult<T>`. Missing either breaks auth or frontend error handling.
   - **Supabase client usage**: Verify the right client is used for the context (browser/server/admin). Wrong choice = silent auth failures or security holes.
   - **UI consistency**: New components should use Shadcn from `components/ui/`, Tailwind classes, and lucide-react icons. Hardcoded hex colors or emoji icons break the design system.
   - **Missing states**: Forms need loading, error, and success states. Lists need empty states. Async operations need skeleton/spinner feedback.
5. Summarize findings grouped by severity:
   - **Critical**: Will cause crashes, auth bypass, or data loss
   - **Warning**: Works but violates project patterns or has edge case bugs
   - **Info**: Style nits or minor improvements
