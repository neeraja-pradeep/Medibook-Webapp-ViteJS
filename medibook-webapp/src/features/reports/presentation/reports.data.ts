import { money } from '@/shared/lib/format';
import type { IconName } from '@/shared/ui/icon-registry';

import type { Settlement } from '@/features/settlements/application/store/settlements.types';

/**
 * Hospital Reports catalogue + KPI builder, ported 1:1 from the design source
 * (`Admin.jsx` — `REPORTS`, `REPORT_CATS`, `CAT_STYLE`, `reportKPIs`). The
 * prototype's inline tint colors (`{ c, bg }` CSS strings) are translated to
 * Medibook Tailwind token classes per PRESENTATION_BUILD_SPEC §3.
 */

export type ReportCategory = 'Operations' | 'Finance' | 'People';

export type ReportFilter = 'date' | 'dept' | 'doctor' | 'status' | 'source' | 'mode' | 'user';

export interface ReportDef {
  readonly id: string;
  readonly name: string;
  readonly brief: string;
  readonly icon: IconName;
  readonly cat: ReportCategory;
  readonly filters: readonly ReportFilter[];
}

/** A single KPI tile datum — shape assignable to `StatCardData` (string ⊂ ReactNode). */
export interface ReportKpi {
  readonly icon: IconName;
  readonly label: string;
  readonly value: string;
  readonly sub: string;
  readonly iconClass: string;
  readonly valueClass: string;
}

/** Rolled-up settlement figures the finance reports read (design `sg`). */
export interface SettlementAggregate {
  readonly count: number;
  readonly gross: number;
  readonly commission: number;
  readonly net: number;
  readonly received: number;
  readonly overdue: number;
  readonly overdueN: number;
}

export const REPORTS: readonly ReportDef[] = [
  {
    id: 'appointment',
    name: 'Appointment Report',
    brief: 'Track appointments across doctors and departments.',
    icon: 'calendar-days',
    cat: 'Operations',
    filters: ['date', 'dept', 'doctor', 'status'],
  },
  {
    id: 'booking',
    name: 'Booking Report',
    brief: 'Track bookings by channel and slot.',
    icon: 'book-open',
    cat: 'Operations',
    filters: ['date', 'dept', 'doctor', 'source'],
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    brief: 'Track hospital earnings over time.',
    icon: 'indian-rupee',
    cat: 'Finance',
    filters: ['date', 'dept'],
  },
  {
    id: 'payment',
    name: 'Payment Report',
    brief: 'Track payments received at the desk and online.',
    icon: 'wallet',
    cat: 'Finance',
    filters: ['date', 'mode', 'source'],
  },
  {
    id: 'refund',
    name: 'Refund Report',
    brief: 'Track refunds processed by Medibook.',
    icon: 'rotate-ccw',
    cat: 'Finance',
    filters: ['date'],
  },
  {
    id: 'settlement',
    name: 'Settlement Report',
    brief: 'Track payouts received from Medibook.',
    icon: 'scale',
    cat: 'Finance',
    filters: ['date', 'status'],
  },
  {
    id: 'commission',
    name: 'Commission Report',
    brief: 'Track commission deducted on online bookings.',
    icon: 'percent',
    cat: 'Finance',
    filters: ['date'],
  },
  {
    id: 'doctor',
    name: 'Doctor Performance Report',
    brief: 'Track per-doctor load and ratings.',
    icon: 'stethoscope',
    cat: 'People',
    filters: ['date', 'dept', 'doctor'],
  },
  {
    id: 'department',
    name: 'Department Report',
    brief: 'Track department-level performance.',
    icon: 'layout-grid',
    cat: 'People',
    filters: ['date', 'dept'],
  },
  {
    id: 'cancellation',
    name: 'Cancellation / No-show Report',
    brief: 'Track cancellations and no-shows.',
    icon: 'calendar-x',
    cat: 'Operations',
    filters: ['date', 'dept', 'doctor'],
  },
  {
    id: 'patient',
    name: 'Patient Report',
    brief: 'Track patient registrations and visits.',
    icon: 'users',
    cat: 'People',
    filters: ['date', 'dept'],
  },
  {
    id: 'useractivity',
    name: 'User Activity Report',
    brief: 'Track staff logins and actions.',
    icon: 'activity',
    cat: 'People',
    filters: ['date', 'user'],
  },
  {
    id: 'bookingsource',
    name: 'Booking Source Report',
    brief: 'Track online vs walk-in mix.',
    icon: 'git-branch',
    cat: 'Operations',
    filters: ['date'],
  },
  {
    id: 'timerevenue',
    name: 'Time-based Revenue Report',
    brief: 'Track revenue trends across the range.',
    icon: 'trending-up',
    cat: 'Finance',
    filters: ['date'],
  },
];

