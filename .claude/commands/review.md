Review the current changes in the working branch:

1. Run git diff to see all modified files
2. Run `npm run lint` to check for lint errors
3. Check for TypeScript errors with `npx tsc --noEmit`
4. Identify potential issues: unused imports, missing error handling, hardcoded values
5. Verify server actions use `requireAdmin()` and return `ActionResult<T>`
6. Summarize findings with severity (critical/warning/info)
