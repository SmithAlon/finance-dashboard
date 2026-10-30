// Domain types: the shape of the data in finance.ts.

/** Anything with a monthly or balance amount in MXN. */
export interface Amounted {
  amount: number;
}

/** A monthly inflow or outflow line. */
export interface FlowItem extends Amounted {
  label: string;
  /** The line's own currency; absent (saved before currencies existed) means MXN. */
  currency?: Currency;
}

/** Semantic cashflow colours shared by badges, dots and bars; `neutral` is muted ink. */
export type Tone = 'inflow' | 'outflow' | 'transfer' | 'passive' | 'neutral';

export type IncomeCategoryId = 'active' | 'support' | 'passive';
export type ExpenseCategoryId = 'fixed' | 'variable' | 'other';

/** How often a line is received or paid; converted to a monthly figure for totals. */
export type Frequency = 'week' | 'biweek' | 'semimonth' | 'month' | 'year' | 'once';

/** A group the Inflows or Outflows form divides its lines into. */
export interface FlowCategory<Id extends string = string> {
  id: Id;
  label: string;
  hint: string;
  tone: Tone;
}
export type IncomeCategory = FlowCategory<IncomeCategoryId>;
export type ExpenseCategory = FlowCategory<ExpenseCategoryId>;

/** A monthly flow line, tagged with the category it belongs to. */
export interface CategorizedFlowItem<Id extends string = string> extends FlowItem {
  category: Id;
}
export type IncomeItem = CategorizedFlowItem<IncomeCategoryId>;
export type ExpenseItem = CategorizedFlowItem<ExpenseCategoryId>;

/**
 * A money figure the user may not have filled in. `null` means unknown (never entered) and is
 * never treated as 0; an explicit 0 means "nothing". See `balanceState` in lib/credit.ts.
 */
export type Maybe = number | null;

export type IssuerId =
  | 'nu' | 'santander' | 'bbva' | 'banorte' | 'hsbc' | 'banamex' | 'amex' | 'mercadopago' | 'klar' | 'other';

interface CreditAccountBase {
  id: string;
  /** Bank or lender; `other` uses `issuerOther` as the name. */
  issuer: IssuerId;
  issuerOther: string;
  /** The user's own name for it, e.g. "Gold card". */
  nickname: string;
  /** Annual interest rate in percent, as the user enters it. */
  interestRate: Maybe;
  /** Day of the month the payment is due (1–31). */
  dueDay: Maybe;
  /** ISO date (YYYY-MM-DD) the balance was last checked. */
  balanceUpdatedAt: string | null;
}

/** A credit card. `currentBalance` is everything owed on it, MSI plans included. */
export interface CardAccount extends CreditAccountBase {
  type: 'card';
  creditLimit: Maybe;
  currentBalance: Maybe;
  statementBalance: Maybe;
  cutoffDay: Maybe;
  payToAvoidInterest: Maybe;
  minimumPayment: Maybe;
  /** What the user actually pays each month. */
  plannedPayment: Maybe;
  /** Costo Anual Total in percent; shown for reference, interest uses `interestRate`. */
  cat: Maybe;
}

/** A personal, family, car or student loan. */
export interface LoanAccount extends CreditAccountBase {
  type: 'loan';
  remainingBalance: Maybe;
  monthlyPayment: Maybe;
  /** ISO date (YYYY-MM-DD) of the last payment. */
  endDate: string | null;
}

export type CreditAccount = CardAccount | LoanAccount;

/** An interest-free installment purchase (meses sin intereses) billed to a card. */
export interface MsiPlan {
  id: string;
  cardId: string;
  merchant: string;
  monthlyAmount: Maybe;
  monthsRemaining: Maybe;
}

/** Everything the Debt tab's credit editor stores. */
export interface CreditStore {
  accounts: CreditAccount[];
  msi: MsiPlan[];
}

