// Liquid net worth: accounts plus the portfolio and fixed income, minus what is owed on credit.
// PPR is left out because it is locked until retirement. Shared by the server markup and the
// Headline script. A figure that is not known makes the result "can't compute", never a guess.

import type { CreditSummary } from './credit';
import { mxn } from './format';
import type { InvestmentSummary } from './investments';

export interface NetWorth {
  /** Null when something that counts has no known value. */
  value: number | null;
  note: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function liquidNetWorth(assets: number, inv: InvestmentSummary, debt: CreditSummary): NetWorth {
  const liquid = inv.buckets.filter((b) => b.id !== 'ppr');
  const rows = liquid.reduce((s, b) => s + b.rows.length, 0);
  const invested = liquid.reduce((s, b) => s + b.value, 0);
  const unknownInv = liquid.reduce((s, b) => s + b.unknown, 0);
  const owing = debt.views.length > 0;

  const gaps = [
    ...(owing && !debt.complete ? [`${plural(debt.unknown, 'credit account', 'credit accounts')} with no balance entered`] : []),
    ...(unknownInv ? [`${plural(unknownInv, 'investment', 'investments')} with no value known`] : []),
  ];
  if (gaps.length) return { value: null, note: `Can't compute: ${gaps.join(' · ')}` };

  const parts = `${mxn(assets)} in accounts` + (rows ? ` + ${mxn(invested)} invested` : '');
  return {
    value: assets + invested - debt.owedKnown,
    note: owing ? `${parts} − ${mxn(debt.owedKnown)} owed` : `${parts} · no credit added`,
  };
}
