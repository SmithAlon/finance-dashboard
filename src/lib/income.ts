import type { Frequency } from '../data/types';

export const frequencies: { id: Frequency; label: string; perMonth: number }[] = [
  { id: 'week', label: 'Weekly', perMonth: 52 / 12 },
  { id: 'biweek', label: 'Every 2 weeks', perMonth: 26 / 12 },
  { id: 'month', label: 'Monthly', perMonth: 1 },
  { id: 'year', label: 'Yearly', perMonth: 1 / 12 },
  { id: 'once', label: 'One exhibition', perMonth: 1 }, // single lump-sum payment, counted in full
];

export const toMonthly = (amount: number, freq: Frequency) =>
  amount * (frequencies.find((f) => f.id === freq)?.perMonth ?? 1);
