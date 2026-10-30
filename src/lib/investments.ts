// Pure investment maths and wording, shared by the Investments editor and the headline. Mirrors
// how GBM reports a portfolio: value today, cost, and the unrealised gain (plusvalía). A value
// that was never entered is `null` and makes the bucket total partial, never $0.

import type { FixedIncomeItem, FixedIncomeKind, InvestmentStore, Maybe, Portfolio, Position, PprPlan, RateTable } from '../data/types';
import { rate } from './currency';
import { fxAge } from './fx';
import { fmt, pct } from './format';
import { frequencies, toMonthly } from './income';

export const fixedIncomeKinds: { id: FixedIncomeKind; label: string }[] = [
  { id: 'cetes', label: 'CETES / bonds' },
  { id: 'fund', label: 'Debt fund' },
  { id: 'term', label: 'Term deposit' },
  { id: 'other', label: 'Other' },
];

export type BucketId = 'portfolio' | 'fixedIncome' | 'ppr';
/** The buckets typed in by hand, one `InvestmentRow` each; the portfolio comes from a GBM import. */
export type ManualBucketId = Exclude<BucketId, 'portfolio'>;

export const bucketLabels: Record<BucketId, string> = {
  portfolio: 'Portfolio',
  fixedIncome: 'Fixed income',
  ppr: 'PPR',
};

export const newId = () => Math.random().toString(36).slice(2, 10);

export const blankFixedIncome = (id = newId()): FixedIncomeItem => ({
  id, name: '', kind: 'cetes', invested: null, value: null, rate: null, maturity: null,
});
export const blankPpr = (id = newId()): PprPlan => ({ id, name: '', contributed: null, value: null, contribution: null, frequency: 'month' });

/** A stored PPR from before routines had a frequency kept a single `monthly` figure; it becomes a monthly contribution. */
export const migratePpr = (p: Partial<PprPlan> & { monthly?: Maybe }): PprPlan => {
  const { monthly, ...rest } = p;
  return { ...blankPpr(p.id), ...rest, contribution: p.contribution ?? monthly ?? null };
};

/** What a routine adds in a typical month; null when no amount was entered. */
export const contributionPerMonth = (p: PprPlan): Maybe => (p.contribution == null ? null : toMonthly(p.contribution, p.frequency));

export const blanks: Record<ManualBucketId, (id?: string) => FixedIncomeItem | PprPlan> = {
  fixedIncome: blankFixedIncome,
  ppr: blankPpr,
};

/** One line of the editor, in pesos: what it is worth, what it cost, and the gain when both are known. */
export interface PositionView {
  id: string;
  value: Maybe;
  cost: Maybe;
  gain: Maybe;
  /** Gain over cost; null when either is unknown or nothing was paid. */
  gainPct: Maybe;
  /** Extra context in plain words, e.g. "Matures Mar 5, 2027 · ~$1,000 a year at 10%". */
  note: string;
}

const view = (id: string, value: Maybe, cost: Maybe, note = ''): PositionView => {
  const gain = value == null || cost == null ? null : value - cost;
  return { id, value, cost, gain, gainPct: gain == null || !cost ? null : gain / cost, note };
};

export const dateText = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Pesos per unit of the portfolio's currency; null when there is no rate for it. */
export const toMxnRate = (p: Portfolio, table: RateTable | null): Maybe => rate(table, p.currency, 'MXN');

const times = (a: Maybe, b: Maybe): Maybe => (a == null || b == null ? null : a * b);

/** A GBM position in pesos. Cash has no cost, so it never counts toward the gain. */
export const positionView = (pos: Position, rate: Maybe) => view(pos.ticker, times(pos.value, rate), times(pos.cost, rate));

