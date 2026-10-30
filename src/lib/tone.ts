import type { Tone } from '../data/types';
import type { SliceFill } from './investments';

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

// The Investments donut's slots (`SliceFill`): a dot for the legend and a stroke for the SVG ring.
// Categories, not meanings: amber, teal and pink exist only for this chart, and inflow/outflow are
// never reused. c0…c5 sit next to each other around the ring in this order, which keeps every
// adjacent pair (last to first included) at CVD ΔE ≥ 10 in both themes; brand next to passive did not.
export const sliceFills: Record<SliceFill, { dot: string; stroke: string }> = {
  c0: { dot: 'bg-brand', stroke: 'stroke-brand' },
  c1: { dot: 'bg-chart-teal', stroke: 'stroke-chart-teal' },
  c2: { dot: 'bg-passive', stroke: 'stroke-passive' },
  c3: { dot: 'bg-chart-amber', stroke: 'stroke-chart-amber' },
  c4: { dot: 'bg-transfer', stroke: 'stroke-transfer' },
  c5: { dot: 'bg-chart-pink', stroke: 'stroke-chart-pink' },
  other: { dot: 'bg-ink-2', stroke: 'stroke-ink-2' },
  cash: { dot: 'bg-ink-3', stroke: 'stroke-ink-3' },
};
