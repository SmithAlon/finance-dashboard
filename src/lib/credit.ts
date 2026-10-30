// Pure credit maths and wording, shared by the credit editor, the headline, the Accounts tab and
// the projection. An unknown balance (`null`) is never coerced to 0: totals report it as partial.

import type { CardAccount, CreditAccount, CreditStore, Frequency, IssuerId, LoanAccount, Maybe, MsiPlan } from '../data/types';
import { mxn } from './format';
import { toMonthly } from './income';

export const issuers: { id: IssuerId; label: string }[] = [
  { id: 'nu', label: 'Nu' },
  { id: 'santander', label: 'Santander' },
  { id: 'bbva', label: 'BBVA' },
  { id: 'banorte', label: 'Banorte' },
  { id: 'hsbc', label: 'HSBC' },
  { id: 'banamex', label: 'Banamex' },
  { id: 'amex', label: 'American Express' },
  { id: 'mercadopago', label: 'Mercado Pago' },
  { id: 'klar', label: 'Klar' },
  { id: 'other', label: 'Other' },
];

/** A balance is days old before the totals strip flags it. */
export const STALE_DAYS = 30;

export type BalanceState = 'entered' | 'zero' | 'unknown';
export const balanceState = (b: Maybe | undefined): BalanceState =>
  b == null ? 'unknown' : b === 0 ? 'zero' : 'entered';

export const newId = () => Math.random().toString(36).slice(2, 10);

export const blankCard = (id = newId()): CardAccount => ({
  id, type: 'card', issuer: 'nu', issuerOther: '', nickname: '', interestRate: null, dueDay: null,
  balanceUpdatedAt: null, creditLimit: null, currentBalance: null, statementBalance: null, cutoffDay: null,
  payToAvoidInterest: null, minimumPayment: null, plannedPayment: null, cat: null,
});

export const blankLoan = (id = newId()): LoanAccount => ({
  id, type: 'loan', issuer: 'other', issuerOther: '', nickname: '', interestRate: null, dueDay: null,
  balanceUpdatedAt: null, remainingBalance: null, monthlyPayment: null, endDate: null,
});

export const issuerName = (a: CreditAccount) =>
  a.issuer === 'other' ? a.issuerOther.trim() : issuers.find((i) => i.id === a.issuer)?.label ?? '';

/** "Gold card", "Banorte car loan", or the issuer alone. */
export const accountName = (a: CreditAccount) => {
  const issuer = issuerName(a);
  const nick = a.nickname.trim();
  if (!nick) return issuer || (a.type === 'loan' ? 'Unnamed loan' : 'Unnamed card');
  return !issuer || nick.toLowerCase().includes(issuer.toLowerCase()) ? nick : `${issuer} ${nick}`;
};

export const owedOf = (a: CreditAccount): Maybe => (a.type === 'card' ? a.currentBalance : a.remainingBalance);
export const paymentOf = (a: CreditAccount): Maybe => (a.type === 'card' ? a.plannedPayment : a.monthlyPayment);
export const plansOf = (store: CreditStore, a: CreditAccount) => store.msi.filter((p) => p.cardId === a.id);

const msiLeft = (plans: MsiPlan[]) => plans.reduce((s, p) => s + (p.monthlyAmount ?? 0) * (p.monthsRemaining ?? 0), 0);
const msiDue = (plans: MsiPlan[]) => plans.reduce((s, p) => s + ((p.monthsRemaining ?? 0) > 0 ? (p.monthlyAmount ?? 0) : 0), 0);

/** Whole months from the start of `from`'s month to `iso`'s month (0 = this month). */
export const monthsUntil = (iso: string, from: Date) => {
  const [y, m] = iso.split('-').map(Number);
  return (y - from.getFullYear()) * 12 + (m - 1 - from.getMonth());
};

export const daysSince = (iso: string, today: Date) =>
  Math.floor((today.getTime() - new Date(iso + 'T00:00:00').getTime()) / 86_400_000);

export interface MonthPay {
  payment: number;
  interest: number;
  /** Owed after this month's payment; `null` when the balance was never entered. */
  owedAfter: Maybe;
}

/**
 * Month-by-month payments for one account from this month on. Card payments cover the MSI
 * installments billed that month first, then the revolving balance, which accrues `interestRate`.
 */
