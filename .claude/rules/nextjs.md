# Next.js Rules

- Use App Router patterns (app/ directory), not Pages Router
- Server Components are the default — only add "use client" when state/effects/browser APIs are needed
- Server Actions live in `app/actions/` as individual files (one action per file)
- Dashboard pages use the `(dashboard)` route group with shared sidebar layout
- Pages are thin — they import container components from `containers/` for all UI logic
- Use `@/` path alias for all imports (configured in tsconfig.json)
- Metadata exports go in layout.tsx or page.tsx, not a separate head file
