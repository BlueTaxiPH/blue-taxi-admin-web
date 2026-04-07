Create a new component following this project's container architecture pattern.

1. **Gather requirements**: Ask for component name, which domain it belongs to (driver-management, pricing-and-services, etc.), and whether it needs client-side interactivity (state, effects, event handlers).

2. **Choose the right location**:
   - Page-level feature → `containers/[domain]/` (this is where most new UI goes)
   - Reusable across domains → `components/`
   - Never put UI logic directly in `app/**/page.tsx` — pages are thin wrappers

3. **Create the component**:
   - Add `"use client"` only if the component uses state, effects, or browser APIs. Server Components are the default and they're better for performance.
   - Import Shadcn primitives from `@/components/ui/` and icons from `lucide-react`
   - Use `cn()` from `@/lib/utils` for conditional Tailwind classes
   - Define a TypeScript props interface. Use named exports (not default).
   - Follow the naming convention: PascalCase filename matching the component name

4. **Wire it up**: If the container folder has an `index.tsx` barrel file, add the new export there.
