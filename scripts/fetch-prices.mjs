// Build-time USD→MXN rate for the Investments tab (runs as `prebuild`, or `npm run prices`). The GBM
// USA portfolio is imported in dollars from its CSV export; this fetches the rate that turns it into
// pesos from Frankfurter (ECB, keyless) and writes src/data/prices.json. A failure keeps the previous
// rate, so the build never fails because of it, and a rate never fetched stays null, never 0.

import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/prices.json', import.meta.url);

let feed = { usdMxn: null };
try {
  const { usdMxn } = JSON.parse(await readFile(OUT, 'utf8'));
  feed = { usdMxn: usdMxn ?? null };
} catch {}

try {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=MXN', { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const fx = await res.json();
  if (!fx?.rates?.MXN) throw new Error('no MXN rate in response');
  feed.usdMxn = { rate: fx.rates.MXN, date: fx.date };
  console.log(`[prices] USD→MXN ${fx.rates.MXN} (${fx.date})`);
} catch (e) {
  console.warn(`[prices] USD→MXN not fetched (${e.message}); keeping ${feed.usdMxn ? feed.usdMxn.date : 'none'}`);
}

await writeFile(OUT, JSON.stringify(feed, null, 2) + '\n');