/** Cash the user holds in a bank or savings account, edited in the Accounts tab. */
export interface Account {
  name: string;
  institution: string;
  /** Balance today, in `currency`; `null` until entered, never read as 0. */
  amount: Maybe;
  /** The account's own currency; absent (saved before currencies existed) means MXN. */
  currency?: Currency;
}

/** 50/30/20 shares of income; values are fractions that sum to 1. */
export interface Framework {
  obligations: number;
  savings: number;
  investing: number;
}

export interface WeddingGoal {
  label: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  target: number;
  targetIsPlaceholder: boolean;
}

export interface TripGoal {
  label: string;
  target: number;
}

export interface GraduationGoal {
  label: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
}

export interface Goals {
  /** ISO date (YYYY-MM-DD) the dashboard is "as of". */
  today: string;
  wedding: WeddingGoal;
  trip: TripGoal;
  graduation: GraduationGoal;
}

/** Annual yields as fractions (0.08 = 8%). */
export interface Defaults {
  savingsYield: number;
  investYield: number;
}

export interface ActionItem {
  title: string;
  detail: string;
  due: string;
}

/** The currencies the dashboard can show and convert between. */
export type Currency = 'MXN' | 'USD' | 'EUR';

/** ECB reference rates (via Frankfurter): units of each currency per 1 EUR, for one day. */
export interface RateTable {
  /** ISO date (YYYY-MM-DD) the ECB published these rates. */
  date: string;
  perEur: Partial<Record<Currency, number>>;
}

/** `src/data/prices.json`, written at build time by `scripts/fetch-prices.mjs`: the fallback when the browser can't fetch fresher rates. Null until a fetch succeeds. */
export interface PriceFeed {
  rates: RateTable | null;
}

/** One row of GBM's portfolio export, in the account's currency. GBM's "-" is null, never 0. */
export interface Position {
  /** Emisora/Fondo as GBM shows it ("VTI"); "Cash" for the Liquidez row. */
  ticker: string;
  /** The Liquidez row: uninvested cash, with no cost and no gain. */
  cash: boolean;
  /** Títulos (fractional shares allowed). */
  shares: Maybe;
  /** Costo promedio, per share. */
  avgCost: Maybe;
  /** Precio mercado, per share. */
  price: Maybe;
  /** Valor mercado. */
  value: Maybe;
  /** Imp X Cto: what was paid in total (títulos × costo promedio). */
  cost: Maybe;
}

/** A portfolio imported from a GBM CSV export. */
export interface Portfolio {
  /** The imported file's name. */
  file: string;
  /** First section title, e.g. "Mercado de Capitales USA". */
  account: string;
  currency: Currency;
  /** ISO date (YYYY-MM-DD) the export was taken, from the file name; null when it doesn't say. */
  asOf: string | null;
  positions: Position[];
}
export type FixedIncomeKind = 'cetes' | 'fund' | 'term' | 'other';

/** A fixed-income holding: government bonds (CETES), a debt fund or a term deposit (pagaré). */
export interface FixedIncomeItem {
  id: string;
  name: string;
  kind: FixedIncomeKind;
  invested: Maybe;
  /** What it is worth today, interest included. */
  value: Maybe;
  /** Annual rate in percent. */
  rate: Maybe;
  /** ISO date (YYYY-MM-DD) it matures; null for funds with no maturity. */
  maturity: string | null;
}

/** A personal retirement plan (Plan Personal de Retiro). */
export interface PprPlan {
  id: string;
  name: string;
  /** Total paid in so far (aportaciones). */
  contributed: Maybe;
  value: Maybe;
  /** What you add each time (a routine the user enters, e.g. each payday). */
  contribution: Maybe;
  /** How often `contribution` is made; the monthly figure is `toMonthly(contribution, frequency)`. */
  frequency: Frequency;
}

/** Everything the Investments tab's editor stores. */
export interface InvestmentStore {
  /** The last GBM export imported; null until one is. */
  portfolio: Portfolio | null;
  fixedIncome: FixedIncomeItem[];
  ppr: PprPlan[];
}
