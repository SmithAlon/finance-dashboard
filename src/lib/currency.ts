// Currencies and conversion. Pure, shared by server markup and client scripts. Internally every
// total is in pesos (MXN, the base); amounts are converted only where they enter a total or are
// shown. A missing rate makes the converted amount unknown (null), never 0.

import type { Currency, Maybe, RateTable } from '../data/types';

export const BASE: Currency = 'MXN';

export const currencies: { id: Currency; label: string; symbol: string }[] = [
  { id: 'MXN', label: 'Mexican peso', symbol: '$' },
  { id: 'USD', label: 'US dollar', symbol: 'US$' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
];

export const isCurrency = (c: unknown): c is Currency => currencies.some((x) => x.id === c);

export const symbol = (c: Currency) => currencies.find((x) => x.id === c)!.symbol;

/** Units of `to` per 1 `from`; null when the table lacks either currency. */
export const rate = (table: RateTable | null, from: Currency, to: Currency): Maybe => {
  if (from === to) return 1;
  const per = (c: Currency) => (c === 'EUR' ? 1 : table?.perEur[c]);
  const f = per(from);
  const t = per(to);
  return f && t ? t / f : null;
};

/** `n` in `from` expressed in `to`; null when `n` is unknown or there is no rate. */
export const convert = (n: Maybe, from: Currency, to: Currency, table: RateTable | null): Maybe => {
  if (n == null) return null;
  const r = rate(table, from, to);
  return r == null ? null : n * r;
};

/** Whole units with the currency's symbol; negatives get a true minus ("−US$1,200"). */
export const whole = (n: number, c: Currency) =>
  (Math.round(n) < 0 ? '−' : '') + symbol(c) + Math.abs(Math.round(n)).toLocaleString('en-US');

/** To the cent, as a broker shows it: "US$58.71", "$1,234.50". */
export const cents = (n: number, c: Currency) =>
  (n < 0 ? '−' : '') + symbol(c) + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "$147K", "−US$1.2M": axis labels. */
export const compact = (n: number, c: Currency) => {
  const a = Math.abs(n);
  const v = a >= 1e6 ? `${+(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${+(a / 1e3).toFixed(a >= 1e4 ? 0 : 1)}K` : `${Math.round(a)}`;
  return (n < 0 ? '−' : '') + symbol(c) + v;
};
