import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { SectionTitle } from '@/shared/ui/SectionTitle';

/** The four period presets the admin dashboard scales its figures against. */
export const PERIOD_OPTIONS = ['Today', 'Yesterday', 'This Week', 'This Month'] as const;

export type Period = (typeof PERIOD_OPTIONS)[number];

/** Narrow a raw select value back to the closed `Period` set. */
export function isPeriod(value: string): value is Period {
  return (PERIOD_OPTIONS as readonly string[]).includes(value);
}

interface OverviewHeaderProps {
  title: string;
  period: Period;
  setPeriod: (period: Period) => void;
}

/** Card header with a title + period filter (design `Dashboard.jsx` `OverviewHeader`). */
export function OverviewHeader({ title, period, setPeriod }: OverviewHeaderProps) {
  return (
    <Card className="flex items-center justify-between" pad={16}>
      <SectionTitle size={20}>{title}</SectionTitle>
      <FilterSelect
        value={period}
        options={PERIOD_OPTIONS}
        onChange={(value) => {
          if (isPeriod(value)) setPeriod(value);
        }}
      />
    </Card>
  );
}