export function fixedIncomeView(f: FixedIncomeItem, today = new Date()): PositionView {
  const notes: string[] = [];
  if (f.maturity) {
    const past = new Date(f.maturity + 'T00:00:00') < today;
    notes.push(`${past ? 'Matured' : 'Matures'} ${dateText(f.maturity)}`);
  }
  const base = f.value ?? f.invested;
  if (f.rate != null && base != null) notes.push(`~${fmt((base * f.rate) / 100)} a year at ${f.rate}%`);
  return view(f.id, f.value, f.invested, notes.join(' · '));
}

/** "You add $583 twice a month (≈$1,167 a month)"; a one-time amount has no monthly figure. */
export function contributionNote(p: PprPlan): string {
  if (!p.contribution) return '';
  const label = (frequencies.find((f) => f.id === p.frequency)?.label ?? '').toLowerCase();
  if (p.frequency === 'once') return `You add ${fmt(p.contribution)} once`;
  const every = p.frequency === 'month' ? 'a month' : label;
  return `You add ${fmt(p.contribution)} ${every}` + (p.frequency === 'month' ? '' : ` (≈${fmt(contributionPerMonth(p)!)} a month)`);
}

export const pprView = (p: PprPlan) => view(p.id, p.value, p.contributed, contributionNote(p));

export interface BucketSummary {
  id: BucketId;
  label: string;
  rows: PositionView[];
  /** Sum of the values that are known. */
  value: number;
  /** Rows whose value was never entered. */
  unknown: number;
  /** Gain and cost over the rows where both value and cost are known. */
  gain: number;
  cost: number;
}

/**
 * The donut's colour slots. `c0`…`c5` go to slices in this order around the ring (checked for
 * colour-blind separation as a ring, see `sliceFills` in tone.ts); positions past the slots fold
 * into `other`, and cash is always the neutral `cash`.
 */
export type SliceFill = 'c0' | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'other' | 'cash';
const SLOTS: SliceFill[] = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];

export interface Slice {
  id: string;
  label: string;
  /** Known value in pesos; only slices above 0 are listed. */
  value: number;
  fill: SliceFill;
}

export interface InvestmentSummary {
  buckets: BucketSummary[];
  /** The donut: each GBM position, then fixed income, PPR and cash, in ring order. */
  slices: Slice[];
  value: number;
  unknown: number;
  count: number;
  /** What the PPR routines add in a typical month; routines with no amount are left out. */
  monthlyIn: number;
  gain: number;
  cost: number;
}

const bucket = (id: BucketId, rows: PositionView[]): BucketSummary => {
  const priced = rows.filter((r) => r.gain != null);
  return {
    id, label: bucketLabels[id], rows,
    value: rows.reduce((s, r) => s + (r.value ?? 0), 0),
    unknown: rows.filter((r) => r.value == null).length,
    gain: priced.reduce((s, r) => s + r.gain!, 0),
    cost: priced.reduce((s, r) => s + r.cost!, 0),
  };
};

/** The slices in ring order. Colour follows the entity's place in the export, not its size. */
function slicesOf(store: InvestmentStore, buckets: BucketSummary[]): Slice[] {
  const positions = store.portfolio?.positions ?? [];
  const named = positions
    .map((p, i) => ({ id: `p:${p.ticker}`, label: p.ticker, value: buckets[0].rows[i].value ?? 0, cash: p.cash }))
    .filter((s) => !s.cash && s.value > 0);
  const extra = [buckets[1], buckets[2]].filter((b) => b.value > 0).map((b) => ({ id: b.id, label: b.label, value: b.value }));
  const room = SLOTS.length - extra.length;
  const shown = named.length > room ? named.slice(0, room - 1) : named;
  const rest = named.slice(shown.length);
  const coloured = [...shown.map(({ id, label, value }) => ({ id, label, value })), ...extra].map(
    (s, i): Slice => ({ ...s, fill: SLOTS[i] }),
  );
  const cash = positions.reduce((s, p, i) => s + (p.cash ? (buckets[0].rows[i].value ?? 0) : 0), 0);
  return [
    ...coloured,
    ...(rest.length ? [{ id: 'other', label: `Other positions (${rest.length})`, value: rest.reduce((s, r) => s + r.value, 0), fill: 'other' as const }] : []),
    ...(cash > 0 ? [{ id: 'cash', label: 'Cash at GBM', value: cash, fill: 'cash' as const }] : []),
  ];
}

