import type { CreditStore, Currency, Frequency, Maybe, RateTable } from '../data/types';
import { plansOf, schedule, summarize } from './credit';
import { BASE, convert } from './currency';
import { toAnnual, toMonthly } from './income';

/** One line as the Flow forms store it. */
export interface ProjectionLine {
  label: string;
  amount: number | null;
  freq: Frequency;
  category?: string;
  /** Absent means MXN (saved before currencies existed). */
  currency?: Currency;
}

/** `amount` of line `l`'s currency in pesos; null when that currency has no rate. */
export const inBase = (l: ProjectionLine, amount: number, table: RateTable | null): Maybe =>
  convert(amount, l.currency ?? BASE, BASE, table);

/**
 * A flow form's totals in pesos. A blank amount counts as nothing entered; a line whose currency
 * has no rate is counted in `unknown` and left out, so the total is partial, never padded with 0.
 */
export function flowTotals(lines: ProjectionLine[], table: RateTable | null) {
  let monthly = 0;
  let annual = 0;
  let unknown = 0;
  for (const l of lines) {
    const m = inBase(l, toMonthly(l.amount ?? 0, l.freq), table);
    const y = inBase(l, toAnnual(l.amount ?? 0, l.freq), table);
    if (m == null || y == null) unknown++;
    else {
      monthly += m;
      annual += y;
    }
  }
  return { monthly, annual, unknown };
}

export interface MonthEntry {
  label: string;
  amount: number;
  /** Category id of an inflow or outflow line. */
  category?: string;
}

/** A credit payment, named after its account ("Gold card payment"). */
export interface CreditEntry extends MonthEntry {
  account: string;
  /** Owed after this month's payment; `null` when the balance was never entered. */
  owedAfter: Maybe;
}

export interface MonthProjection {
  opening: number;
  inflows: MonthEntry[];
  outflows: MonthEntry[];
  credit: CreditEntry[];
  closing: number;
  /** What each account owes at the end of the month (`null` = not entered). */
  owed: { account: string; amount: Maybe }[];
  /** Sum of the known balances still owed. */
  debtKnown: number;
  /** Accounts whose balance is unknown; real capital can't be computed while this is above 0. */
  unknown: number;
  /** Closing balance minus everything owed, or `null` when any balance is unknown. */
  capital: Maybe;
}

const sum = (xs: MonthEntry[]) => xs.reduce((a, x) => a + x.amount, 0);

// A one-off line lands in the first month only; everything else repeats at its monthly equivalent.
// In pesos; null when the line's currency has no rate (then it is left out of the projection).
const inMonth = (l: ProjectionLine, m: number, table: RateTable | null) =>
  inBase(l, l.freq === 'once' ? (m === 0 ? (l.amount ?? 0) : 0) : toMonthly(l.amount ?? 0, l.freq), table);

/**
 * Month-by-month cash balance from a starting balance, the flow forms and the credit accounts.
 * Expenses lower cash and net worth. Credit payments lower cash and debt by the same amount, so
 * they leave real capital unchanged; interest is the only part of a payment that costs net worth.
 */
export function project(
  start: number,
  months: number,
  inflows: ProjectionLine[],
  outflows: ProjectionLine[],
  credit: CreditStore,
  table: RateTable | null,
  today = new Date(),
): MonthProjection[] {
  const names = summarize(credit, today).views.map((v) => v.name);
  const schedules = credit.accounts.map((a) => schedule(a, plansOf(credit, a), months, today));
  const flows = (ls: ProjectionLine[], m: number, fallback: string) =>
    ls.flatMap((l) => {
      const amount = inMonth(l, m, table);
      return amount != null && amount > 0 ? [{ label: l.label.trim() || fallback, amount, category: l.category }] : [];
    });

  const out: MonthProjection[] = [];
  let balance = start;
  for (let m = 0; m < months; m++) {
    const month = schedules.map((s, i) => ({ account: names[i], ...s[m] }));
    const credit = month
      .filter((e) => e.payment > 0)
      .map((e): CreditEntry => ({ label: `${e.account} payment`, account: e.account, amount: e.payment, owedAfter: e.owedAfter }));
    const inflow = flows(inflows, m, 'Income');
    const outflow = flows(outflows, m, 'Expense');
    const closing = balance + sum(inflow) - sum(outflow) - sum(credit);
    const owed = month.map((e) => ({ account: e.account, amount: e.owedAfter }));
    const unknown = owed.filter((o) => o.amount == null).length;
    const debtKnown = owed.reduce((a, o) => a + (o.amount ?? 0), 0);
    out.push({
      opening: balance, inflows: inflow, outflows: outflow, credit, closing, owed, debtKnown, unknown,
      capital: unknown ? null : closing - debtKnown,
    });
    balance = closing;
  }
  return out;
}
