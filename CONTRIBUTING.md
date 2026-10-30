# Contributing

Thanks for helping. A few rules keep the project small, private and consistent.

## Ground rules

- **Your data stays in the browser.** No backend, accounts, analytics or telemetry, and no new network requests. The only outside request is the exchange-rate API; the Content-Security-Policy and CI enforce that.
- **Unknown is not zero.** A value nobody entered is `null`. Totals that include one are partial, and figures that need it show "can't compute". Never turn a missing balance or a missing exchange rate into 0.
- **No real personal data**, in code, tests, screenshots, issues or commits. Use the fictional demo data.
- **Free to run.** Don't add anything that needs a paid service, an API key or a server.

## Workflow

1. Fork, then branch from `main`.
2. `npm install`, then `npm run dev`.
3. Read `.claude/skills/finance-dashboard-conventions/SKILL.md` before changing code. It says where each kind of change lives (data, maths in `src/lib/`, components) and lists the design tokens to use (no hex values or raw Tailwind colours).
4. Run `npm run build`. It is the only type check; there is no test suite.
5. Look at your change in a browser in dark and light mode and at phone width (390px), with no sideways scrolling.
6. Open a pull request that says what changed and how you checked it. CI must pass.

If a change alters how data is stored in localStorage, bump the key's version and migrate the old shape, so nobody loses data. Record product decisions in `docs/decisions.md`.

By contributing you agree that your work is released under the [MIT License](LICENSE).
