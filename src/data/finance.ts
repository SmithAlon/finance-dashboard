// Single source of truth for the dashboard. Edit numbers here; everything recomputes.
// These are SAMPLE figures for a fictional user: replace them with your own. Edits made in the
// browser are kept in localStorage and never written back to this file.

import type { Account, ActionItem, CreditStore, Defaults, ExpenseCategory, ExpenseItem, Framework, Goals, IncomeCategory, IncomeItem, InvestmentStore } from './types';

export const incomeCategories: IncomeCategory[] = [
  { id: 'active', label: 'Active income', hint: 'Salary, stipend, freelance: money earned by working.', tone: 'inflow' },
  { id: 'support', label: 'Support & transfers', hint: 'Family support, scholarships, allowances.', tone: 'transfer' },
  { id: 'passive', label: 'Passive & other', hint: 'Interest, dividends, rent, refunds.', tone: 'passive' },
];

// Starting values for the Inflows form; the form's edits are kept in the browser.
export const inflows: IncomeItem[] = [
  { label: 'Salary', amount: 18000, category: 'active' },
  { label: 'Monthly allowance', amount: 1500, category: 'support' },
];

export const expenseCategories: ExpenseCategory[] = [
  { id: 'fixed', label: 'Bills & subscriptions', hint: 'Phone, software, rent: recurring commitments.', tone: 'outflow' },
  { id: 'variable', label: 'Day-to-day spending', hint: 'Food, transport, snacks: amounts that move month to month.', tone: 'transfer' },
  { id: 'other', label: 'One-offs & other', hint: 'Gifts, repairs, annual fees.', tone: 'neutral' },
];

// Starting values for the Outflows form; the form's edits are kept in the browser.
export const outflows: ExpenseItem[] = [
  { label: 'Rent', amount: 6500, category: 'fixed' },
  { label: 'Phone plan', amount: 350, category: 'fixed' },
  { label: 'Groceries & eating out', amount: 3500, category: 'variable' },
  { label: 'Transport', amount: 900, category: 'variable' },
];

export const accounts: Account[] = [
  { name: 'Emergency fund', institution: 'Example Bank', purpose: 'Three months of expenses', amount: 40000 },
  { name: 'Checking', institution: 'Example Bank', purpose: 'Operational cash flow', amount: 8000 },
];

// Starting values for the Debt tab's credit accounts; the editor's changes are kept in the browser.
// Nothing is listed as outstanding in the sample.
export const credit: CreditStore = { accounts: [], msi: [] };

// Starting values for the Investments tab; the editor's changes are kept in the browser. The
// portfolio is the GBM export saved next to this file, parsed in index.astro; to update it, replace
// the CSV (and `name`, whose timestamp dates it) or import a newer one from the tab.
export const investments: InvestmentStore = { portfolio: null, fixedIncome: [], ppr: [] };
export { default as gbmPortfolioCsv } from './gbm-portfolio.csv?raw';
export const gbmPortfolioFile = 'App_GBM_Detalle_Portafolio_USA_1790000000000.csv';

// 50/30/20 framework (unused for now; kept for a future restore).
export const framework: Framework = { obligations: 0.5, savings: 0.3, investing: 0.2 };

export const goals: Goals = {
  today: '2026-10-30',
  wedding: { label: 'Big purchase', date: '2029-10-30', target: 150000, targetIsPlaceholder: true },
  trip: { label: 'Trip', target: 30000 },
  graduation: { label: 'Course ends', date: '2027-06-30' },
};

export const defaults: Defaults = {
  savingsYield: 0.08, // annual, liquid fixed income (editable in UI)
  investYield: 0.09, // annual, broad-market index long-run assumption (editable in UI)
};

export const actionPlan: ActionItem[] = [
  { title: 'Invest a fixed amount every month', detail: 'Same amount on the same day, split across the instruments you choose. No market timing.', due: 'Monthly' },
  { title: 'Keep card utilization under 10–20%', detail: 'Auto-pay in full each cycle to keep building credit history.', due: 'Ongoing' },
];
