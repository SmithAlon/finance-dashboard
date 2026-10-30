// Client-only: which data the page starts from. A first visit starts blank, never with someone
// else's numbers. "demo" loads the fictional figures in finance.ts (each editor carries them as
// `data-demo`); "own" means the visitor chose to enter their own. Stored data always wins over
// either seed, so this only decides what an editor shows before anything was saved.

export type Mode = 'demo' | 'own';

export const MODE_KEY = 'finance:mode:v1';
/** Every key this app writes starts with this. */
export const PREFIX = 'finance:';

export const readMode = (): Mode | null => {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === 'demo' || m === 'own' ? m : null;
  } catch {
    return null;
  }
};

export const setMode = (m: Mode) => {
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch {}
};

/** The app's keys in this browser, the mode marker included. */
export const appKeys = (): string[] => {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  } catch {
    return [];
  }
};

/** Whether anything the visitor entered (not just the mode marker) is saved here. */
export const hasUserData = () => appKeys().some((k) => k !== MODE_KEY);

/** Removes everything the app saved in this browser, the mode marker included. */
export const clearAppData = () => {
  try {
    appKeys().forEach((k) => localStorage.removeItem(k));
  } catch {}
};

/** The seed an editor starts from: its `data-demo` in demo mode, else its blank `data-seed`. */
export const seedOf = <T>(root: HTMLElement): T =>
  JSON.parse((readMode() === 'demo' && root.dataset.demo) || root.dataset.seed!);

/** Asks before an editor's Reset button discards what is in it. */
export const confirmReset = () =>
  confirm(
    readMode() === 'demo'
      ? 'Put the demo figures in this section back as they were?'
      : "Clear everything in this section? It can't be undone unless you exported a backup.",
  );

/** Replaces whatever is saved with the demo figures, after asking if there is anything to lose. */
export const loadDemo = () => {
  if (hasUserData() && !confirm('Load the demo data? It replaces everything you have entered in this browser.')) return;
  clearAppData();
  setMode('demo');
  location.reload();
};

/** Leaves the demo: clears it and starts with empty lists. */
export const startBlank = () => {
  if (!confirm('Remove the demo data and start blank? Changes you made to the demo go too.')) return;
  clearAppData();
  setMode('own');
  location.reload();
};

/** Erases everything the app saved here; the next load is a first visit again. */
export const eraseAll = () => {
  if (!confirm("Erase everything this dashboard saved in this browser? It can't be undone.")) return;
  clearAppData();
  location.reload();
};
