import type { Currency } from '../data/types';
import { cents, compact, symbol, whole } from './currency';
import { fromBase, shownCurrency } from './display';

/**
 * A peso (base) amount shown in the visitor's display currency, in whole units: "$1,234",
 * "US$66", "€57". Negatives get a true minus ("−$1,200"). Every total goes through this.
 */
export const fmt = (n: number) => whole(fromBase(n), shownCurrency());
/** An amount that isn't known, in the display currency: "$—", "US$—". Never shown as 0. */
export const dash = () => symbol(shownCurrency()) + '—';
/** A peso amount as a short axis label in the display currency: "$147K". */
export const fmtCompact = (n: number) => compact(fromBase(n), shownCurrency());
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + '%';
/** A per-share price in pesos, to the centavo: "$1,234.50". */
export const price = (n: number) => cents(n, 'MXN');
/** An amount in its own currency, to the cent, as GBM shows it: "US$58.71", "$1,234.50". */
export const money = (n: number, currency: Currency) => cents(n, currency);
/** Títulos, which GBM sells in fractions: "0.50096519". */
export const shareCount = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 8 });
