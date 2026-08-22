import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { hospitalPath, isHospitalRole, type HospitalStaticView } from '@/app/router/paths';
import { cn } from '@/shared/lib/cn';
import { money, moneyShort } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { BarChart } from '@/shared/ui/BarChart';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { KpiStrip } from '@/shared/ui/KpiStrip';
import { LineChart } from '@/shared/ui/LineChart';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import type { StatCardData } from '@/shared/ui/StatCard';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import { DOCTOR_META } from '@/features/appointments/application/store/appointments.types';
import { useSettlementsStore } from '@/features/settlements/application/store/settlements.store';

import {
  OverviewHeader,
  type Period,
} from '@/features/dashboard/presentation/components/OverviewHeader';

/** Appointments-by-department bars (design `AD_DEPT`), per-bar colours from data. */
const AD_DEPT: readonly { l: string; v: number; color: string }[] = [
  { l: 'Cardio', v: 62, color: 'var(--color-blue)' },
  { l: 'Ortho', v: 48, color: 'var(--color-p-400)' },
  { l: 'Pedia', v: 55, color: 'var(--color-g-500)' },
  { l: 'Neuro', v: 31, color: 'var(--color-y-500)' },
  { l: 'ENT', v: 27, color: 'var(--color-blue-strong)' },
  { l: 'Derma', v: 38, color: 'var(--color-p-300)' },
];

const AD_RATINGS: Record<string, string> = {
  'Dr. Thomas K.': '4.9',
  'Dr. Anil R.': '4.6',
  'Dr. Geetha R.': '4.7',
  'Dr. Kumar V.': '4.8',
  'Dr. Maya S.': '4.5',
  'Dr. Arun B.': '4.4',
  'Dr. Leela P.': '4.6',
};

// period scaling for the believable cumulative figures (Today is real where possible)
const AD_FACT: Record<Period, number> = {
  Today: 1,
  Yesterday: 0.94,
  'This Week': 6.2,
  'This Month': 26.5,
};
const AD_FOOT: Record<Period, readonly { l: string; v: number }[]> = {
  Today: [
    { l: '8a', v: 22 },
    { l: '10a', v: 64 },
    { l: '12p', v: 88 },
    { l: '2p', v: 54 },
    { l: '4p', v: 72 },
    { l: '6p', v: 40 },
  ],
  Yesterday: [
    { l: '8a', v: 18 },
    { l: '10a', v: 58 },
    { l: '12p', v: 80 },
    { l: '2p', v: 50 },
    { l: '4p', v: 66 },
    { l: '6p', v: 34 },
  ],
  'This Week': [
    { l: 'Mon', v: 288 },
    { l: 'Tue', v: 312 },
    { l: 'Wed', v: 298 },
    { l: 'Thu', v: 330 },
    { l: 'Fri', v: 356 },
    { l: 'Sat', v: 402 },
    { l: 'Sun', v: 120 },
  ],
  'This Month': [
    { l: 'Wk 1', v: 1420 },
    { l: 'Wk 2', v: 1580 },
    { l: 'Wk 3', v: 1490 },
    { l: 'Wk 4', v: 1710 },
  ],
};

/** A "Requires Attention" row (design's `ALERTS` items). */
interface Alert {
  readonly icon: IconName;
  readonly iconClass: string;
  readonly t: string;
  readonly s: string;
  readonly go: HospitalStaticView;
}

