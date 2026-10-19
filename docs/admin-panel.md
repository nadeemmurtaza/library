# Admin panel kit

Framework-free building blocks for a back office. Plain ES modules (no build step for the JS), daisyUI + Tailwind v4 for the look, every colour from the active daisyUI theme, every locale value from config.

## What is in it

| Folder | Item | Use |
|---|---|---|
| `utils/` | `html`, `cn`, `money`, `dates`, `storage`, `csv`, `slug`, `validate` | escaping templates, locale-bound formatters, failure-tolerant storage, CSV/JSON export, a JSON-Schema subset validator |
| `constants/` | `roles`, `statuses`, `admin-routes` | role→permission map and `can()`, order/payment/enquiry status flows, the nav |
| `schemas/` | product, order, customer, promo, enquiry | JSON Schema, shared by forms and (later) the API |
| `types/` | `admin.d.ts` | shared contracts |
| `lib/` | `collection-store`, `activity-log` | client-side collections with the API a server client should keep (`all/get/insert/update/remove/subscribe`) |
| `hooks/` | `use-table`, `use-selection` | search, filter, sort, paginate, select, without a framework |
| `providers/` | auth, theme, toast, confirm | demo session with roles, light/dark, toasts, promise-based confirm |
| `components/ui` | icons, badge, field, drawer | accessible primitives |
| `components/common` | stat-card, charts, page-header, image-upload | KPI tile, SVG bar/donut/sparkline, empty state, image downscale |
| `components/layout` | admin-shell | sidebar + top bar + mobile drawer + hash router + route guard + global search |
| `components/patterns` | data-table, order-timeline, invoice | sortable/filterable/paginated table with bulk actions, order progress, printable invoice |
| `styles/components/admin` | `admin.css` | the anatomy CSS for all of the above |
| `templates/pages/admin` | `index.html`, `app.example.js` | the page and the wiring |

## Rules it follows
- No brand or locale literal in code: `createMoney`, `createDates` and the theme names take config.
- Responsive from 280px: the sidebar becomes a drawer, tables become cards under 640px, the drawer becomes a bottom sheet.
- Accessible: labelled fields with `aria-invalid`/`role=alert` errors, `<dialog>` focus handling, skip link, visible focus, reduced-motion respected.
- Escape by default: the `html` tag escapes interpolations; use `raw()` only for markup you built.

## Not security
`providers/auth-provider.js` is a prototype session. A static site cannot protect data. For production, authenticate on a server (or behind an access gateway) and keep the same `session()/can()` surface.

## Build the CSS
`npm run admin:css` writes `dist/admin.css` from `styles/admin.css`. A consumer copies `styles/` and `tokens/`, swaps `tokens/brand-theme.css` for its own theme, and adds `@source` lines for its view folders.
