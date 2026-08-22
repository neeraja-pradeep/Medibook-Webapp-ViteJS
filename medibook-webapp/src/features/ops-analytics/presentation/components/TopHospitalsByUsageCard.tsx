import { useNavigate } from 'react-router-dom';

import { Card } from '@/shared/ui/Card';
import { SectionTitle } from '@/shared/ui/SectionTitle';

import { opsPath } from '@/app/router/paths';

/** [hospital, booking count] — the design's usage leaderboard. */
const TOP: readonly (readonly [string, number])[] = [
  ['Meridian City Hospital', 7450],
  ['Lotus Heart Institute', 6120],
  ['Trinity Care & Research', 5210],
  ['Charak Institute of Medicine', 4890],
  ['Sunrise Multispeciality', 4280],
  ['Apollo Hospital', 3120],
];

/** Usage bars are scaled to the top hospital (design divides by 7450). */
const TOP_MAX = 7450;

/** "Top Hospitals by Usage" — leaderboard bars; "View All" opens the registry. */
export function TopHospitalsByUsageCard() {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="mb-4.5 flex items-center justify-between">
        <SectionTitle>Top Hospitals by Usage</SectionTitle>
        <button
          type="button"
          onClick={() => navigate(opsPath('hospitals'))}
          className="text-body text-blue cursor-pointer font-medium"
        >
          View All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {TOP.map(([name, count]) => (
          <div key={name} className="flex items-center gap-4">
            <span className="text-body text-text-strong w-57.5 flex-none font-medium">{name}</span>
            <div className="bg-grey-300 h-2 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-p-500 h-full rounded-full"
                style={{ width: `${Math.round((count / TOP_MAX) * 100)}%` }}
              />
            </div>
            <span className="text-caption text-text-muted w-30 flex-none text-right tabular-nums">
              {count.toLocaleString('en-IN')} bookings
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
