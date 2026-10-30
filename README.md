# Finance dashboard

A single-page personal finance dashboard built with Astro and Tailwind CSS v4. It runs entirely in the browser: there is no backend, no account, and nothing leaves your machine. Whatever you edit is saved in your browser's localStorage.

It shows four tabs: **Balance** (incomes and expenses), **Debt** (credit cards, MSI plans and loans), **Accounts**, and **Investments** (a GBM portfolio, fixed income and retirement plans).

> The figures in `src/data/finance.ts` and `src/data/gbm-portfolio.csv` are **sample data** for a fictional user. Replace them with your own.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # static site in dist/
npm run preview  # serve dist/
```

`npm run build` first refreshes the USD→MXN rate (`npm run prices`, from the Frankfurter API). If that fails it keeps the last rate and the build still succeeds.

## Make it yours

- **Incomes, expenses, accounts:** edit them in the page, or change the starting values in `src/data/finance.ts`. Edits in the page stay in your browser; the file is only the starting point, and each form has a "Reset to saved profile" button.
- **Portfolio:** in the GBM app, open your portfolio, download its detail as CSV, and use **Import** in the Investments tab. The dollar account is converted to pesos with the build-time rate.
- **Retirement plan savings:** add a plan under Investments → PPR, type what you add each time and how often (for example 583 twice a month).
- **A value you don't know:** leave it blank. It shows as missing and totals are marked partial; the dashboard never treats an empty field as 0.

## Privacy

Nothing is sent anywhere except the exchange-rate request made at build time. Your edits live in localStorage, which is per browser and per site. Don't commit real balances or a real broker export to a public repo.

## Project notes

- `CLAUDE.md` and `.claude/skills/finance-dashboard-conventions/` describe the architecture and design rules.
- `docs/decisions.md` lists product decisions and what is still open.
- Money is shown in MXN today; multi-currency is planned (see the decisions file).

## License

[MIT](LICENSE)
