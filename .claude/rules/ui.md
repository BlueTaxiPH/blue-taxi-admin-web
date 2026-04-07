# UI Component Patterns

## Shadcn Components

Import from `components/ui/` — these are pre-configured with the project's "new-york" style, slate base color, and CSS variables. Recreating them introduces visual inconsistency and duplicates maintenance. Install new ones via `npx shadcn@latest add <component>`.

## Styling

Use Tailwind utility classes and `cn()` from `lib/utils` for conditional merging. Inline styles and CSS modules bypass the design system and make theming inconsistent. The project uses Tailwind v4 with CSS variables for color tokens.

## Icons

Use lucide-react for all icons. Custom SVG icons live in `components/icons/`. Never use emojis as UI icons — they render differently across platforms and can't be styled with design tokens.

## Container Architecture

Container components in `containers/` own all page-level UI logic. Each domain folder (e.g., `driver-management/`, `pricing-and-services/`) groups related components. The main page component is re-exported through `index.tsx`. When building new UI, check what already exists in the relevant container folder before creating new components.
