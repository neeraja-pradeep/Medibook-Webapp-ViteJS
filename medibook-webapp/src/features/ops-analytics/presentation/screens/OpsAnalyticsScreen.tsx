import { KpiStrip } from '@/shared/ui/KpiStrip';
import type { StatCardData } from '@/shared/ui/StatCard';

import { BookingsByMonthCard } from '@/features/ops-analytics/presentation/components/BookingsByMonthCard';
import { DepartmentSplitCard } from '@/features/ops-analytics/presentation/components/DepartmentSplitCard';
import { TopHospitalsByUsageCard } from '@/features/ops-analytics/presentation/components/TopHospitalsByUsageCard';

/**
 * Usage-analytics KPI tiles. The prototype's `{ c, bg, sc }` CSS-color contract
 * maps to StatCard's Tailwind class contract (`iconClass`/`valueClass`/`subClass`).
 */
const KPIS: readonly StatCardData[] = [
  {
    icon: 'calendar-check',
    label: 'Total Bookings',
    value: '48,240',
    sub: '+8.2% vs last week',
    iconClass: 'bg-blue-soft-bg text-text-navy',
    valueClass: 'text-text-navy',
    subClass: 'text-g-600',
  },
  {
    icon: 'trending-up',
    label: 'Avg Daily Bookings',
    value: '1,608',
    sub: '+4.6% vs last week',
    iconClass: 'bg-blue-soft-bg text-blue',
    valueClass: 'text-blue',
    subClass: 'text-g-600',
  },
  {
    icon: 'circle-check',
    label: 'Booking Success Rate',
    value: '94.2%',
    sub: 'Completed vs total bookings',
    iconClass: 'bg-g-100 text-g-600',
    valueClass: 'text-g-600',
  },
  {
    icon: 'circle-x',
    label: 'Cancellation Rate',
    value: '3.1%',
    sub: '−2.1% vs last week',
    iconClass: 'bg-badge-noshow-bg text-orange',
    valueClass: 'text-orange',
    subClass: 'text-g-600',
  },
];

/** Ops → Usage Analytics screen (design `OpsAnalytics`). */
export function OpsAnalyticsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <KpiStrip items={KPIS} />
      <div className="grid grid-cols-[2fr_1fr] items-stretch gap-5">
        <BookingsByMonthCard />
        <DepartmentSplitCard />
      </div>
      <TopHospitalsByUsageCard />
    </div>
  );
}