export function schedule(a: CreditAccount, plans: MsiPlan[], months: number, today = new Date()): MonthPay[] {
  const r = (a.interestRate ?? 0) / 1200;
  const pay = paymentOf(a) ?? 0;
  const out: MonthPay[] = [];

  if (a.type === 'loan') {
    const last = a.endDate ? monthsUntil(a.endDate, today) : Infinity;
    let bal = a.remainingBalance;
    for (let m = 0; m < months; m++) {
      if (bal == null) {
        out.push({ payment: m <= last ? pay : 0, interest: 0, owedAfter: null });
        continue;
      }
      const interest = bal * r;
      bal += interest;
      const p = Math.min(pay, bal);
      bal -= p;
      out.push({ payment: p, interest, owedAfter: bal });
    }
    return out;
  }

  if (a.currentBalance == null) {
    for (let m = 0; m < months; m++) out.push({ payment: pay, interest: 0, owedAfter: null });
    return out;
  }
  const msi = plans.map((p) => ({ amount: p.monthlyAmount ?? 0, left: p.monthsRemaining ?? 0 }));
  let rev = Math.max(0, a.currentBalance - msiLeft(plans));
  for (let m = 0; m < months; m++) {
    const interest = rev * r;
    rev += interest;
    const billed = msi.reduce((s, p) => s + (p.left > 0 ? p.amount : 0), 0);
    msi.forEach((p) => p.left > 0 && p.left--);
    const p = Math.min(pay, rev + billed);
    const toMsi = Math.min(p, billed);
    rev += billed - toMsi; // an unpaid installment becomes revolving balance
    rev -= p - toMsi;
    out.push({ payment: p, interest, owedAfter: rev + msi.reduce((s, x) => s + x.amount * x.left, 0) });
  }
  return out;
}

export type Payoff = { months: number; interest: number } | 'never';

/** How long until the account is paid off at its current payment, and the interest paid on the way. */
export function payoff(a: CreditAccount, plans: MsiPlan[], today = new Date()): Payoff | null {
  if (owedOf(a) == null) return null;
  const s = schedule(a, plans, 600, today);
  const end = s.findIndex((m) => (m.owedAfter ?? 0) < 0.5);
  if (end < 0) return 'never';
  return { months: end + 1, interest: s.slice(0, end + 1).reduce((t, m) => t + m.interest, 0) };
}

export type CreditStatus = 'unknown' | 'nothing' | 'free' | 'paid-monthly' | 'costing';

export const statusLabels: Record<CreditStatus, string> = {
  unknown: 'Balance missing',
  nothing: 'Nothing owed',
  free: 'Free',
  'paid-monthly': 'Paid off monthly',
  costing: 'Costing you',
};

export function statusOf(a: CreditAccount, plans: MsiPlan[]): CreditStatus {
  const owed = owedOf(a);
  if (owed == null) return 'unknown';
  if (owed === 0) return 'nothing';
  if (a.type === 'loan') return a.interestRate === 0 ? 'free' : 'costing';
  const revolving = owed - msiLeft(plans);
  if (revolving <= 0) return 'free';
  const clearAll = a.payToAvoidInterest ?? revolving + msiDue(plans);
  return (a.plannedPayment ?? 0) >= clearAll ? 'paid-monthly' : 'costing';
}

/** What is missing or out of date, in the words the totals strip shows. */
export function gapsOf(a: CreditAccount, status: CreditStatus, today = new Date()): string[] {
  const gaps: string[] = [];
  if (a.issuer === 'other' && !a.issuerOther.trim()) gaps.push(a.type === 'loan' ? 'lender missing' : 'bank missing');
  if (status === 'unknown') gaps.push('balance missing');
  else if (a.balanceUpdatedAt) {
    const days = daysSince(a.balanceUpdatedAt, today);
    if (days > STALE_DAYS) gaps.push(`updated ${days} days ago`);
  }
  if (status !== 'nothing' && paymentOf(a) == null) gaps.push('payment missing');
  if (status === 'costing' && a.interestRate == null) gaps.push('interest rate missing');
  return gaps;
}

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

