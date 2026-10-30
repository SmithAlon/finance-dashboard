// Build-time snapshot of the exchange rates (runs as `prebuild`, or `npm run prices`). The browser
// fetches fresher rates itself (src/lib/display.ts); this file is the fallback when it can't. Rates
// are ECB reference rates from Frankfurter (keyless), stored per 1 EUR. A failure keeps the
// previous snapshot, so the build never fails because of it, and rates never fetched stay null.

import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/prices.json', import.meta.url);

let feed = { rates: null };
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  feed = { rates: old.rates ?? null };
} catch {}

try {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?symbols=USD,MXN', { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const fx = await res.json();
  if (!fx?.rates?.USD || !fx?.rates?.MXN) throw new Error('USD or MXN missing from response');
  feed.rates = { date: fx.date, perEur: { USD: fx.rates.USD, MXN: fx.rates.MXN } };
  console.log(`[prices] per EUR: USD ${fx.rates.USD}, MXN ${fx.rates.MXN} (${fx.date})`);
} catch (e) {
  console.warn(`[prices] rates not fetched (${e.message}); keeping ${feed.rates ? feed.rates.date : 'none'}`);
}

await writeFile(OUT, JSON.stringify(feed, null, 2) + '\n');
