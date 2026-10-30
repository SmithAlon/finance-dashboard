# Decisions and open items

Product decisions that are not obvious from the code. Newest first. Update this file when one changes.

## Decided (2026-10-30)

- **Portfolio counts toward net worth**, valued at the latest USD→MXN rate. Built: liquid net worth = accounts + portfolio + fixed income − credit owed, with PPR excluded (locked until retirement) and "can't compute" when an investment has no value. The rate's age is shown in the portfolio note, and a warning appears above the totals once it is more than 7 days old (`FX_STALE_DAYS` in `src/lib/fx.ts`).
- **Unknown is not zero.** A balance the user has not entered stays "unknown": totals are marked partial and real capital shows "can't compute". Never coerce to 0.
- **Savings routines are entered by the user**, never seeded or hardcoded. A routine is a transfer into assets (it shows on the Investments side), not an expense, so it does not change the Balance tab or net worth. It is a fixed amount plus a frequency, including "twice a month". Today it lives on a PPR row.
- **Currency is per account.** The user picks one display currency (MXN, USD or EUR). Each account has its own currency, and incomes can too; everything is converted to the display currency for totals. Not built yet.
- **Portfolio data comes from GBM's CSV export**, not a market feed. Only USD→MXN is fetched (Frankfurter, at build time).
- **`finance.ts` and the seed CSV are sample data** for a fictional user. Real numbers stay out of the repo.

## Open

- **Currency PR.** About 11 files call `mxn()`. It needs a currency on every account and income, a table of rates (not only USD→MXN), and a localStorage migration that defaults old entries to MXN. Start display-only, then per-account.
- **PPR tax deduction.** Needs annual income and the year's UMA; look the UMA up, don't guess. Decide whether it belongs in a yearly estimate rather than the monthly projection.
- **Action plan.** The full list is in `actionPlan` but only the card-utilization step is rendered. Restore a section or drop the unused items.
- **Goals.** The trip goal has no date and nothing records how much is already saved. Dropped for now.
- **MSI headings** show even when a card has no MSI purchases.
- **"As of" date** in the header is the static `goals.today`, not the real date.
