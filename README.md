# Finance dashboard

A single-page personal finance dashboard built with Astro and Tailwind CSS v4. It runs entirely in the browser: there is no backend, no account, and nothing leaves your machine. Whatever you edit is saved in your browser's localStorage.

It shows four tabs: **Balance** (incomes and expenses), **Debt** (credit cards, MSI plans and loans), **Accounts**, and **Investments** (a GBM portfolio, fixed income and retirement plans).

A first visit starts blank. **Load demo data** fills it with a fictional person's finances (`src/data/finance.ts` and `src/data/gbm-portfolio.csv`) so you can see how it works; a banner says so until you choose **Start blank**.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # static site in dist/
npm run preview  # serve dist/
```

`npm run build` first refreshes the USD→MXN rate (`npm run prices`, from the Frankfurter API). If that fails it keeps the last rate and the build still succeeds.

## Make it yours

- **Incomes, expenses, accounts:** type them in the page. They stay in your browser. **Erase everything** at the bottom of the page removes all of it.
- **Portfolio:** in the GBM app, open your portfolio, download its detail as CSV, and use **Import** in the Investments tab. The dollar account is converted to pesos with the build-time rate.
- **Retirement plan savings:** add a plan under Investments → PPR, type what you add each time and how often (for example 583 twice a month).
- **A value you don't know:** leave it blank. It shows as missing and totals are marked partial; the dashboard never treats an empty field as 0.

## Backups and moving to another device

There is no sync. At the bottom of the page, **Export backup** downloads one JSON file with everything you entered; **Import backup** in another browser (or after clearing this one) puts it back, after showing what the file holds and asking before it replaces anything. Add a passphrase to encrypt the file (AES-GCM in your browser); without the passphrase it can't be opened, so don't lose it.

## Privacy and security

Your financial data stays in your browser. There is no server, account or analytics: what you type is saved in localStorage, which belongs to one browser on one device and one site. The only network request is the exchange rate, which carries no data of yours.

If you fork or contribute:

- Never commit real balances, names or a real broker or bank export. `.gitignore` blocks the usual places (CSV or PDF files at the repo root, `exports/`, `finance-backup-*.json`), but it can't catch a real number typed into `src/data/finance.ts`.
- `dist/` is not committed. A build bakes the sample data into the HTML, so a committed build can leak whatever the source held at that moment.
- To report a security problem, open a GitHub issue without personal data, or contact the maintainer through their GitHub profile.

## Project notes

- `CLAUDE.md` and `.claude/skills/finance-dashboard-conventions/` describe the architecture and design rules.
- `docs/decisions.md` lists product decisions and what is still open.
- Money is shown in MXN today; multi-currency is planned (see the decisions file).

## License

[MIT](LICENSE)
