// The Accounts tab's maths, shared by its editor, the Headline and the Debt summary. An account
// with no balance entered is unknown: it makes the total partial, never adds 0. Each account has
// its own currency; totals are in pesos, and an account whose currency has no rate is unknown too.

import type { Account, Maybe, RateTable } from '../data/types';
import { BASE, convert } from './currency';

export interface AccountsSummary {
  count: number;
  /** Sum in pesos of the balances that are known. */
  known: number;
  /** Accounts with no balance entered. */
  unknown: number;
  /** Accounts with a balance whose currency has no rate. */
  noRate: number;
  /** The full total in pesos, or null when there are no accounts or any balance is unknown. */
  total: Maybe;
}

/** An account's balance in pesos; null when not entered or its currency has no rate. */
export const accountInBase = (a: Account, table: RateTable | null): Maybe => convert(a.amount, a.currency ?? BASE, BASE, table);

export const summarizeAccounts = (accounts: Account[], table: RateTable | null): AccountsSummary => {
  const unknown = accounts.filter((a) => a.amount == null).length;
  const noRate = accounts.filter((a) => a.amount != null && accountInBase(a, table) == null).length;
  const known = accounts.reduce((s, a) => s + (accountInBase(a, table) ?? 0), 0);
  return { count: accounts.length, known, unknown, noRate, total: accounts.length && !unknown && !noRate ? known : null };
};

/** A secured card's deposit in pesos: the account whose name starts with "Credit" ("Credit guarantee deposit"). 0 when there is none. */
export const guaranteeDeposit = (accounts: Account[], table: RateTable | null): Maybe => {
  const a = accounts.find((x) => x.name.trim().toLowerCase().startsWith('credit'));
  return a ? accountInBase(a, table) : 0;
};
