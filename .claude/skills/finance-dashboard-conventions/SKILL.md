---
name: finance-dashboard-conventions
description: The architecture and design-system rules for the finance-dashboard Astro + Tailwind v4 project. Use before adding or changing anything in this repo (a new tab, card, KPI, form, colour, data field, utility class or component), when reviewing a change for consistency, or when the user says "keep the design/architecture", "follow the existing patterns", "add a section like the others", or asks where something should live, even if they don't mention conventions.
---

# Finance dashboard: architecture and design conventions

This project stays easy to change because each kind of decision has one home. Before editing, find the home; after editing, check the change did not leak a decision into the wrong place.

## Architecture: where things live

| Decision | Home | Rule |
|---|---|---|
| Numbers and labels the user owns (incomes, outflows, accounts, goals, action plan) | `src/data/finance.ts` | Single source of truth. Never hard-code an amount in a component. Everything derived is computed in `src/pages/index.astro` frontmatter. |
| Shape of that data | `src/data/types.ts` | Domain types only. |
| Shapes computed for the UI (`Allocation`, `Tab`, `TabId`) | `src/types.ts` | View types only. Don't mix with domain types. |
| Formatting and pure maths (`mxn`, `pct`, frequency to monthly) | `src/lib/*.ts` | Pure functions, shared by server markup and client scripts. Don't re-implement `toLocaleString` inline. |
| Semantic colour to Tailwind classes | `src/lib/tone.ts` | Data carries a tone name (`'inflow'`); components look classes up. |
| Colours, fonts, shadows, repeated patterns | `src/styles/global.css` | Tokens and `@utility` only; see the design reference. |
| One visual section | `src/components/<Name>.astro` | Props in, markup out. No data imports inside presentational components. |
| Page composition and derived numbers | `src/pages/index.astro` | Imports data, computes, passes props. Keep it assembly, not markup. |

Component rules:
- A component takes everything it displays as props (see `FlowList`, `BalanceSheet`). Only `IncomeForm` imports helpers, and only from `lib/`.
- New tab: add the id to `TabId` and an entry in the `tabs` array in `index.astro`, then wrap the content in `<TabPanel id=... hidden>`. The first panel is visible, the rest `hidden`. `Tabs.astro` handles clicks, arrow keys and `#hash` state; do not add a second tab script.
- Client behaviour lives in a `<script>` at the bottom of the component that owns the markup, finds its root through a `data-*` attribute, and does nothing if the root is missing. Pass server data in as a `data-*` JSON attribute, not through `define:vars`, so the script stays bundled and typed.
- Hook scripts to `data-*` attributes (`data-row`, `data-total`), never to Tailwind classes, so restyling cannot break behaviour.
- Rows added by JS are cloned from a `<template>` that renders the same component as the server rows, so server and client markup cannot drift.
- Persisted client state: one namespaced, versioned localStorage key (`finance:inflows:v1`), every access in try/catch, and a visible "reset to saved profile" that restores the `finance.ts` values. Bump the version when the stored shape changes.
- Money is MXN. Amounts that can be entered at different frequencies are stored with a frequency and converted to monthly for totals; totals are always monthly, with annual shown beside them.

## Design: the short version

Banking tone: calm, tinted-navy dark theme by default with a clean light theme from `prefers-color-scheme`; one hero element per view; colour marks direction and category, not alarm. Full tokens, patterns and do/don't list are in `references/design-system.md`. Read it before touching any visual detail.

Non-negotiables:
1. Use token classes (`bg-surface`, `text-ink-2`, `border-line`, `text-inflow`...). No hex values and no raw Tailwind palette colours (`bg-gray-800`, `text-green-500`) in components.
2. Money uses the `mono` utility (tabular digits). Labels use `label`; card shells use `card`; inputs use `field`; tables use `data-table`.
3. Colour by meaning: inflow = emerald, outflow = rose, transfers/secondary = sky, passive/investing = indigo, brand actions = blue. Do not reuse a meaning colour decoratively.
4. Layout works at 390px with no horizontal scroll, and in both colour schemes.

## Change checklist

1. Identified the home for each decision in the table above.
2. No amount, label or colour literal in a component or page that belongs in `finance.ts`, `tone.ts` or `global.css`.
3. New repeated class pattern (3+ uses)? Make it an `@utility` instead of copying class strings.
4. `npm run build` passes; run the `headless-ui-check` skill for dark, light and 390px, and click through every tab touched. Types are checked by the build only (TypeScript is not installed), so state that rather than claiming a type check.
5. If you introduce a new convention, add it here or to the reference so the next change follows it.

## Known loose ends (do not "fix" silently, ask first)

- The top KPI cards read `finance.ts`, not the live values in the Inflows form.
- The family-support row is stored as a monthly 2600 with the weekly maths in its label.
- Both `package-lock.json` and `pnpm-lock.yaml` exist; use `npm` unless told otherwise.
- The projection/goals section and its script were removed; `goals` and `defaults` remain in `finance.ts` for a future restore.
