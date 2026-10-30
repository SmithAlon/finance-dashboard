// How old the build-time USD→MXN rate is. The site is static, so a rate only moves when the site
// is rebuilt; showing its age keeps a stale dollar value from passing as current.

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
  return age.stale ? `The USD→MXN rate is ${age.days} days old, so dollar values may be off. Rebuild the site or run npm run prices to refresh it.` : null;
}