export const REPORT_CATS: readonly string[] = ['All', 'Operations', 'Finance', 'People'];

/**
 * Design `CAT_STYLE` translated to token classes for the icon box
 * (`bg` + `c`): Operations → blue, Finance → g-600, People → p-500.
 */
export const CAT_ICON_CLASS: Record<ReportCategory, string> = {
  Operations: 'bg-blue-soft-bg text-blue',
  Finance: 'bg-g-100 text-g-600',
  People: 'bg-p-100 text-p-500',
};

/** KPI tint pairs (design `G/B/Y/P/D`) as icon-box + value token classes. */
interface KpiColor {
  readonly iconClass: string;
  readonly valueClass: string;
}
const G: KpiColor = { iconClass: 'bg-g-100 text-g-600', valueClass: 'text-g-600' };
const B: KpiColor = { iconClass: 'bg-blue-soft-bg text-blue', valueClass: 'text-blue' };
const Y: KpiColor = { iconClass: 'bg-y-100 text-y-600', valueClass: 'text-y-600' };
const P: KpiColor = { iconClass: 'bg-p-100 text-p-500', valueClass: 'text-p-500' };
const D: KpiColor = { iconClass: 'bg-d-100 text-d-500', valueClass: 'text-d-500' };

const K = (
  icon: IconName,
  label: string,
  value: string,
  sub: string,
  col: KpiColor,
): ReportKpi => ({
  icon,
  label,
  value,
  sub,
  iconClass: col.iconClass,
  valueClass: col.valueClass,
});

/** Roll up the settlement ledger into the finance-report aggregate (design `sg`). */
export function aggregateSettlements(settlements: readonly Settlement[]): SettlementAggregate {
  return settlements.reduce<SettlementAggregate>(
    (a, r) => ({
      count: a.count + 1,
      gross: a.gross + r.gross,
      commission: a.commission + r.commission,
      net: a.net + r.net,
      received: a.received + (r.status === 'Received' ? r.net : 0),
      overdue: a.overdue + (r.status === 'Overdue' ? r.net : 0),
      overdueN: a.overdueN + (r.status === 'Overdue' ? 1 : 0),
    }),
    { count: 0, gross: 0, commission: 0, net: 0, received: 0, overdue: 0, overdueN: 0 },
  );
}

