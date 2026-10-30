// The visitor's display currency and the rate table in use. On the server (no localStorage) it is
// always MXN with the build-time snapshot; in the browser it reads `finance:settings:v1` and a
// fresher table cached in `finance:rates:v1`. If the chosen currency has no rate at all, figures
// are shown in MXN (`shownCurrency`) and the header says why, rather than inventing a rate.

import snapshot from '../data/prices.json';
import type { Currency, PriceFeed, RateTable } from '../data/types';
import { BASE, isCurrency, rate } from './currency';

const SETTINGS_KEY = 'finance:settings:v1';
const RATES_KEY = 'finance:rates:v1';
/** Ask Frankfurter again once the cached table is this old (ms). ECB publishes once per working day. */
const REFETCH_AFTER = 6 * 3_600_000;
/** The only network request the app makes; it carries no user data. */
export const RATES_URL = 'https://api.frankfurter.dev/v1/latest?symbols=USD,MXN';

interface CachedRates {
  table: RateTable;
  fetchedAt: number;
}

const browser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const read = <T>(key: string): T | null => {
  if (!browser) return null;
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
};

let memo: { chosen: Currency; table: RateTable | null; fetchedAt: number } | null = null;
const state = () => {
  if (memo) return memo;
  const settings = read<{ display?: unknown }>(SETTINGS_KEY);
  const cached = read<CachedRates>(RATES_KEY);
  const built = (snapshot as PriceFeed).rates;
  // The newer of the cached and build-time tables wins.
  const useCached = cached?.table?.date && (!built || cached.table.date >= built.date);
  memo = {
    chosen: isCurrency(settings?.display) ? settings.display : BASE,
    table: useCached ? cached!.table : built,
    fetchedAt: useCached ? cached!.fetchedAt : 0,
  };
  return memo;
};

/** The currency the visitor picked. */
export const chosenCurrency = () => state().chosen;
/** The rate table in use (cached fetch or build snapshot); null if neither exists. */
export const rates = () => state().table;
/** The currency figures are actually shown in: the chosen one, or MXN when it has no rate. */
export const shownCurrency = (): Currency => (rate(state().table, BASE, state().chosen) == null ? BASE : state().chosen);
/** A peso amount in the shown currency. */
export const fromBase = (n: number) => n * (rate(state().table, BASE, shownCurrency()) ?? 1);

export const setDisplayCurrency = (c: Currency) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ display: c }));
  } catch {}
  memo = null;
};

/**
 * Fetches today's ECB rates when the table in use is older than a few hours, caches them and fires
 * `ratechange` on `document` so editors recompute. A failure keeps the table in use.
 */
export async function refreshRates() {
  if (!browser || Date.now() - state().fetchedAt < REFETCH_AFTER) return;
  try {
    const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return;
    const fx = await res.json();
    if (typeof fx?.date !== 'string' || !fx?.rates?.USD || !fx?.rates?.MXN) return;
    const table: RateTable = { date: fx.date, perEur: { USD: fx.rates.USD, MXN: fx.rates.MXN } };
    const changed = table.date !== state().table?.date;
    localStorage.setItem(RATES_KEY, JSON.stringify({ table, fetchedAt: Date.now() } satisfies CachedRates));
    memo = null;
    if (changed) document.dispatchEvent(new CustomEvent('ratechange'));
  } catch {}
}
