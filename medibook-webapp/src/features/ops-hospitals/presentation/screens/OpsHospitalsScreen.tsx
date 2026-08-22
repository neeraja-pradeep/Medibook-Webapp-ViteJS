import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { opsHospitalDetailPath } from '@/app/router/paths';
import { useSort } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import type { OpsTint } from '@/shared/ui/OpsConfirm';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import { StatCard, type StatCardData } from '@/shared/ui/StatCard';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { Tabs } from '@/shared/ui/Tabs';

import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import {
  hospName,
  useHospitalsStore,
} from '@/features/ops-hospitals/application/store/hospitals.store';

import { OnboardHospitalModal } from '@/features/ops-hospitals/presentation/components/OnboardHospitalModal';

/** Ops entity-cell tint cycle (design `opsTintOf`). */
const OPS_TINT_CYCLE: readonly OpsTint[] = ['primary', 'info', 'success', 'warning', 'neutral'];
const opsTintOf = (i: number): OpsTint => OPS_TINT_CYCLE[i % OPS_TINT_CYCLE.length];

const OPS_HOSP_PAGE = 6;

export function OpsHospitalsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitals = useHospitalsStore((s) => s.hospitals);
  const plans = usePlansStore((s) => s.plans);

  const [tab, setTab] = useState<'All' | 'Pending'>('All');
  const [q, setQ] = useState('');
  const [planF, setPlanF] = useState<string>(searchParams.get('plan') ?? 'All');
  const [statusF, setStatusF] = useState('All');
  const [page, setPage] = useState(0);
  const [onboard, setOnboard] = useState(false);

  const pendingCt = hospitals.filter((h) => h.status === 'Pending verification').length;
  const ql = q.trim().toLowerCase();
  const filtered = hospitals.filter(
    (h) =>
      (tab !== 'Pending' || h.status === 'Pending verification') &&
      (!ql || h.name.toLowerCase().includes(ql) || h.city.toLowerCase().includes(ql)) &&
      (planF === 'All' || h.plan === planF) &&
      (tab === 'Pending' || statusF === 'All' || h.status === statusF),
  );
  const pg = Math.min(page, Math.max(0, Math.ceil(filtered.length / OPS_HOSP_PAGE) - 1));
  const { sort, onSort, sorted } = useSort<(typeof hospitals)[number]>();
  const ordered = sorted([...filtered], {
    name: (x) => x.name,
    plan: (x) => x.plan,
    bookings: (x) => x.bookings,
    onboarded: (x) => Date.parse(x.onboarded) || 0,
    status: (x) => x.status,
  });
  const rows = ordered.slice(pg * OPS_HOSP_PAGE, pg * OPS_HOSP_PAGE + OPS_HOSP_PAGE);

  const KPIS: readonly StatCardData[] = [
    {
      icon: 'building-2',
      label: 'Total Hospitals',
      value: hospitals.length,
      sub: 'All instances on the platform',
      iconClass: 'bg-blue-soft-bg text-text-navy',
      valueClass: 'text-text-navy',
    },
    {
      icon: 'circle-check',
      label: 'Active Instances',
      value: hospitals.filter((h) => h.status === 'Active').length,
      sub: 'Live and serving bookings',
      iconClass: 'bg-g-100 text-g-600',
      valueClass: 'text-g-600',
    },
    {
      icon: 'clock',
      label: 'Pending Verification',
      value: pendingCt,
      sub: 'Awaiting document review',
      iconClass: 'bg-y-100 text-y-600',
      valueClass: 'text-y-600',
    },
    {
      icon: 'ban',
      label: 'Suspended',
      value: hospitals.filter((h) => h.status === 'Suspended').length,
      sub: 'Access paused by platform',
      iconClass: 'bg-badge-noshow-bg text-orange',
      valueClass: 'text-orange',
    },
  ];

  const hasFilters = Boolean(ql) || planF !== 'All' || statusF !== 'All';
  const reset =
    (fn: (v: string) => void) =>
    (v: string): void => {
      fn(v);
      setPage(0);
    };
  const clearAll = () => {
    setQ('');
    setPlanF('All');
    setStatusF('All');
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4">
        {KPIS.map((k) => (
          <StatCard key={k.label} k={k} />
        ))}
      </div>
      <Card pad={14} className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          tabs={['All Hospitals', `Pending verification (${pendingCt})`]}
          value={tab === 'All' ? 'All Hospitals' : `Pending verification (${pendingCt})`}
          onChange={(v) => {
            setTab(v.startsWith('All') ? 'All' : 'Pending');
            setPage(0);
          }}
        />
        <Button icon="plus" onClick={() => setOnboard(true)}>
          Onboard Hospital
        </Button>
      </Card>
      <Card>
        <div className="mb-4">
          <SearchField value={q} onChange={reset(setQ)} placeholder="Search hospital or city" />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <FilterSelect
            value={planF}
            options={['Plan: All', ...plans.map((p) => p.name)]}
            onChange={(v) => reset(setPlanF)(v === 'Plan: All' ? 'All' : v)}
          />
          {tab === 'All' && (
            <FilterSelect
              value={statusF}
              options={['All', 'Active', 'Pending verification', 'Suspended', 'Rejected'].map(
                (s) => (s === 'All' ? 'Status: All' : s),
              )}
              onChange={(v) => reset(setStatusF)(v === 'Status: All' ? 'All' : v)}
            />
          )}
          {hasFilters && (
            <span onClick={clearAll} className="text-body text-blue cursor-pointer">
              Clear all
            </span>
          )}
        </div>
        {rows.length > 0 ? (
          <>
            <TableShell
              columns={[
                'Hospital',
                'Plan',
                'Location',
                'Bookings / Mo',
                'Onboarded',
                'Status',
                'Action',
              ]}
              rightCols={['Bookings / Mo']}
              sortKeys={{
                Hospital: 'name',
                Plan: 'plan',
                'Bookings / Mo': 'bookings',
                Onboarded: 'onboarded',
                Status: 'status',
              }}
              sort={sort}
              onSort={onSort}
            >
              {rows.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => navigate(opsHospitalDetailPath(h.id))}
                  className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                >
                  <td className={tdClass}>
                    <OpsEntity
                      icon="building-2"
                      tint={opsTintOf(h.id)}
                      title={hospName(h.id)}
                      sub={h.email}
                    />
                  </td>
                  <td className={tdClass}>{h.plan}</td>
                  <td className={tdClass}>
                    {h.city}
                    {h.st ? `, ${h.st}` : ''}
                  </td>
                  <td className={cn(tdClass, 'text-right tabular-nums')}>
                    {h.bookings.toLocaleString('en-IN')}
                  </td>
                  <td className={tdClass}>{h.onboarded}</td>
                  <td className={tdClass}>
                    <Badge status={h.status} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <IconBtn
                      name="eye"
                      box={36}
                      size={16}
                      title="View hospital"
                      onClick={() => navigate(opsHospitalDetailPath(h.id))}
                    />
                  </td>
                </tr>
              ))}
            </TableShell>
            <Pager
              total={filtered.length}
              page={pg}
              pageSize={OPS_HOSP_PAGE}
              onPage={setPage}
              noun="hospitals"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-11 text-center">
            <div className="bg-grey-300 text-text-muted flex size-12 items-center justify-center rounded-full">
              <Icon name="building-2" size={22} />
            </div>
            <span className="text-body text-text-strong font-medium">
              No results match your filters.
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        )}
      </Card>
      <OnboardHospitalModal
        open={onboard}
        onClose={() => setOnboard(false)}
        onDone={() => {
          setOnboard(false);
          setTab('All');
          setQ('');
          setPlanF('All');
          setStatusF('All');
          setPage(0);
        }}
      />
    </div>
  );
}