/** KPI tiles per report id — Settlement/Commission derive from `sg`, rest verbatim. */
export function reportKPIs(id: string, sg: SettlementAggregate): readonly ReportKpi[] {
  switch (id) {
    case 'appointment':
      return [
        K('calendar-check', 'Total Appointments', '1,996', 'in selected range', B),
        K('circle-check', 'Completed', '1,742', '87.3%', G),
        K('calendar-x', 'Cancelled', '142', '7.1%', Y),
        K('user-x', 'No-shows', '84', '4.2%', D),
      ];
    case 'booking':
      return [
        K('book-open', 'Total Bookings', '2,040', 'online + walk-in', B),
        K('smartphone', 'Online', '1,210', '59%', G),
        K('footprints', 'Walk-in', '830', '41%', Y),
        K('calendar-days', 'Avg / day', '68', 'across the range', P),
      ];
    case 'revenue':
      return [
        K('indian-rupee', 'Total Revenue', '₹ 12.5L', 'gross collections', G),
        K('smartphone', 'Online (prepaid)', '₹ 7.8L', 'via Medibook', B),
        K('banknote', 'Walk-in (desk)', '₹ 4.7L', 'collected at desk', Y),
        K('calendar-days', 'Avg / appointment', '₹ 626', 'per consultation', P),
      ];
    case 'payment':
      return [
        K('wallet', 'Payments Recorded', '1,860', 'in range', B),
        K('banknote', 'Cash', '₹ 2.1L', 'at the desk', G),
        K('credit-card', 'UPI / Card', '₹ 2.6L', 'at the desk', Y),
        K('smartphone', 'Prepaid Online', '₹ 7.8L', 'via Medibook', P),
      ];
    case 'refund':
      return [
        K('rotate-ccw', 'Refunds Processed', '38', 'by Medibook', B),
        K('indian-rupee', 'Refunded Amount', '₹ 24,600', 'slab-based', Y),
        K('calendar-x', 'Eligible Cancellations', '142', 'in range', P),
        K('percent', 'Avg Refund', '₹ 647', 'per refund', G),
      ];
    case 'settlement':
      return [
        K('wallet', 'Total Net Payable', money(sg.net), sg.count + ' statements', B),
        K('circle-check', 'Received', money(sg.received), 'credited to account', G),
        K('triangle-alert', 'Overdue', money(sg.overdue), sg.overdueN + ' pending', D),
        K('indian-rupee', 'Gross Collected', money(sg.gross), 'online bookings', P),
      ];
    case 'commission':
      return [
        K('percent', 'Commission (10%)', money(sg.commission), 'online bookings only', Y),
        K('indian-rupee', 'Online Gross', money(sg.gross), 'booking fees', B),
        K('wallet', 'Net to Hospital', money(sg.net), 'after commission', G),
        K('smartphone', 'Walk-in Commission', '₹ 0', 'hospital keeps 100%', P),
      ];
    case 'doctor':
      return [
        K('stethoscope', 'Active Doctors', '7', 'of 7 on roster', B),
        K('calendar-check', 'Avg Appts / Doctor', '285', 'in range', G),
        K('star', 'Top Rated', 'Dr. Thomas K.', '4.9 rating', Y),
        K('smile', 'Avg Rating', '4.7 / 5', 'across doctors', P),
      ];
    case 'department':
      return [
        K('layout-grid', 'Departments', '6', 'active', B),
        K('trending-up', 'Busiest', 'Cardiology', '620 appts', G),
        K('indian-rupee', 'Top Revenue', 'Cardiology', '₹ 4.9L', Y),
        K('indian-rupee', 'Avg Fee', '₹ 708', 'per consultation', P),
      ];
    case 'cancellation':
      return [
        K('calendar-x', 'Cancellations', '142', 'in range', Y),
        K('user-x', 'No-shows', '84', 'in range', D),
        K('percent', 'Cancellation Rate', '7.1%', 'of bookings', B),
        K('percent', 'No-show Rate', '4.2%', 'of bookings', P),
      ];
    case 'patient':
      return [
        K('users', 'Total Patients', '12,480', 'all-time', B),
        K('user-plus', 'New (range)', '128', 'registrations', G),
        K('repeat', 'Returning', '64%', 'of visits', Y),
        K('calendar-check', 'Avg Visits', '2.3', 'per patient', P),
      ];
    case 'useractivity':
      return [
        K('users', 'Active Users', '6', 'of 7', B),
        K('log-in', 'Logins', '412', 'in range', G),
        K('activity', 'Actions Logged', '3,180', 'across modules', Y),
        K('user-check', 'Most Active', 'Riya Menon', 'reception', P),
      ];
    case 'bookingsource':
      return [
        K('smartphone', 'Online', '59%', '1,210 bookings', B),
        K('footprints', 'Walk-in', '41%', '830 bookings', Y),
        K('git-branch', 'Channels', '2', 'online + walk-in', G),
        K('trending-up', 'Online Growth', '+6%', 'vs last month', P),
      ];
    case 'timerevenue':
      return [
        K('indian-rupee', 'Revenue (range)', '₹ 12.5L', 'total', G),
        K('calendar-days', 'Peak Day', 'Friday', '₹ 3.56L', B),
        K('trending-up', 'vs Previous', '+12%', 'period-over-period', Y),
        K('clock', 'Peak Hours', '12–2 pm', 'busiest slots', P),
      ];
    default:
      return [];
  }
}
