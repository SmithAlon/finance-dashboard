// View and derived types: shapes computed from the domain data or used only by the UI.

export type TabId = 'balance' | 'debt' | 'accounts' | 'investments';

/** The Incomes | Expenses switch inside the Balance tab. */
export type BalanceTabId = 'inflows' | 'outflows';

/** The This month | Card setup switch inside the Debt tab's credit editor. */
export type CreditTabId = 'credit-month' | 'credit-setup';

/** The Portfolio | Fixed income | PPR switch inside the Investments tab. */
export type InvestTabId = 'invest-portfolio' | 'invest-fixedIncome' | 'invest-ppr';