/** Admin (hospital) dashboard — design `Dashboard.jsx` `AdminDashboard`. */
export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const { role } = useParams();
  const activeRole = isHospitalRole(role) ? role : 'admin';
  const go = (view: HospitalStaticView): void => {
    navigate(hospitalPath(activeRole, view));
  };

  const appts = useAppointmentsStore((s) => s.appts);
  const docStatus = useAppointmentsStore((s) => s.docStatus);
  const settlements = useSettlementsStore((s) => s.settlements);
  const [period, setPeriod] = useState<Period>('Today');

  const factor = AD_FACT[period] || 1;
  const periodWord =
    period === 'Today' ? 'today' : period === 'Yesterday' ? 'yesterday' : period.toLowerCase();
  const footData = AD_FOOT[period] || AD_FOOT['Today'];
  const deptData = AD_DEPT.map((d) => ({ ...d, v: Math.max(1, Math.round(d.v * factor)) }));
  const docNames = Object.keys(DOCTOR_META);
  const activeDocs = docNames.filter((d) => {
    const st: string = docStatus[d];
    return st !== 'On Break' && st !== 'Inactive';
  }).length;
  const docAppt = (name: string): number =>
    appts.filter(
      (a) =>
        a.doctor === name && a.date === 'Today' && !['Cancelled', 'No-show'].includes(a.status),
    ).length;
  const perfDocs = docNames
    .map((name) => ({
      name,
      dept: DOCTOR_META[name].dept,
      appts: period === 'Today' ? docAppt(name) : Math.round((docAppt(name) + 3) * factor),
      rating: AD_RATINGS[name] || '4.5',
      status: docStatus[name] === 'On Break' ? 'On Leave' : 'Active',
    }))
    .sort((a, b) => b.appts - a.appts)
    .slice(0, 5);
  const overdue = settlements.filter((r) => r.status === 'Overdue');
  const pendingSettle = settlements.filter((r) => r.status !== 'Received');
  const pendingPay = appts.filter((a) => a.payment === 'Pending').length;
  const realToday = appts.filter((a) => a.date === 'Today').length;
  const realRev =
    appts.filter((a) => a.payment === 'Paid').reduce((s, a) => s + a.amount, 0) + 112000;
  const apptTotals: Record<Period, number> = {
    Today: realToday,
    Yesterday: 96,
    'This Week': 1996,
    'This Month': 6200,
  };
  const revTotals: Record<Period, number> = {
    Today: realRev,
    Yesterday: 132400,
    'This Week': 884000,
    'This Month': 3762000,
  };

  const KPIS: readonly StatCardData[] = [
    {
      icon: 'calendar-check',
      label: period === 'Today' ? 'Appointments Today' : 'Appointments',
      value: apptTotals[period],
      sub: period === 'Today' ? 'Online + walk-in' : `Booked ${periodWord}`,
      iconClass: 'bg-g-100 text-g-600',
      valueClass: 'text-g-600',
    },
    {
      icon: 'stethoscope',
      label: 'Active Doctors',
      value: String(activeDocs),
      sub: `of ${docNames.length} on roster`,
      iconClass: 'bg-blue-soft-bg text-blue',
      valueClass: 'text-blue',
    },
    {
      icon: 'users',
      label: 'Total Patients',
      value: '12,480',
      sub: 'All-time registered',
      iconClass: 'bg-p-100 text-p-500',
      valueClass: 'text-p-500',
    },
    {
      icon: 'indian-rupee',
      label: period === 'Today' ? 'Revenue Today' : 'Revenue',
      value: moneyShort(revTotals[period]),
      sub: period === 'Today' ? 'Desk + online prepaid' : `Earned ${periodWord}`,
      iconClass: 'bg-y-100 text-y-600',
      valueClass: 'text-y-600',
    },
  ];

  const ALERTS: Alert[] = [];
  if (pendingPay) {
    ALERTS.push({
      icon: 'indian-rupee',
      iconClass: 'bg-d-100 text-d-500',
      t: `${pendingPay} walk-in payment${pendingPay === 1 ? '' : 's'} pending`,
      s: 'Awaiting collection at the desk',
      go: 'appointments',
    });
  }
  if (overdue.length) {
    ALERTS.push({
      icon: 'triangle-alert',
      iconClass: 'bg-y-100 text-y-600',
      t: `${overdue.length} settlement${overdue.length === 1 ? '' : 's'} overdue`,
      s: `${money(overdue.reduce((s, r) => s + r.net, 0))} due from Medibook`,
      go: 'settlements',
    });
  }
  ALERTS.push({
    icon: 'scale',
    iconClass: 'bg-blue-soft-bg text-blue',
    t: `${pendingSettle.length} settlements awaiting transfer`,
    s: `${money(pendingSettle.reduce((s, r) => s + r.net, 0))} expected from Medibook`,
    go: 'settlements',
  });

  return (
    <div className="flex flex-col gap-5">
      <OverviewHeader title="Hospital Overview" period={period} setPeriod={setPeriod} />
      <KpiStrip items={KPIS} />
      <div className="flex gap-5">
        <Card className="flex-[3]">
          <SectionTitle size={16} className="mb-4.5">
            Appointments by Department — {period}
          </SectionTitle>
          <BarChart data={deptData} height={210} />
        </Card>
        <Card className="flex-[2]">
          <SectionTitle size={16} className="mb-4">
            Requires Attention
          </SectionTitle>
          <div className="flex flex-col gap-3">
            {ALERTS.map((a, i) => (
              <button
                type="button"
                key={i}
                onClick={() => go(a.go)}
                className="border-border-soft hover:bg-grey-200 flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition-colors duration-150"
              >
                <div
                  className={cn(
                    'flex size-9.5 flex-none items-center justify-center rounded-md',
                    a.iconClass,
                  )}
                >
                  <Icon name={a.icon} size={19} />
                </div>
                <div className="flex-1">
                  <div className="text-body text-text-strong font-medium">{a.t}</div>
                  <div className="text-caption text-text-muted">{a.s}</div>
                </div>
                <Icon name="chevron-right" size={18} className="text-text-faint" />
              </button>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex gap-5">
        <Card className="flex-[2]">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle size={16}>Doctor Performance</SectionTitle>
            <button
              type="button"
              onClick={() => go('doctors')}
              className="text-body text-blue cursor-pointer border-0 bg-transparent p-0 font-medium"
            >
              Manage Staff
            </button>
          </div>
          <div className="border-border-soft overflow-hidden rounded-md border">
            <table className="text-body w-full border-collapse">
              <thead>
                <tr>
                  {['Doctor', 'Department', 'Appointments', 'Rating', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="bg-bg-tint text-text-navy border-border-soft border-b px-3.5 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perfDocs.map((r, i) => (
                  <tr key={i}>
                    <td className="border-border-soft text-text-strong border-b px-3.5 font-medium">
                      {r.name}
                    </td>
                    <td className="border-border-soft border-b px-3.5">{r.dept}</td>
                    <td className="border-border-soft border-b px-3.5">{r.appts}</td>
                    <td className="border-border-soft border-b px-3.5">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="star" size={14} color="var(--color-y-500)" /> {r.rating}
                      </span>
                    </td>
                    <td className="border-border-soft border-b px-3.5">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="flex-1">
          <SectionTitle size={16} className="mb-4">
            Patient Footfall — {period}
          </SectionTitle>
          <LineChart data={footData} color="var(--color-g-600)" height={200} />
        </Card>
      </div>
    </div>
  );
}