export function summarizeInvestments(store: InvestmentStore, table: RateTable | null, today = new Date()): InvestmentSummary {
  const p = store.portfolio;
  const toMxn = p ? toMxnRate(p, table) : null;
  const buckets = [
    bucket('portfolio', (p?.positions ?? []).map((pos) => positionView(pos, toMxn))),
    bucket('fixedIncome', store.fixedIncome.map((f) => fixedIncomeView(f, today))),
    bucket('ppr', store.ppr.map(pprView)),
  ];
  const add = (k: 'value' | 'unknown' | 'gain' | 'cost') => buckets.reduce((s, b) => s + b[k], 0);
  return {
    buckets, slices: slicesOf(store, buckets), value: add('value'), unknown: add('unknown'), gain: add('gain'), cost: add('cost'),
    count: buckets.reduce((s, b) => s + b.rows.length, 0),
    monthlyIn: store.ppr.reduce((s, x) => s + (contributionPerMonth(x) ?? 0), 0),
  };
}

/** "+$1,200 (+4.0%)" or "−$300 (−1.2%)"; the sign is always written, not only coloured. */
export const gainText = (gain: number, cost: number) =>
  `${gain > 0 ? '+' : ''}${fmt(gain)}` + (cost ? ` (${gain > 0 ? '+' : gain < 0 ? '−' : ''}${pct(Math.abs(gain / cost))})` : '');

/** The hero's note: what was paid and the gain, flagged as partial when values are missing. */
export function investedNote(s: InvestmentSummary): string {
  if (!s.count) return 'Nothing added yet';
  const missing = s.unknown ? ` · ${s.unknown} ${s.unknown === 1 ? 'value' : 'values'} not known` : '';
  const going = s.monthlyIn ? ` · ${fmt(s.monthlyIn)} a month going in` : '';
  return (s.cost ? `${gainText(s.gain, s.cost)} on ${fmt(s.cost)} paid in` : 'Gain needs cost and value') + going + missing;
}

/** One sentence above the chart: the biggest slice, or why there is nothing to show. */
export function allocationTakeaway(s: InvestmentSummary): string {
  if (!s.value) return s.count ? 'No value is known yet, so there is nothing to split.' : 'Import your GBM portfolio to see what you are invested in.';
  const top = s.slices.reduce((a, g) => (g.value > a.value ? g : a));
  return `${top.label} is ${pct(top.value / s.value)} of what you have invested.` +
    (s.unknown ? ` ${s.unknown} ${s.unknown === 1 ? 'value is' : 'values are'} not known, so the split is partial.` : '');
}

/** Where the portfolio came from and how its dollars became pesos. */
export function portfolioNote(p: Portfolio | null, table: RateTable | null, today = new Date()): string {
  if (!p) return 'No GBM export imported yet.';
  const n = p.positions.filter((x) => !x.cash).length;
  const cash = p.positions.some((x) => x.cash) ? ' + cash' : '';
  const parts = [`${p.file}`, p.asOf ? `taken ${dateText(p.asOf)}` : '', `${n} ${n === 1 ? 'position' : 'positions'}${cash}`].filter(Boolean);
  const r = rate(table, p.currency, 'MXN');
  const fx =
    p.currency === 'MXN' ? '' :
    r != null && table ? ` Converted at ${r.toFixed(4)} MXN per ${p.currency} (ECB, ${dateText(table.date)} · ${fxAge(table.date, today).text}), not Banxico's FIX.` :
    ` No ${p.currency}→MXN rate available, so its value in other currencies is unknown.`;
  return parts.join(' · ') + '.' + fx;
}
