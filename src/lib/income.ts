import type { Frequency } from '../data/types';

export const frequencies: { id: Frequency; label: string; perMonth: number }[] = [
  { id: 'week', label: 'Weekly', perMonth: 52 / 12 },
  { id: 'biweek', label: 'Every 2 weeks', perMonth: 26 / 12 },
  { id: 'semimonth', label: 'Twice a month', perMonth: 2 },
  { id: 'month', label: 'Monthly', perMonth: 1 },
  { id: 'year', label: 'Yearly', perMonth: 1 / 12 },
  { id: 'once', label: 'One-time', perMonth: 1 }, // single lump sum: counted in full in a monthly total, once in a year
];

export const toMonthly = (amount: number, freq: Frequency) =>
  amount * (frequencies.find((f) => f.id === freq)?.perMonth ?? 1);

/** A line's yearly total: a one-time amount counts once, not twelve times. */
export const toAnnual = (amount: number, freq: Frequency) => (freq === 'once' ? amount : toMonthly(amount, freq) * 12);
