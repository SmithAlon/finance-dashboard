// Domain types: the shape of the data in finance.ts.

/** Anything with a monthly or balance amount in MXN. */
export interface Amounted {
  amount: number;
}

/** A monthly inflow or outflow line. */
export interface FlowItem extends Amounted {
  label: string;
}

/** Semantic cashflow colours shared by badges, dots and bars; `neutral` is muted ink. */
export type Tone = 'inflow' | 'outflow' | 'transfer' | 'passive' | 'neutral';

export type IncomeCategoryId = 'active' | 'support' | 'passive';
export type ExpenseCategoryId = 'fixed' | 'variable' | 'other';

/** How often a line is received or paid; converted to a monthly figure for totals. */
export type Frequency = 'week' | 'biweek' | 'month' | 'year' | 'once';

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

export interface Account extends Amounted {
  name: string;
  institution: string;
  purpose: string;
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
