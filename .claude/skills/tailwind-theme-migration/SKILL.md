---
name: tailwind-theme-migration
description: Re-theme a Tailwind CSS v4 project (e.g. Astro, Vite) onto a new design language using semantic design tokens, with dark default plus light mode, and migrate every component to the new token names. Use when the user wants to restyle, rebrand or "modernise the look" of a Tailwind app, supply a colour palette or token list, move from a developer or terminal aesthetic to a banking, SaaS or editorial one, or add semantic colours such as inflow/outflow, success/danger or status badges, even if they never say "design tokens".
---

# Tailwind v4 theme migration

The aim is that colour decisions live in one place and components say what a colour *means*, so the next re-theme touches one file.

## Approach

1. **Inventory first.** Grep every token use before editing (`bg-`, `text-`, `border-`, `ring-`, `outline-`, `var(--...)`, hex literals, and class strings stored in data files such as `color: 'bg-sav'`). Hard-coded hexes and classes inside data or TypeScript are the ones a rename sweep misses.
2. **Define tokens once, in two layers, in the global stylesheet:**
   - Raw CSS variables on `:root` (`--canvas`, `--surface`, `--surface-2`, `--line`, `--ink`, `--ink-2`, `--ink-3`, `--brand`, plus semantic ones like `--inflow`, `--outflow`). Inline styles and chart code can read these.
   - A `@theme inline` block mapping them to Tailwind colours (`--color-canvas: var(--canvas)`), so `bg-canvas`, `text-ink-2`, `border-line` work and still follow the variable when it changes per theme.
3. **Dark default, light by preference.** Put the dark values on `:root` with `color-scheme: dark`, and override them inside `@media (prefers-color-scheme: light)`. Use the user's exact values. When the spec gives light values for only some tokens, derive the rest by darkening saturated colours until text on white reaches about 4.5:1 (emerald `#10B981` becomes `#059669`, sky `#38BDF8` becomes `#0284C7`), and say which ones you chose.
4. **Name by meaning.** Layers: canvas, surface, surface-2, line. Text: ink, ink-2, ink-3. Action: brand. Cashflow or status: inflow, outflow, transfer, passive. Avoid names that describe the old look.
5. **One tone map for semantic colour.** Tailwind scans source text, so `bg-${tone}` never generates CSS. Keep a record such as `tones = { inflow: { dot: 'bg-inflow', text: 'text-inflow', badge: 'bg-inflow/12 text-inflow ring-inflow/25' }, ... }` in one module with complete class strings, and have data carry only the tone name (`tone: 'inflow'`).
6. **Sweep components mechanically**, then restyle the few that need structure (cards, tabs, inputs, badges). Use `@utility` for patterns repeated three or more times (`card`, `field`, `label`, `data-table`) so the look can be changed in one place.
7. **Verify, don't assume.** Grep for leftover old token names (the build will not fail on an unknown utility class). Then run the `headless-ui-check` skill: dark, light, phone width, and every tab.

## Design choices that keep it "trusted", not "flashy"

- Tinted slate-navy surfaces, never pure black; borders one step lighter than the surface, 1px.
- Depth from a faint top highlight and soft shadow, not heavy glow. Give a single hero element (the key metric) an accent border or ring; give everything else the neutral treatment.
- Amounts in the same colour as body text by default. Colour the *direction* (a small arrow badge, a status dot) instead of the number, so spend reads as information, not alarm.
- Financial figures use `tabular-nums` so columns align; a proportional sans with tabular digits looks more polished than monospace.
- Inputs get their own filled `surface-2`, a visible hover border, and a `focus:border-brand ring-1 ring-brand` state.
- Badges: `bg-<tone>/12` fill, `text-<tone>`, `ring-1 ring-<tone>/25`.

## Report back with

The token table you used, which light-mode values you derived, and what you could not verify. Do not claim contrast compliance you did not measure.
