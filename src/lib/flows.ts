import type { Account, CreditStore, InvestmentStore, Maybe } from '../data/types';
import type { ProjectionLine } from './projection';

/**
 * Client-only: the live state of the form with `data-flow-id={id}` (a FlowForm or the credit
 * editor). Before its script has run, the server seed has the same shape. Re-read on the
 * bubbling `flowchange` event.
 */
export const readState = <T>(id: string, fallback: T): T => {
  const form = document.querySelector<HTMLElement>(`[data-flow-id="${id}"]`);
  try {
    return JSON.parse(form?.dataset.state ?? form?.dataset.seed ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

export const readFlow = (id: string): ProjectionLine[] => readState<ProjectionLine[]>(id, []);
export const readAccounts = (id: string): Account[] => readState<Account[]>(id, []);
export const readCredit = (id: string): CreditStore => readState<CreditStore>(id, { accounts: [], msi: [] });
export const readInvestments = (id: string): InvestmentStore =>
  readState<InvestmentStore>(id, { portfolio: null, fixedIncome: [], ppr: [] });
/** The build-time USD→MXN rate the Investments editor was given (`data-usd-mxn`); null when none was fetched. */
export const readUsdMxn = (id: string): Maybe => {
  const raw = document.querySelector<HTMLElement>(`[data-flow-id="${id}"]`)?.dataset.usdMxn;
  return raw ? Number(raw) : null;
};
