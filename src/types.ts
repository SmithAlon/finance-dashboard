// View and derived types: shapes computed from the domain data or used only by the UI.

/** MXN split across the three 50/30/20 buckets (used for both target and plan). */
export interface Allocation {
  obligations: number;
  savings: number;
  investing: number;
}

export type TabId = 'inflows' | 'outflows' | 'accounts' | 'debt';

export interface Tab {
  id: TabId;
  label: string;
}

