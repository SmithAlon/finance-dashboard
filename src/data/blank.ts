// What a first visit starts with: nothing. A visitor never sees someone else's numbers as if they
// were theirs; the demo figures in finance.ts load only when asked for.

import type { Account, CreditStore, ExpenseItem, IncomeItem, InvestmentStore } from './types';

export const blank = {
  inflows: [] as IncomeItem[],
  outflows: [] as ExpenseItem[],
  accounts: [] as Account[],
  credit: { accounts: [], msi: [] } as CreditStore,
  investments: { portfolio: null, fixedIncome: [], ppr: [] } as InvestmentStore,
  /** The projection's starting cash: not entered. */
  startingCash: null,
};
