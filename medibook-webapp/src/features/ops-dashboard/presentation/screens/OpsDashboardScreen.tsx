import { useNavigate } from 'react-router-dom';

import { KpiStrip } from '@/shared/ui/KpiStrip';
import type { StatCardData } from '@/shared/ui/StatCard';

import { type OpsStaticView, opsPath } from '@/app/router/paths';

import { BookingUsageCard } from '@/features/ops-dashboard/presentation/components/BookingUsageCard';
import { CriticalAlertsCard } from '@/features/ops-dashboard/presentation/components/CriticalAlertsCard';
import { RecentOnboardingsCard } from '@/features/ops-dashboard/presentation/components/RecentOnboardingsCard';
import { useHospitalsStore } from '@/features/ops-hospitals/application/store/hospitals.store';

/** A dashboard KPI tile plus the ops view it navigates to (design `k.go`). */
interface OpsKpi extends StatCardData {
  readonly go: OpsStaticView;
}

/**
 * Ops console dashboard — KPI row, "Booking Usage" chart, "Critical Alerts",
 * and "Recent Hospital Onboardings" (design `OpsDashboard`, Ops.jsx).
 */
export function OpsDashboardScreen() {
  const navigate = useNavigate();
  const hospitalCount = useHospitalsStore((s) => s.hospitals.length);

  const kpis: readonly OpsKpi[] = [
    {
      icon: 'building-2',
      label: 'Total Hospitals',
      value: String(hospitalCount),
      sub: '+2 this quarter',
      iconClass: 'bg-blue-soft-bg text-text-navy',
      valueClass: 'text-text-navy',
      subClass: 'text-g-600',
      go: 'hospitals',
    },
    {
      icon: 'users',
      label: 'Active Users',
      value: '24,580',
      sub: 'Staff and admins across instances',
      iconClass: 'bg-blue-soft-bg text-blue',
      valueClass: 'text-blue',
      subClass: 'text-text-muted',
      go: 'platform-users',
    },
    {
      icon: 'indian-rupee',
      label: 'Monthly Revenue',
      value: '₹ 3.7L',
      sub: 'subscriptions · +8.2% vs last month',
      iconClass: 'bg-g-100 text-g-600',
      valueClass: 'text-g-600',
      subClass: 'text-g-600',
      go: 'billing',
    },
    {
      icon: 'calendar-check',
      label: 'Bookings Today',
      value: '1,842',
      sub: '−2.1% vs last week',
      iconClass: 'bg-badge-noshow-bg text-orange',
      valueClass: 'text-orange',
      subClass: 'text-d-500',
      go: 'analytics',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <KpiStrip items={kpis} onItem={(k) => navigate(opsPath(k.go))} />
      <div className="grid grid-cols-[2fr_1fr] items-stretch gap-5">
        <BookingUsageCard />
        <CriticalAlertsCard />
      </div>
      <RecentOnboardingsCard />
    </div>
  );
}
