# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page personal finance dashboard (MXN) built with Astro 7 and Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config`). Everything renders from `src/pages/index.astro`; there is no backend. User-edited values persist in the browser's localStorage only.

## Commands

Use `npm` (both `package-lock.json` and `pnpm-lock.yaml` exist; npm is the default, and both lockfiles install and build cleanly). On the maintainer's machine `npm` may be a shell alias for `pnpm`: to check `package-lock.json` the way CI and hosts do, call npm by its path (`$(dirname $(command -v node))/npm ci`).

- `npm run dev`: dev server
- `npm run prices`: refresh `src/data/prices.json`, the build-time snapshot of ECB exchange rates from Frankfurter (USD and MXN per EUR). The browser fetches fresher rates itself; the snapshot is the fallback. It also runs as `prebuild`; on failure it keeps the previous snapshot and never fails the build. Holdings and their prices come from the GBM CSV export (`src/data/gbm-portfolio.csv`, or imported in the Investments tab), not from a market feed.
- `npm run build`: static build to `dist/`. This is also the only type check: TypeScript is not installed, so don't run `npx tsc` (it prompts to install) and run `astro check` only under `timeout`, since it can hang.
- `npm run preview`: serve the built `dist/`

There is no test suite or linter. To verify UI changes, build, serve over HTTP (not `file://`, because asset paths are absolute), and use the `headless-ui-check` skill (`.claude/skills/headless-ui-check/scripts/shoot.mjs`) to screenshot dark, light and 390px widths and click through the tabs you touched.

## Architecture

**Read the `finance-dashboard-conventions` skill before changing anything.** It is the authoritative guide (`.claude/skills/finance-dashboard-conventions/SKILL.md`, with the design tokens in `references/design-system.md`). It also lists known loose ends that you should ask about before "fixing". In brief:

- **Data flow:** the server renders a blank first visit (`src/data/blank.ts`); `src/data/finance.ts` is demo data, passed to each editor as `data-demo` and loaded only in demo mode (`src/lib/mode.ts`, key `finance:mode:v1`). Types are in `src/data/types.ts`. `index.astro` imports both and passes props down. Presentational components never import data. View-only types live in `src/types.ts`, separate from the domain types.
- **Pure helpers** in `src/lib/` (`format.ts` for `fmt`/`dash`/`pct`, `currency.ts` for rates and conversion, `display.ts` for the display currency and live rate table, `income.ts` for frequency-to-monthly conversion, `tone.ts` for mapping a semantic tone to classes, `projection.ts` for debt and cash-flow projection, `flows.ts` for `readFlow`, `gbm.ts` for the GBM CSV parser, `investments.ts` for portfolio/fixed-income/PPR maths, `networth.ts` for liquid net worth, `accounts.ts` for account totals, `mode.ts` for blank/demo mode, `backup.ts` for the backup file, `fx.ts` for the age of the rates) are shared by server markup and client scripts.
- **Tabs:** the KPI cards (in `Headline.astro`, live) are the top-level tablist (Balance, Debt, Accounts, Investments), and each tab's content is a `<TabPanel>`. `Tabs.astro` drives every `[role=tablist]` on the page, including nested ones. Only the list marked `data-hash` syncs `location.hash`.
- **Interactive forms:** `FlowForm.astro` is the generic categorised money-list editor (incomes, expenses); `AccountsForm.astro` edits bank accounts (`finance:accounts:v1`, read with `readAccounts`). `CreditAccounts.astro` edits credit cards (with MSI plans) and loans; its maths and wording live in `src/lib/credit.ts`. Both persist to `localStorage` (`finance:<id>:v2`, credit `finance:credit:v3`), write live state to `data-state` and fire a bubbling `flowchange`. `Headline`, `BalanceView`, `DebtCalculator` and `DebtSummary` read them via `readFlow(id)` / `readCredit(id)` and re-render on `flowchange`.
- **Investments:** `Investments.astro` holds a GBM portfolio imported from CSV (read-only), typed-in fixed income, and PPRs that carry a user-entered savings routine (amount + frequency). Liquid net worth is accounts + portfolio + fixed income − credit owed; PPR is excluded. A USD→MXN rate older than 7 days shows a warning. Details are in the conventions skill.
- **Unknown ≠ zero:** an unentered balance is `null`. Totals that include one are marked partial, and real capital shows "can't compute". Never coerce it to 0.
- **Client scripts** sit at the bottom of the component that owns the markup. They find their root and hooks through `data-*` attributes (never Tailwind classes) and receive server data as `data-*` JSON, not `define:vars`.
- **Styling:** use only the semantic tokens and the `@utility` classes defined in `src/styles/global.css` (`card`, `field`, `label`, `mono`, `data-table`…). Don't use hex values or raw Tailwind palette colours in components. The theme is dark by default, with light mode via `prefers-color-scheme`.

## Deploying

See `DEPLOY.md`. The page may load nothing from another host except the exchange-rate API: fonts are self-hosted in `public/fonts`, scripts are never inlined (`assetsInlineLimit: 0`), and the Content-Security-Policy lives in both `public/_headers` and `src/layouts/Base.astro` (keep them identical). CI (`.github/workflows/build.yml`) builds every PR and fails on any other host in the page.

## Docs

`README.md` is for users and contributors (with the known limitations), `CONTRIBUTING.md` holds the contribution rules, `DEPLOY.md` the hosting steps; `docs/decisions.md` records product decisions and open items (update it when one changes). `src/data/finance.ts` and `gbm-portfolio.csv` are sample data for a fictional user: keep real numbers out of the repo. Licensed MIT.

## Repo quirks

`.gitignore` keeps `dist/`, `node_modules/`, `.astro/`, env files and personal exports (CSV or PDF at the repo root, `exports/`, `finance-backup-*.json`) out of git. The history was squashed before the repo went public because older commits held real figures: never commit a real balance, name or broker export, including inside a build.
