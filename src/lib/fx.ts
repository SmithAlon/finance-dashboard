// How old the exchange rates in use are. The browser refetches them, but offline or on a failed
// fetch the build-time snapshot is used; showing its age keeps a stale conversion from passing as current.

/** A rate older than this many days triggers a warning. */
export const FX_STALE_DAYS = 7;

const DAY = 86_400_000;

/** Whole days from the rate's date (YYYY-MM-DD) to `today`, by calendar day; never negative. */
export function fxAge(date: string, today = new Date()) {
  const [y, m, d] = date.split('-').map(Number);
  const days = Math.max(0, Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(y, m - 1, d)) / DAY));
  const text = days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
  return { days, text, stale: days > FX_STALE_DAYS };
}

/** The sentence to show when the rate is stale; null when it is fresh or there is no rate. */
export function fxWarning(date: string | null | undefined, today = new Date()): string | null {
  if (!date) return null;
  const age = fxAge(date, today);
  return age.stale
    ? `Exchange rates are ${age.days} days old (ECB, via Frankfurter), so converted values may be off. They refresh when this page can reach the rates service.`
    : null;
}
