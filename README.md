# Finance dashboard

A personal finance dashboard that runs entirely in your browser. Track what comes in and goes out, what you hold in each account, what you owe on cards and loans, and what you have invested, in pesos, dollars or euros. There is no account to create and no server: your figures are saved in your browser and never sent anywhere.

It has four tabs:

- **Balance:** incomes and expenses at any frequency (weekly, twice a month, yearly…), turned into a monthly balance.
- **Debt:** credit cards with interest-free installment plans (MSI) and loans, what is due this month, and a month-by-month projection of cash against what you owe.
- **Accounts:** bank and savings balances, each in its own currency.
- **Investments:** a GBM portfolio imported from its CSV export, fixed income (CETES, funds, term deposits) and retirement plans (PPR).

## Using it

- **First visit:** the dashboard starts empty. Choose **Enter my numbers**, or **Load demo data** to explore with a fictional person's finances; a banner marks the demo until you choose **Start blank**.
- **A value you don't know:** leave it blank. It shows as missing and the totals that depend on it are marked partial or "can't compute". The dashboard never treats an empty field as 0.
- **Currencies:** pick MXN, USD or EUR at the top for totals. Each account and each income or expense line has its own currency and is converted at the European Central Bank's reference rate. Cards, loans, fixed income and PPRs are entered in pesos.
- **GBM portfolio:** in the GBM app, open your portfolio, download its detail as CSV, and use **Import** in the Investments tab.
- **Retirement plan savings:** under Investments → PPR, type what you add each time and how often (for example 583 twice a month).
- **Backups and other devices:** there is no sync. At the bottom of the page, **Export backup** downloads one file with everything you entered, and **Import backup** puts it back in another browser, after showing what the file holds and asking before it replaces anything. Add a passphrase to encrypt the file (AES-GCM, in your browser); without the passphrase it can't be opened, so keep it safe.
- **Erase everything** at the bottom of the page removes all of it from this browser.

## Privacy

Your financial data stays in your browser's localStorage, which belongs to one browser, on one device, for one site. There is no server, account, analytics or tracking. The page makes one request to another site: it asks [Frankfurter](https://frankfurter.dev) for exchange rates, and that request carries none of your data. A strict Content-Security-Policy blocks every other outside connection.

Clearing your browser's site data deletes your figures. Export a backup first.

## Known limitations

- **No sync.** Each browser has its own copy; move data with Export and Import.
- **Per-browser data.** Private windows, another browser profile or clearing site data start empty.
- **Rates are ECB reference rates** via Frankfurter, published once per working day: not your bank's rate, and not Banxico's FIX. If the page can't reach Frankfurter it uses the rates from the last build and warns once they are more than 7 days old.
- **Currencies:** MXN, USD and EUR only. Credit, fixed income and PPR are pesos only.
- **Mexico-specific features:** MSI plans, PPRs and the GBM import assume Mexican products.
- **The "As of" date** in the header is fixed in the code, not today's date.

## Contributing

Bug reports and pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). In short:

```bash
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # static site in dist/ (also the type check)
npm run preview  # serve dist/
```

`npm run build` first refreshes the exchange-rate snapshot (`npm run prices`). If that fails it keeps the last snapshot and the build still succeeds.

- `CLAUDE.md` and `.claude/skills/finance-dashboard-conventions/` describe the architecture and design rules.
- `docs/decisions.md` lists product decisions and what is still open.
- [DEPLOY.md](DEPLOY.md) explains how to host it for free.

### Security and real data

- Never commit real balances, names, account numbers or a real broker or bank export. `src/data/finance.ts` and `src/data/gbm-portfolio.csv` are demo data for a fictional person. `.gitignore` blocks the usual places (CSV or PDF files at the repo root, `exports/`, `finance-backup-*.json`), but it can't catch a real number typed into the source.
- `dist/` is not committed: a build bakes the demo data into the HTML.
- To report a security problem, open a GitHub issue without any personal data, or contact the maintainer through their GitHub profile.

## License

[MIT](LICENSE)
