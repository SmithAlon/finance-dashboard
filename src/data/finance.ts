// Demo data for a fictional user, plus the category lists every visitor uses. A first visit starts
// blank (src/data/blank.ts); these figures load only after "Load demo data". Edits made in the
// browser are kept in localStorage and never written back to this file. Keep real numbers out.

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
  { name: 'Emergency fund', institution: 'Example Bank', amount: 40000 },
  { name: 'Checking', institution: 'Example Bank', amount: 8000 },
];

// Demo credit: one card paid in full each month, carrying an interest-free (MSI) purchase.
export const credit: CreditStore = {
  accounts: [
    {
      id: 'demo-card', type: 'card', issuer: 'other', issuerOther: 'Example Bank', nickname: 'Everyday card',
      interestRate: 45, dueDay: 5, balanceUpdatedAt: '2026-10-25', creditLimit: 30000, currentBalance: 14600,
      statementBalance: 4800, cutoffDay: 15, payToAvoidInterest: 4800, minimumPayment: 600, plannedPayment: 4800, cat: 62,
    },
  ],
  msi: [{ id: 'demo-msi', cardId: 'demo-card', merchant: 'Laptop', monthlyAmount: 1400, monthsRemaining: 7 }],
};

// Demo investments. The portfolio is the sample GBM export saved next to this file, parsed in
// index.astro; its file name's timestamp dates it.
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
