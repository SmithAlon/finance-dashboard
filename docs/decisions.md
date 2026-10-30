# Decisions and open items

Product decisions that are not obvious from the code. Newest first. Update this file when one changes.

## Decided (2026-10-30)

- **Free static hosting, no third-party requests.** Cloudflare Pages is the recommended host (`DEPLOY.md`), GitHub Pages the alternative. Inter is self-hosted, scripts are never inlined, and a strict CSP (`public/_headers` plus a `<meta>` copy) allows only the site itself and `api.frankfurter.dev`.

- **Backups replace sync.** Export/Import of all `finance:*` keys as one versioned JSON file, optionally encrypted with a passphrase (Web Crypto, no dependency). Import validates, refuses newer formats, and confirms before replacing.

- **A first visit starts blank.** The demo (`finance.ts`) loads only from "Load demo data", with a banner until the visitor starts blank. The choice is `finance:mode:v1`; visitors with data saved from before are treated as their own data. Accounts became an editable list (`finance:accounts:v1`), and the projection's starting cash may be left blank (unknown).

- **Portfolio counts toward net worth**, valued at the latest USD→MXN rate. Built: liquid net worth = accounts + portfolio + fixed income − credit owed, with PPR excluded (locked until retirement) and "can't compute" when an investment has no value. The rate's age is shown in the portfolio note, and a warning appears above the totals once it is more than 7 days old (`FX_STALE_DAYS` in `src/lib/fx.ts`).
- **Unknown is not zero.** A balance the user has not entered stays "unknown": totals are marked partial and real capital shows "can't compute". Never coerce to 0.
- **Savings routines are entered by the user**, never seeded or hardcoded. A routine is a transfer into assets (it shows on the Investments side), not an expense, so it does not change the Balance tab or net worth. It is a fixed amount plus a frequency, including "twice a month". Today it lives on a PPR row.
- **Currency is per account.** The user picks one display currency (MXN, USD or EUR). Each account has its own currency, and incomes can too; everything is converted to the display currency for totals. Built: display currency (totals kept in pesos, converted when shown; rates fetched by the browser from Frankfurter with a build-time snapshot as fallback), and a currency on every account and on every income and expense line. Rows saved before this have no `currency` and read as MXN, so no data was migrated or lost.
- **Credit, fixed income and PPR stay in pesos.** Mexican cards, MSI plans, loans, CETES and PPRs are peso-denominated, so their inputs are MXN-only and labelled so; their totals still show in the display currency.
- **Portfolio data comes from GBM's CSV export**, not a market feed. Only exchange rates are fetched (Frankfurter, in the browser, with a build-time snapshot).
- **`finance.ts` and the seed CSV are sample data** for a fictional user. Real numbers stay out of the repo.

## Open

- **PPR tax deduction.** Needs annual income and the year's UMA; look the UMA up, don't guess. Decide whether it belongs in a yearly estimate rather than the monthly projection.
- **Action plan.** The full list is in `actionPlan` but only the card-utilization step is rendered. Restore a section or drop the unused items.
- **Goals.** The trip goal has no date and nothing records how much is already saved. Dropped for now.
- **MSI headings** show even when a card has no MSI purchases.
- **"As of" date** in the header is the static `goals.today`, not the real date.
