import type { Tone } from '../data/types';

// Full class strings per semantic tone, written out so Tailwind can detect them.
// `hero` is the tinted highlight card used for a form's total.
export const tones: Record<Tone, { dot: string; text: string; badge: string; hero: string }> = {
  inflow: {
    dot: 'bg-inflow', text: 'text-inflow', badge: 'bg-inflow/12 text-inflow ring-inflow/25',
    hero: 'border-inflow/30 ring-1 ring-inflow/20 bg-linear-to-br from-inflow/10 via-surface to-surface',
  },
  outflow: {
    dot: 'bg-outflow', text: 'text-outflow', badge: 'bg-outflow/12 text-outflow ring-outflow/25',
    hero: 'border-outflow/30 ring-1 ring-outflow/20 bg-linear-to-br from-outflow/10 via-surface to-surface',
  },
  transfer: {
    dot: 'bg-transfer', text: 'text-transfer', badge: 'bg-transfer/12 text-transfer ring-transfer/25',
    hero: 'border-transfer/30 ring-1 ring-transfer/20 bg-linear-to-br from-transfer/10 via-surface to-surface',
  },
  passive: {
    dot: 'bg-passive', text: 'text-passive', badge: 'bg-passive/12 text-passive ring-passive/25',
    hero: 'border-passive/30 ring-1 ring-passive/20 bg-linear-to-br from-passive/10 via-surface to-surface',
  },
  neutral: {
    dot: 'bg-ink-3', text: 'text-ink-2', badge: 'bg-ink-3/12 text-ink-2 ring-ink-3/25',
    hero: 'border-ink-3/30 ring-1 ring-ink-3/20 bg-linear-to-br from-ink-3/10 via-surface to-surface',
  },
};
