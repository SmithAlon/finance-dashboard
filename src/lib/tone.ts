import type { Tone } from '../data/types';

// Full class strings per semantic tone, written out so Tailwind can detect them.
export const tones: Record<Tone, { dot: string; text: string; badge: string }> = {
  inflow: { dot: 'bg-inflow', text: 'text-inflow', badge: 'bg-inflow/12 text-inflow ring-inflow/25' },
  outflow: { dot: 'bg-outflow', text: 'text-outflow', badge: 'bg-outflow/12 text-outflow ring-outflow/25' },
  transfer: { dot: 'bg-transfer', text: 'text-transfer', badge: 'bg-transfer/12 text-transfer ring-transfer/25' },
  passive: { dot: 'bg-passive', text: 'text-passive', badge: 'bg-passive/12 text-passive ring-passive/25' },
};
