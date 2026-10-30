# Design system reference

Source of truth is `src/styles/global.css`. If this file and the CSS disagree, the CSS wins; then fix this file.

## Tokens

| Token (Tailwind name) | Dark (default) | Light |
|---|---|---|
| canvas (`bg-canvas`) | #0B0F17 | #F8FAFC |
| surface (`bg-surface`) cards | #131B2A | #FFFFFF |
| surface-2 (`bg-surface-2`) inputs, nested, hover | #1B2538 | #F1F5F9 |
| line (`border-line`) | #26354D | #E2E8F0 |
| ink / ink-2 / ink-3 (`text-ink*`) primary, secondary, muted | #F8FAFC / #94A3B8 / #64748B | #0F172A / #475569 / #94A3B8 |
| brand (`bg-brand`, hover `brand-hover`) | #3B82F6 / #2563EB | #2563EB / #1D4ED8 |
| inflow | #10B981 | #059669 |
| outflow | #F43F5E | #E11D48 |
| transfer | #38BDF8 | #0284C7 |
| passive | #818CF8 | #4F46E5 |
| chart-teal / amber / pink (Investments donut only) | #2DD4BF / #FBBF24 / #F472B6 | #0D9488 / #D97706 / #DB2777 |

Light values for brand, transfer and passive were derived (the spec did not give them). Contrast was not measured.

Shadow `shadow-card` is a faint top highlight plus soft drop in dark, a light drop in light. Font: Inter only, self-hosted (`public/fonts`, latin and latin-ext subsets, declared at the top of `global.css`); never load it from Google Fonts or any other host, the CSP blocks it. Never pure black.

## Utilities (all in global.css)

`card` shell (surface, 1px line, `rounded-2xl`, shadow, p-5) · `mono` tabular figures, semibold · `label` small uppercase secondary caption · `sub` secondary helper text under a heading · `dot` category dot · `data-table` tables with quiet header and row dividers · `field` filled input (surface-2, line border, rounded-lg, blue border and ring on focus).

## Patterns

- **Hero card**: `border-inflow/30 ring-1 ring-inflow/20 bg-linear-to-br from-inflow/10 via-surface to-surface`. Used for the monthly balance KPI, the Balance tab total (swaps to the outflow tint when negative) and each form total (tinted by the form's tone via `tones[tone].hero`). One per view region.
- **Direction badge** (KPI inflow/outflow): 20px rounded square, `bg-<tone>/12 text-<tone>`, arrow icon. The amount itself stays `text-ink`.
- **Status dot** next to a muted note (`Debt: $0`): emerald when healthy, rose when not.
- **Category badge**: `rounded-full px-2.5 py-1 text-[13px] font-semibold ring-1` + `tones[tone].badge`, with a 6px dot.
- **Tabs**: segmented pill in a `bg-surface` rounded-xl track; active = `bg-surface-2 text-ink ring-1 ring-line`; inactive = `text-ink-2` with hover.
- **Allocation bars**: 12-14px full-round bars with 2px gaps; colours come from tokens (`bg-inflow` savings, `bg-outflow` obligations, `bg-passive` investing).
- **Action chips**: `bg-brand/12 text-brand ring-1 ring-brand/25` rounded-full.
- **Primary text button** ("+ Add income"): `text-brand hover:bg-brand/10 rounded-lg`, not an underline link.
- **Destructive affordance**: muted until hover, then `text-outflow bg-outflow/10`.

## Do / don't

- Do put a new semantic colour in `:root`, both schemes, `@theme inline`, and `tone.ts` together.
- Do keep all colour utilities spelled out in full (`bg-inflow/12`), never built from string pieces; Tailwind cannot see those.
- Don't colour an amount red or green just to be noticeable; use a badge or dot next to it.
- Don't add a dark-mode class toggle without deciding it with the user; theme currently follows the OS.
- Don't introduce a second font, a pure-black or pure-white background, or a new border colour.
- Don't add new bright accent hues; extra categories reuse the existing four tones or the `neutral` tone (`ink-3`).
