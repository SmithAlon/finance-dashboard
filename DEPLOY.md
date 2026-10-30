# Deploying

The dashboard is a static site: `npm run build` writes everything to `dist/`. There is no server, database, environment variable or secret, so any static host works. The steps below use free tiers only; the one cost is your domain.

What the build does:

- `prebuild` fetches an exchange-rate snapshot from Frankfurter into `src/data/prices.json`. If the host has no network or Frankfurter is down, it keeps the committed snapshot and the build still succeeds.
- `public/_headers` sets the security headers (Cloudflare Pages and Netlify read it). The same Content-Security-Policy is also in a `<meta>` tag, for hosts that can't send headers.
- Requirements: Node 22.22 or later (Astro 7).

## Cloudflare Pages (recommended)

1. Push the repository to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, and pick the repository.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. **Save and Deploy**. The site appears at `https://<project>.pages.dev`. Every push to `main` redeploys, and every pull request gets a preview URL.

Package manager: Cloudflare picks it from the lockfile. The repo has both `package-lock.json` and `pnpm-lock.yaml`, and both install and build cleanly, so either works. Keeping only one would make the choice explicit.

### Attach your domain

In the Pages project: **Custom domains** → **Set up a custom domain**, and enter it (for example `finance.example.com` or `example.com`).

- **Domain already on Cloudflare DNS:** Cloudflare adds the record and the certificate for you.
- **Domain at another registrar, subdomain** (`finance.example.com`): at your DNS provider, add a `CNAME` record from `finance` to `<project>.pages.dev`, then finish the step in Cloudflare.
- **Domain at another registrar, apex** (`example.com`): an apex can't be a CNAME at most providers. Move the domain's nameservers to Cloudflare (**Add a site**, Free plan, then change the nameservers at your registrar to the two Cloudflare gives you), then attach it as above.

HTTPS is automatic. Under **SSL/TLS** → **Edge Certificates**, turn on **Always Use HTTPS**.

## Security headers

`public/_headers` applies these to every page:

| Header | Value and why |
|---|---|
| Content-Security-Policy | `default-src 'self'`; scripts, fonts and styles only from the site itself; `connect-src` also allows `https://api.frankfurter.dev`, the exchange-rate API and the only cross-origin request; no plugins, no forms posting anywhere, no framing. `style-src` allows `'unsafe-inline'` because chart widths are set in `style` attributes; scripts have no such exception. |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` (older browsers; `frame-ancestors 'none'` covers newer ones) |
| Referrer-Policy | `no-referrer` |
| Permissions-Policy | camera, microphone, geolocation, payment and USB off |
| Cross-Origin-Opener-Policy | `same-origin` |
| Strict-Transport-Security | one year. It doesn't include subdomains; add `includeSubDomains` only if every subdomain of your domain serves HTTPS. |

If you change the rates API or add any external resource, update the policy in both `public/_headers` and `src/layouts/Base.astro`. The CI workflow fails if the built page references any other host.

## Alternative: GitHub Pages

GitHub Pages is free for public repositories, but it can't send headers: the CSP still applies through the `<meta>` tag, and the other headers in the table are not sent.

1. Add `.github/workflows/pages.yml`:

   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22, cache: npm }
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

2. Repository **Settings** → **Pages** → **Source**: **GitHub Actions**.
3. Custom domain: **Settings** → **Pages** → **Custom domain**, enter it, and add a file `public/CNAME` containing the domain. At your DNS provider:
   - apex: `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and `AAAA` to `2606:50c0:8000::153` … `8003::153`);
   - subdomain: `CNAME` to `<user>.github.io`.

   Then tick **Enforce HTTPS**.

Use a custom domain with GitHub Pages: without one the site is served from `/<repo>/`, and the page's absolute paths (`/_astro/…`, `/fonts/…`) would need Astro's `base` option.

## After deploying, check

1. Open the site in a private window. You should see the welcome card and an empty dashboard, never the demo figures.
2. Open DevTools → **Network** and reload. Every request goes to your domain except one to `api.frankfurter.dev`. There is no font, analytics or CDN request.
3. **Console**: no "Refused to …" Content-Security-Policy errors.
4. Check the headers at [securityheaders.com](https://securityheaders.com) (it should show the CSP and the others above) and confirm `http://` redirects to `https://`.
5. Click **Load demo data**: the banner appears. Switch the currency to USD and back. Export a backup, click **Erase everything**, and import the backup: your data returns.
6. Look at it on a phone: no sideways scrolling.

## Cost

Cloudflare Pages (Free plan), GitHub Pages, GitHub Actions on a public repository, and Frankfurter are all free with no key or account beyond the host's. The only paid item is the domain.
