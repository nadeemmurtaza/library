# Untitled UI Integration Guide

Untitled UI is the world's most popular UI kit and design system, built for Figma and React with Tailwind CSS and React Aria.

## Architecture

| Directory | Contents |
|---|---|
| `components/ui/untitledui/` | Atomic primitives: buttons, inputs, avatar, badges, checkboxes, dropdowns, forms, selects, sliders, tags, toggles, tooltips |
| `components/layout/untitledui/` | Application layout & navigation: mobile headers, sidebar navigation (dual-tier, slim, simple, section dividers), header navigation |
| `components/patterns/untitledui/` | Complex patterns: charts (activity gauges, bar, line, pie, progress, radar), date-pickers, tables, modals, slideouts, marketing sections |
| `components/common/untitledui/` | Cross-surface composites: carousels, empty states, credit cards, loading indicators |
| `assets/icons/untitledui/` | 1,173 clean, consistent SVG icons with indexed manifest |
| `assets/logos/untitledui/` | Integration logos, payment method logos, social brand icons |
| `assets/illustrations/untitledui/` | Background patterns and SVG illustrations |
| `tokens/untitledui/` | CSS tokens (`tokens.css`, `theme-v8.css`, `theme-v7.css`), W3C design tokens (`tokens.json`), palette colors (`colors.json`) |
| `schemas/untitledui/` | JSON Schemas for registry items and design tokens, Zod schemas for theme & component contracts |
| `utils/untitledui/` | Core helpers: `cx`, `is-react-component` |
| `hooks/untitledui/` | Stateful hooks: `use-breakpoint`, `use-clipboard` |

## Using Design Tokens

Import the tokens into your stylesheet or layout:

```css
@import "../tokens/untitledui/tokens.css";
```

All colors follow Untitled UI's semantic palette:
- `--color-brand-50` to `--color-brand-950`
- `--color-gray-50` to `--color-gray-950`
- `--color-error-50` to `--color-error-950`
- `--color-warning-50` to `--color-warning-950`
- `--color-success-50` to `--color-success-950`

## Icons

1,173 SVG icons are located in `assets/icons/untitledui/`. Consult `assets/icons/untitledui/index.json` for the full index of icon names and paths.