const monthLabel = (offset: number, today: Date) => {
  const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/** One plain-language sentence about an account, e.g. "Gold card: you owe $X. At $Y a month…". */
export function describe(a: CreditAccount, plans: MsiPlan[], status: CreditStatus, today = new Date()): string {
  const name = accountName(a);
  const owed = owedOf(a);
  const pay = paymentOf(a);
  const payText = pay ? `${mxn(pay)} a month` : null;
  if (status === 'unknown')
    return `${name}: no balance entered, so what you owe isn't counted.` + (payText ? ` You pay ${payText}.` : '');
  if (status === 'nothing') return `${name}: you owe nothing.`;
  const p = payoff(a, plans, today)!;
  const head = `${name}: you owe ${mxn(owed!)}.`;
  if (status === 'paid-monthly') return `${head} You pay it in full each month, so it costs no interest.`;
  if (!pay) return `${head} Enter what you pay each month to see when it's paid off.`;
  if (p === 'never') return `${head} At ${payText} it never goes down: the payment doesn't cover the interest.`;
  const when = `you're free in ${plural(p.months, 'month')} (${monthLabel(p.months - 1, today)})`;
  if (status === 'free') return `${head} It's all interest-free installments: ${when}.`;
  if (a.interestRate == null) return `${head} At ${payText} ${when}. Add the interest rate to see what it costs.`;
  return `${head} At ${payText} ${when} and pay ${mxn(p.interest)} in interest.`;
}

export interface AccountView {
  account: CreditAccount;
  plans: MsiPlan[];
  name: string;
  owed: Maybe;
  state: BalanceState;
  status: CreditStatus;
  gaps: string[];
  /** This month's payment (0 once paid off). */
  payment: number;
  sentence: string;
}

export interface CreditSummary {
  views: AccountView[];
  /** Sum of the balances that are known. */
  owedKnown: number;
  /** Accounts whose balance was never entered. */
  unknown: number;
  /** True only when every account has an entered or explicit-zero balance. */
  complete: boolean;
  payments: number;
}

export function summarize(store: CreditStore, today = new Date()): CreditSummary {
  const views = store.accounts.map((account): AccountView => {
    const plans = plansOf(store, account);
    const status = statusOf(account, plans);
    const owed = owedOf(account);
    return {
      account, plans, name: accountName(account), owed, state: balanceState(owed), status,
      gaps: gapsOf(account, status, today),
      payment: schedule(account, plans, 1, today)[0].payment,
      sentence: describe(account, plans, status, today),
    };
  });
  // Two accounts with the same name get a number so chips and breakdown rows stay distinct.
  const seen = new Map<string, number>();
  for (const v of views) {
    const n = (seen.get(v.name) ?? 0) + 1;
    seen.set(v.name, n);
    if (n > 1) v.name = `${v.name} ${n}`;
  }
  const unknown = views.filter((v) => v.state === 'unknown').length;
  return {
    views,
    owedKnown: views.reduce((s, v) => s + (v.owed ?? 0), 0),
    unknown,
    complete: unknown === 0,
    payments: views.reduce((s, v) => s + v.payment, 0),
  };
}

/** "$1,200 owed (2 of 3 accounts)" when partial, "$1,200 owed" when complete. */
export const owedText = (s: CreditSummary) =>
  s.complete
    ? `${mxn(s.owedKnown)} owed`
    : `${mxn(s.owedKnown)} owed (${s.views.length - s.unknown} of ${plural(s.views.length, 'account')})`;

/** The one-sentence summary under the headline. */
export function summarySentence(s: CreditSummary): string {
  const n = s.views.length;
  if (!n) return "You haven't added any credit cards or loans yet, so none are counted.";
  const across = `across ${plural(n, 'account')}`;
  if (s.complete) return s.owedKnown ? `You owe ${mxn(s.owedKnown)} ${across}.` : `You owe nothing ${across}.`;
  const missing = s.views.filter((v) => v.state === 'unknown');
  const kind = missing.every((v) => v.account.type === 'card') ? 'card' : missing.every((v) => v.account.type === 'loan') ? 'loan' : 'account';
  const verb = missing.length === 1 ? 'has' : 'have';
  return `You owe ${mxn(s.owedKnown)} ${across}, but ${plural(missing.length, kind)} ${verb} no balance entered.`;
}

export interface Due {
  name: string;
  date: Date;
  /** What clears the month: pay-to-avoid-interest for cards, the instalment for loans. */
  amount: number;
  minimum: Maybe;
  past: boolean;
}

/** Payments due in the current calendar month, by date. Accounts without a due day are skipped. */
export function duesThisMonth(s: CreditSummary, today = new Date()): Due[] {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return s.views
    .filter((v) => v.account.dueDay && v.status !== 'nothing')
    .map((v) => {
      const a = v.account;
      const day = Math.min(a.dueDay!, lastDay);
      const amount = a.type === 'card' ? a.payToAvoidInterest ?? v.payment : v.payment;
      return {
        name: v.name,
        date: new Date(today.getFullYear(), today.getMonth(), day),
        amount,
        minimum: a.type === 'card' ? a.minimumPayment : null,
        past: day < today.getDate(),
      };
    })
    .filter((d) => d.amount > 0)
    .sort((x, y) => x.date.getTime() - y.date.getTime());
}

/** A row of the old flat credit list (`finance:credits:v2`). */
export interface LegacyCreditRow {
  label: string;
  amount: number | null;
  freq: Frequency;
  category: string;
  owed?: number | null;
}

/** Converts the old flat rows to accounts, with a note for every change a person would notice. */
export function migrateLegacy(rows: LegacyCreditRow[], today = new Date()): { store: CreditStore; notes: string[] } {
  const store: CreditStore = { accounts: [], msi: [] };
  const notes: string[] = [];
  const guess = (label: string): IssuerId =>
    issuers.find((i) => i.id !== 'other' && new RegExp(`\\b${i.label}\\b`, 'i').test(label))?.id ?? 'other';
  const installments: { row: LegacyCreditRow; monthly: number; owed: Maybe; name: string }[] = [];

  for (const row of rows) {
    const name = row.label.trim() || 'Unnamed';
    const monthly = Math.round(toMonthly(row.amount ?? 0, row.freq) * 100) / 100;
    let owed: Maybe = row.owed ?? null;
    if (row.freq === 'once' && row.amount) {
      if (owed == null) {
        owed = row.amount;
        notes.push(`"${name}": a one-time payment of ${mxn(row.amount)} is now a balance of ${mxn(row.amount)}, paid off in one payment.`);
      }
    } else if (row.freq !== 'month' && row.amount) {
      notes.push(`"${name}": ${mxn(row.amount)} (${row.freq}) is now ${mxn(monthly)} a month.`);
    }
    if (owed == null) notes.push(`"${name}": the balance was blank. It now shows as "balance missing" instead of counting as $0.`);
    const payment = row.amount == null ? null : row.freq === 'once' ? row.amount : monthly;

    if (row.category === 'installments') {
      installments.push({ row, monthly: payment ?? 0, owed, name });
      continue;
    }
    const issuer = guess(name);
    if (issuer === 'other') notes.push(`"${name}": pick its bank so it shows by name in the totals.`);
    const base = { issuer, issuerOther: '', nickname: name, balanceUpdatedAt: owed == null ? null : today.toISOString().slice(0, 10) };
    store.accounts.push(
      row.category === 'loan'
        ? { ...blankLoan(), ...base, remainingBalance: owed, monthlyPayment: payment }
        : { ...blankCard(), ...base, currentBalance: owed, plannedPayment: payment },
    );
  }

  if (installments.length) {
    const cards = store.accounts.filter((a): a is CardAccount => a.type === 'card');
    const msiOwed = installments.every((i) => i.owed != null) ? installments.reduce((s, i) => s + i.owed!, 0) : null;
    let card: CardAccount;
    if (cards.length === 1) {
      card = cards[0];
      notes.push(`MSI purchases were put on "${card.nickname}", the only card, and added to its balance.`);
      // A card's balance includes its MSI plans; if either part is unknown, so is the total.
      card.currentBalance = card.currentBalance == null || msiOwed == null ? null : card.currentBalance + msiOwed;
    } else {
      card = { ...blankCard(), issuer: 'other', nickname: 'Unassigned card', currentBalance: msiOwed };
      store.accounts.push(card);
      notes.push(`MSI purchases need a card; they were put on "Unassigned card". Pick that card\'s bank and name, or re-add them under the right card.`);
    }
    for (const i of installments)
      store.msi.push({
        id: newId(), cardId: card.id, merchant: i.name, monthlyAmount: i.monthly || null,
        monthsRemaining: i.owed != null && i.monthly ? Math.ceil(i.owed / i.monthly) : null,
      });
  }
  return { store, notes };
}
