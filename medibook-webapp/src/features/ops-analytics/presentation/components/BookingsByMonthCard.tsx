import { Card } from '@/shared/ui/Card';
import { SectionTitle } from '@/shared/ui/SectionTitle';

/** [month letter, booking count] — the design's 12-month series. */
const MONTHS: readonly (readonly [string, number])[] = [
  ['M', 2840],
  ['J', 3120],
  ['J', 3480],
  ['A', 3920],
  ['S', 3610],
  ['O', 3890],
  ['N', 4180],
  ['D', 4420],
  ['J', 4160],
  ['F', 4480],
  ['M', 4720],
  ['A', 4890],
];

/** Full-height reference used to scale every bar (design `mmax`). */
const MMAX = 5000;

/**
 * "Bookings by Month" — inline custom bar chart. Each column reveals a value
 * tooltip and darkens on hover (design's `hover === i` swap, as CSS group-hover).
 */
export function BookingsByMonthCard() {
  return (
    <Card>
      <div className="mb-4.5 flex items-baseline justify-between">
        <SectionTitle>Bookings by Month</SectionTitle>
        <span className="text-caption text-text-faint">Last 12 months</span>
      </div>
      <div className="flex h-52.5 items-end gap-2.5 px-1">
        {MONTHS.map(([d, v], i) => (
          <div
            key={`${d}-${i}`}
            className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end gap-2"
          >
            <span
              className="text-caption bg-text-strong pointer-events-none absolute z-[5] hidden rounded-sm px-2.5 py-1 whitespace-nowrap text-white group-hover:block"
              style={{ bottom: `calc(${(v / MMAX) * 100}% + 26px)` }}
            >
              {v.toLocaleString('en-IN')} bookings
            </span>
            <div
              className="bg-p-500 group-hover:bg-p-600 min-h-1 w-full max-w-7.5 rounded-t-sm transition-colors duration-150"
              style={{ height: `${(v / MMAX) * 100}%` }}
            />
            <span className="text-caption text-text-muted">{d}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
