# UI Rules

- Import Shadcn components from `components/ui/` — never recreate them
- Shadcn uses "new-york" style with slate base color and CSS variables (see components.json)
- Use Tailwind utility classes, not inline styles or CSS modules
- Use `cn()` helper from `lib/utils` for conditional class merging
- Icon library is lucide-react — use it for all icons
- Custom icons live in `components/icons/`
- Container components in `containers/` hold all page-level UI logic — pages just compose them
