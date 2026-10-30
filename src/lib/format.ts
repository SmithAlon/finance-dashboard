/** Whole pesos; negatives get a true minus sign ("−$1,200"). */
export const mxn = (n: number) => (Math.round(n) < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + '%';
/** A per-share price, to the centavo: "$1,234.50". */
export const price = (n: number) =>
  (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** An amount in an account's own currency, to the cent, as GBM shows it: "US$58.71", "$1,234.50". */
export const money = (n: number, currency: 'MXN' | 'USD') => (currency === 'USD' ? price(n).replace('$', 'US$') : price(n));
/** Títulos, which GBM sells in fractions: "0.50096519". */
export const shareCount = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 8 });
