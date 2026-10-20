# Library: guide for AI agents

Reusable UI library: components, CSS, tokens, themes, templates, schemas, skills, design systems, assets.
Everything is indexed. Do not walk the tree: search it.

## 1. Find (cheapest first)

1. Read `registry/llms.txt` once (about 3k tokens): categories, subcategories, every folder unit by name.
2. Search, ranked, with one-line descriptions:
   ```bash
   npm run find -- <words>                      # names, tags, descriptions; folders shown as one result
   npm run find -- -c design-systems saas dark  # restrict to a category
   npm run find -- -l typescript table          # restrict by language
   npm run find -- --files <words>              # list individual files, not folders
   npm run find -- --json <words>               # machine-readable
   ```
   If no item contains every word you get partial matches, ranked. Use fewer, plainer words.
3. Look inside a result:
   ```bash
   npm run find -- --show <path>                # file: first 200 lines. folder: its files + descriptions
   npm run find -- --show <path> --lines 500
   ```
4. Grep `registry/llms-full.txt` for one line per item (name, files, description, entry path).

Machine files: `registry/catalog.json` (every file), `registry/units.json` (folder units), `registry/by-category/*.json`, `registry/by-industry/*.json`, `registry/quick-lookup.json`.

## 2. Where things live

| Need | Look in |
|---|---|
| UI components (daisyUI css + `.example.html`, TSX, banners, sections, BI charts) | `components/`, `styles/components/` |
| Full pages, dashboards, modules | `templates/`, `dashboards/`, `modules/` |
| Colours, themes, radii, breakpoints | `tokens/` (`brand-theme.css` is the client theme) |
| Brand / locale values | `config/brand.ts` only |
| Design systems (DESIGN.md + tokens + fixtures) | `design-systems/<source>/<name>/` |
| Visual styles with live demos | `design-trends/<slug>/` |
| AI skills and playbooks | `skills/` |
| Datasets (styles, palettes, fonts, UX rules) | `data/` |
| Validation schemas | `schemas/` |
| Icons, logos, fonts, images | `assets/` |
| Utils, hooks, providers, constants | `utils/ hooks/ providers/ constants/` |
| Business/domain rules (pricing, discounts, risk, permissions, theme-contrast engine) | `rules/<source>/` |
| Project-specific page styles and motion/effect CSS (not the shared design system) | `styles/<source>/` (e.g. `styles/roya-storefront`, `styles/miles`, `styles/urb`) |
| Full static page mockups (`.dc.html`) | `templates/roya-pages/`, `templates/miles-pages/{dark,light}/` |

A folder unit is one design system, skill, example, trend or template: its entry file is `DESIGN.md`, `SKILL.md`, `README.md` or the first html.

## 3. Rules when using or adding code

- No hardcoded brand, locale or design values. Colours/radii come from `tokens/`, identity and locale from `config/brand.ts`. One system, no prefixed forks.
- Reuse before writing: search first, copy or import, then adapt.
- Each page has one main job and opens on an overview; detail is one click down.
- Licences: daisyUI MIT, ui-ux-pro-max MIT, bencium MIT, open-design Apache-2.0 (keep `vendor/*/LICENSE`). `assets/fonts/telegraf` is a commercial font: confirm a licence before shipping.
- Adding files: put them in the right directory, then run `npm run catalog`. Descriptions, units, llms.txt and indexes regenerate. Never hand-edit `registry/`.
- Browse visually: `npm run viewer` (http://localhost:4173, live-updates). Tests: `npm test`.

## 4. Commands

```bash
npm run find -- <words>      # search
npm run catalog              # rebuild all registry files
npm run viewer               # visual browser
npm test                     # admin-kit tests
```
