# UI/UX Design Guidelines

These guidelines ensure the admin dashboard feels professional, accessible, and consistent. They're organized by impact — address critical issues first.

## Accessibility (Critical)

Users with disabilities and users on assistive technology need to use this dashboard. Accessibility failures can also create legal liability.

- **Contrast**: 4.5:1 minimum for normal text, 3:1 for large text. Low contrast makes text unreadable in bright office environments too, not just for vision-impaired users.
- **Focus rings**: Keep visible (2-4px) on all interactive elements. Keyboard users have no other way to know what's selected. Never remove outline styles globally.
- **Labels over placeholders**: Placeholders disappear when typing, leaving users guessing what the field expects. Always use `<label htmlFor>` with visible text.
- **ARIA on icon buttons**: A button with just a pencil icon means nothing to a screen reader. Add `aria-label="Edit driver"` or similar.
- **Color + text/icon**: Red text alone for errors excludes colorblind users. Pair color with an icon or text label.
- **Heading hierarchy**: Skip h1→h3 and screen readers lose document structure. Keep sequential.

## Interaction (Critical)

Admin users interact with data-heavy tables and forms all day. Poor interaction patterns cause frustration and errors.

- **Click targets**: 44x44px minimum with 8px gaps between targets. Smaller targets cause misclicks, especially on touchscreens and trackpads.
- **Loading feedback**: Disable buttons and show a spinner during async operations. Without this, users click multiple times causing duplicate submissions (e.g., double-approving a driver).
- **Error placement**: Show errors next to the field that caused them, stating what's wrong and how to fix it. Generic toasts get dismissed before users read them.
- **Disabled states**: Use reduced opacity (0.38-0.5) + `cursor-not-allowed` + the `disabled` attribute. Visual-only disabled (just grayed out) still allows keyboard activation.

## Performance (High)

The dashboard loads data-heavy tables and multiple cards. Poor performance makes admins wait and switch to manual workflows.

- **Skeleton screens**: For loads >1s, show skeleton shimmer instead of spinners. Skeletons give spatial context about what's loading, reducing perceived wait time.
- **Layout stability**: Set width/height or aspect-ratio on images and reserve space for async content. Layout jumps (CLS) cause misclicks when content shifts under the cursor.
- **List virtualization**: Tables with 50+ rows (driver lists, passenger lists) should virtualize. Rendering hundreds of DOM nodes causes scroll jank.
- **Debounced inputs**: Search and filter inputs should debounce (300ms) to avoid firing a query per keystroke.

## Style & Consistency (High)

Inconsistent UI erodes trust in the admin tool and makes training new operators harder.

- **One primary CTA per screen**: Multiple competing primary buttons confuse users about the main action. Use secondary/ghost variants for lesser actions.
- **Semantic color tokens**: Use Tailwind CSS variables, not hardcoded hex. This ensures dark mode compatibility and makes visual updates propagate globally.
- **Consistent elevation**: Cards, sheets, and modals should follow a predictable shadow scale. Don't mix flat cards with heavy-shadow cards on the same page.
- **Icon consistency**: Don't mix filled and outline icons at the same hierarchy level. The project uses lucide-react's default stroke style throughout.

## Layout (High)

- **Spacing rhythm**: Use 4/8px increments consistently. Random spacing looks unprofessional and makes components harder to align.
- **Max content width**: Cap content with `max-w-*` on wide screens. Full-width text at 1920px is unreadable (150+ characters per line vs the ideal 60-75).
- **Z-index scale**: Use predictable layers (content: 0, dropdown: 10, modal: 40, toast: 100). Ad-hoc z-index values cause stacking bugs that are painful to debug.
- **Sidebar coexistence**: Scrollable content needs padding so nothing hides behind the fixed sidebar or header.

## Forms & Feedback (Medium)

Forms are the primary way admins modify data (driver approvals, fare configs, service settings). Form UX directly impacts operational accuracy.

- **Validate on blur**: Don't validate on every keystroke — it's distracting. Wait until the user leaves the field.
- **Confirm destructive actions**: Delete driver, suspend account, etc. need a confirmation dialog. Toasts with undo are the second-best option. Never execute irreversible actions on a single click.
- **Auto-focus first error**: After a failed submit, move focus to the first invalid field so the user doesn't have to hunt for it.
- **Required field indicators**: Mark required fields with asterisk. Don't make users guess by submitting and failing.
- **Toast auto-dismiss**: 3-5 seconds, and toasts must not steal keyboard focus (use `aria-live="polite"`).

## Navigation (High)

- **Active state**: The current page must be visually highlighted in the sidebar. Without it, users lose orientation in a multi-page dashboard.
- **Preserve state on back**: When navigating back to a list page, preserve scroll position and active filters. Losing these forces users to re-navigate, which is especially painful with long filtered lists.
- **Breadcrumbs for depth**: Driver detail pages (Drivers > John Smith) need breadcrumbs so users can navigate back without using browser controls.
- **Separate dangerous actions**: Delete/suspend buttons should be visually distinct (red, separated) from primary actions. Proximity to common actions causes accidental destructive clicks.

## Animation (Medium)

Keep animations purposeful and brief. This is a productivity tool, not a marketing site.

- **150-300ms** for micro-interactions (button press, tooltip). Never >500ms.
- **Transform/opacity only**: Animating width/height/top/left causes layout reflow and jank.
- **Respect reduced motion**: Wrap animations in `@media (prefers-reduced-motion: no-preference)`.

## Pre-Delivery Checklist

Before considering UI work complete, verify:

- [ ] All interactive elements have visible hover/focus states
- [ ] Click targets meet 44x44px minimum
- [ ] Async operations show loading state
- [ ] Forms have visible labels, error messages near fields, required indicators
- [ ] Icons are from lucide-react (no emojis)
- [ ] Colors use Tailwind tokens (no hardcoded hex)
- [ ] Content is readable at 1024px-1920px widths
- [ ] Destructive actions have confirmation dialogs
