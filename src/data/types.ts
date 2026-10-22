// Domain types: the shape of the data in finance.ts.

/** Anything with a monthly or balance amount in MXN. */
export interface Amounted {
  amount: number;
}

/** A monthly inflow or outflow line. */
export interface FlowItem extends Amounted {
  label: string;
}

/** Semantic cashflow colours shared by badges, dots and bars. */
export type Tone = 'inflow' | 'outflow' | 'transfer' | 'passive';

export type IncomeCategoryId = 'active' | 'support' | 'passive';

/** How often an income line is received; converted to a monthly figure for totals. */
export type Frequency = 'week' | 'biweek' | 'month' | 'year' | 'once';

/** A group the Inflows form divides income into. */
export interface IncomeCategory {
  id: IncomeCategoryId;
  label: string;
  hint: string;
  tone: Tone;
}

/** A monthly inflow line, tagged with the category it belongs to. */
export interface IncomeItem extends FlowItem {
  category: IncomeCategoryId;
}

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
