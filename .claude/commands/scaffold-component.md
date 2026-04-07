Create a new component with the project's conventions:

1. Ask for: component name, domain (which container folder), whether it needs client-side interactivity
2. If it's a page-level feature, create it in `containers/[domain]/`
3. If it's a reusable UI element, create it in `components/`
4. If client-side, add "use client" directive
5. Use Shadcn components from `components/ui/` and Tailwind classes
6. Add TypeScript prop types interface
7. Use named exports
8. If the container folder has an `index.tsx`, add the export there
