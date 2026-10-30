// Reads the portfolio CSV that the GBM app exports ("Detalle Portafolio"). The file is a stack of
// sections: a title row ("Mercado de Capitales USA", "Liquidez"), a header row starting with
// "Emisora/Fondo", then one row per position until a blank row. Money is written "$1,234.56" or
// "-$0.230", títulos with a decimal comma ("0,50096519"), and "-" means GBM shows nothing (unknown,
// never 0). Pure, so the build parses the saved file and the browser parses an imported one.

import type { Currency, Maybe, Portfolio, Position } from '../data/types';

/** Splits one CSV line, honouring double-quoted fields ("0,50096519") and doubled quotes inside them. */
function cells(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') out.push(cur), (cur = '');
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** "Títulos" → "titulos", so headers match whatever accents or case the export uses. */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** "$1,234.56", "-$0.230" → number; "-" or blank → null. */
const money = (s = ''): Maybe => {
  const t = s.replace(/[$\s]/g, '').replace(/,/g, '');
  return t === '' || t === '-' || Number.isNaN(Number(t)) ? null : Number(t);
};

/** Títulos use a decimal comma: "0,50096519" → 0.50096519; "1.234,5" → 1234.5. */
const shares = (s = ''): Maybe => {
  const t = s.replace(/\s/g, '');
  if (t === '' || t === '-') return null;
  const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
  return Number.isNaN(n) ? null : n;
};

const COLUMNS = {
  ticker: 'emisora/fondo',
  shares: 'titulos',
  avgCost: 'costo promedio',
  price: 'precio mercado',
  value: 'valor mercado',
  cost: 'imp x cto',
} as const;

/** The export's file name ends in a millisecond timestamp ("…_USA_1790000000000"): the day it was taken. */
const asOfFromName = (name: string): string | null => {
  const ms = Number(name.match(/_(\d{13})(?:\D|$)/)?.[1]);
  if (!ms) return null;
  const d = new Date(ms);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};

/** Throws an Error with a sentence for the person when the file is not a GBM portfolio export. */
export function parseGbmCsv(text: string, file: string): Portfolio {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).map(cells);
  const positions: Position[] = [];
  const titles: string[] = [];
  let section = '';
  let col: Record<keyof typeof COLUMNS, number> | null = null;

  for (const row of lines) {
    const filled = row.filter(Boolean);
    if (!filled.length) {
      col = null;
      continue;
    }
    if (norm(row[0]) === COLUMNS.ticker) {
      const header = row.map(norm);
      col = Object.fromEntries(Object.entries(COLUMNS).map(([k, h]) => [k, header.indexOf(h)])) as typeof col;
      continue;
    }
    if (!col) {
      if (filled.length === 1) section = row[0];
      if (section && !titles.includes(section)) titles.push(section);
      continue;
    }
    const get = (k: keyof typeof COLUMNS) => (col![k] >= 0 ? row[col![k]] : '');
    const ticker = get('ticker');
    if (!ticker) continue;
    const cash = /^liquidez/i.test(norm(section)) || norm(ticker) === 'efectivo';
    positions.push({
      ticker: cash ? 'Cash' : ticker,
      cash,
      shares: shares(get('shares')),
      avgCost: money(get('avgCost')),
      price: money(get('price')),
      value: money(get('value')),
      cost: cash ? null : money(get('cost')),
    });
  }

  if (!positions.length)
    throw new Error(`${file} has no positions. Export the portfolio detail CSV from the GBM app ("Detalle Portafolio") and import that file.`);
  const usa = /\busa\b/i.test(file) || titles.some((t) => /\busa\b/i.test(t));
  const currency: Currency = usa ? 'USD' : 'MXN';
  return { file, account: titles.find((t) => !/^liquidez/i.test(norm(t))) ?? 'GBM', currency, asOf: asOfFromName(file), positions };
}
