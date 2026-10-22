// Single source of truth for the dashboard. Edit numbers here; everything recomputes.
// Source: "Financial Context Profile.pdf" (Master Financial Context Profile) + saved goals.

import type { Account, ActionItem, Defaults, FlowItem, Framework, Goals, IncomeCategory, IncomeItem } from './types';

export const incomeCategories: IncomeCategory[] = [
  { id: 'active', label: 'Active income', hint: 'Salary, stipend, freelance: money earned by working.', tone: 'inflow' },
  { id: 'support', label: 'Support & transfers', hint: 'Family support, scholarships, allowances.', tone: 'transfer' },
  { id: 'passive', label: 'Passive & other', hint: 'Interest, dividends, rent, refunds.', tone: 'passive' },
];

// Starting values for the Inflows form; the form's edits are kept in the browser.
export const inflows: IncomeItem[] = [
  { label: 'Corporate internship stipend', amount: 9065, category: 'active' },
  { label: 'Family support ($600/wk × 52 ÷ 12)', amount: 2600, category: 'support' },
];

export const outflows: FlowItem[] = [
  { label: 'Digital & work tools (Claude Pro)', amount: 400 },
  { label: 'Telecom (mobile recharge)', amount: 400 },
  { label: 'Lifestyle & snacks', amount: 800 },
];

export const accounts: Account[] = [
  { name: 'Fixed income (liquid yield)', institution: 'Openbank', purpose: 'Emergency reserve', amount: 23000 },
  { name: 'Checking', institution: 'Nu México', purpose: 'Operational cash flow', amount: 5500 },
  { name: 'Credit guarantee deposit', institution: 'Nu México', purpose: 'Secured credit line buffer', amount: 1000 },
  { name: 'Brokerage cash ($120 USD)', institution: 'GBM', purpose: 'Unallocated, ready to invest', amount: 2400 },
];

export const debt: number = 0;

// 50/30/20 framework. The profile's spend is far below the 50% "needs + lifestyle" bucket,
// so the surplus is split between savings and investing in the same 30:20 ratio.
export const framework: Framework = { obligations: 0.5, savings: 0.3, investing: 0.2 };

export const goals: Goals = {
  today: '2026-10-21',
  wedding: { label: 'Wedding', date: '2029-10-21', target: 150000, targetIsPlaceholder: true },
  trip: { label: 'Trip', target: 30000 },
  graduation: { label: 'Graduation', date: '2027-06-30' },
};

export const defaults: Defaults = {
  savingsYield: 0.08, // annual, liquid fixed income (editable in UI)
  investYield: 0.09, // annual, broad-market index long-run assumption (editable in UI)
};

export const actionPlan: ActionItem[] = [
  { title: 'Deploy the idle $120 USD in GBM', detail: 'Assign the ~$2,400 MXN cash into a broad-market index ETF to stop cash drag.', due: 'This week' },
  { title: 'Automate monthly DCA', detail: 'Recurring monthly transfer split into investing, savings and lifestyle buckets.', due: 'This month' },
  { title: 'Keep Nu card utilization under 10–20%', detail: 'Auto-pay in full each cycle to keep building Buró de Crédito history.', due: 'Ongoing' },
  { title: 'Plan the post-graduation step-up', detail: 'Graduation in June 2027: re-run the split when salary and benefits change.', due: 'Mar 2027' },
];
