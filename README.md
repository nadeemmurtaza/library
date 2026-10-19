# Library

AI agents: start at [AGENTS.md](AGENTS.md) and `registry/llms.txt`.

Single home for every reusable piece: components, CSS, scripts, schemas, functions, assets.

## Layout

| Dir | Holds |
|---|---|
| `config/` | per-deployment values: brand file (identity, contact, locale, theme) |
| `tokens/` | colour, radius, spacing, type, motion tokens. One source |
| `constants/` | routes, enums, permission keys |
| `types/` | shared contracts |
| `schemas/` | validation schemas (zod / JSON Schema) |
| `lib/` | configured singletons: api client, db, sdk |
| `utils/` | pure helpers: cn, dates, currency |
| `functions/` | standalone/serverless functions, reusable business logic |
| `hooks/` | reusable stateful logic |
| `providers/` | context layers |
| `scripts/` | browser/node/build scripts |
| `styles/` | `base/` reset+globals, `components/` component look, `utilities/` |
| `components/ui` | atomic primitives |
| `components/common` | cross-surface composites |
| `components/layout` | shells, grids, page anatomy |
| `components/patterns` | object pages, tables, workflows |
| `assets/` | icons, images, fonts, illustrations, logos |
| dashboards/ | production analytics, SaaS, e-commerce, fintech, and admin dashboards |
| modules/ | self-contained business modules (auth, billing, analytics, notifications) |
| design-systems/ | upstream design system guides (Untitled UI, DaisyUI, UI/UX Pro Max, Bencium) |
| `templates/` | page + email templates |
| `snippets/` | small copy-paste fragments |
| `examples/` | usage demos |
| `design-trends/` | 101 UI design styles: guide `.md`, standalone `.demo.html` + css, screenshot (from trends.daisyui.com) |
| `design-systems/` | design systems as Markdown (DESIGN.md style) |
| `data/` | datasets (CSV/JSON): UI styles, palettes, fonts, icons, UX rules, stack guides |
| `skills/` | AI skills (design, brand, slides, ui-styling...) |
| `vendor/` | upstream licences + tooling kept verbatim |
| `docs/` | conventions, how-to |
| `tests/` | tests |
| `registry/catalog.json` | index of every item in library |

## Rules
- No brand/locale/design literals in code. Import from `config/` and `tokens/`.
- One system, no prefixed forks.
- New item = add file + entry in `registry/catalog.json`.

## Viewer
`npm run viewer` then open http://localhost:4173. Watches the library: any file added to a catalogued dir rebuilds `registry/catalog.json` and the preview CSS, and open pages refresh themselves. `npm run catalog` rebuilds the catalog alone.

## Sources
- nexu-io/open-design via opendesigner.io (Apache-2.0, licence in `vendor/open-design/`): `skills/open-design`, `design-systems/open-design` (152 systems), `templates/open-design-*`, `data/open-design`, `examples/open-design-mocks`, `assets/images/open-design`, `docs/open-design`. Product code (apps, plugins, e2e, tools) not imported.
- bencium/bencium-marketplace (MIT) in `skills/bencium-marketplace`; bencium.io llms/aeo data in `data/bencium`; Telegraf fonts in `assets/fonts/telegraf` (commercial font, see its NOTICE.md)
- daisyUI 5.7.50 (MIT), trends.daisyui.com
- nextlevelbuilder/ui-ux-pro-max-skill (MIT, upstream licence in `vendor/ui-ux-pro-max-skill/LICENSE`) + uupm.cc pet-grooming demo. Duplicate copies in upstream (`cli/assets`, `.claude/skills` data) were collapsed to one; upstream site fonts and partner logos not imported.
- Untitled UI (MIT, upstream licence in `vendor/untitledui/LICENSE`), untitledui.com & untitleduico (React components, 1,173 icons, design tokens, schemas, navigation, patterns, marketing sections).
