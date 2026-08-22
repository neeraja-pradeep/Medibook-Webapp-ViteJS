import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { SectionTitle } from '@/shared/ui/SectionTitle';

import { isPeriod, PERIOD_OPTIONS, type Period } from './period';

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
