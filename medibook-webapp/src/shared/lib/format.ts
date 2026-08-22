/**
 * Pure formatting + date helpers ported 1:1 from the design file
 * (`data.jsx` / `Ops.jsx`). No React, no stores — safe everywhere.
 */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** "₹ 1,02,400" (en-IN grouping); em dash for missing values. */
export function money(n: number | null | undefined): string {
  if (n == null) return '—';
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

/** Compact rupee figures for KPI tiles: "₹ 2.6L", "₹ 9.8K". */
export function moneyShort(n: number): string {
  if (n >= 100000) return '₹ ' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + 'L';
  if (n >= 1000) return '₹ ' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
  return '₹ ' + n;
}

/** "2026-06-20" -> "20 Jun 2026"; em dash for missing values. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d} ${MONTHS_SHORT[Number(m) - 1]} ${y}`;
}

/** ISO date -> the relative labels the hospital seed uses ("Today", "Tomorrow", "14 Jun"). */
export function isoToRel(iso: string): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Relative label -> ISO date (supports the "Today"/"Tomorrow" demo labels). */
export function relToISO(rel: string): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  if (rel === 'Tomorrow') t.setDate(t.getDate() + 1);
  return t.toISOString().slice(0, 10);
}

/** "8:30 am" -> minutes since midnight, for time-column sorting. */
export function timeToMinutes(t: string | null | undefined): number {
  const m = /(\d+):(\d+)\s*(am|pm)/i.exec(t ?? '');
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}

/** "June 13, 2026 · 09:42" -> timestamp (date part only), for log sorting. */
export function opsTime(s: string): number {
  return Date.parse(String(s).split('·')[0].trim()) || 0;
}

/** Hospital-wide running token: 7 -> "T-007". */
export function formatToken(seq: number): string {
  return 'T-' + String(seq).padStart(3, '0');
}
