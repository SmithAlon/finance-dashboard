// The Accounts tab's maths, shared by its editor, the Headline and the Debt summary. An account
// with no balance entered is unknown: it makes the total partial, never adds 0.

import type { Account, Maybe } from '../data/types';

export interface AccountsSummary {
  count: number;
  /** Sum of the balances that were entered. */
  known: number;
  /** Accounts with no balance entered. */
  unknown: number;
  /** The full total, or null when there are no accounts or any balance is missing. */
  total: Maybe;
}

export const summarizeAccounts = (accounts: Account[]): AccountsSummary => {
  const known = accounts.reduce((s, a) => s + (a.amount ?? 0), 0);
  const unknown = accounts.filter((a) => a.amount == null).length;
  return { count: accounts.length, known, unknown, total: accounts.length && !unknown ? known : null };
};

/** A secured card's deposit: the account whose name starts with "Credit" ("Credit guarantee deposit"). 0 when there is none. */
export const guaranteeDeposit = (accounts: Account[]): Maybe => {
  const a = accounts.find((x) => x.name.trim().toLowerCase().startsWith('credit'));
  return a ? a.amount : 0;
};
