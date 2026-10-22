export const mxn = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + '%';
