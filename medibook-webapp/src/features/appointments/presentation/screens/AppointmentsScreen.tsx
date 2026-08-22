import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSort } from '@/shared/hooks/useSort';
import { isoToRel, money, timeToMinutes } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { IconBtn } from '@/shared/ui/IconBtn';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import { tdClass, TableShell } from '@/shared/ui/TableShell';
import { Tabs } from '@/shared/ui/Tabs';

import {
  hospitalPath,
  HOSPITAL_VIEW_SEGMENT,
  isHospitalRole,
  type HospitalRole,
} from '@/app/router/paths';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import { primaryAction } from '@/features/appointments/application/store/appointments.logic';
import { DEPARTMENTS, DOCTORS } from '@/features/appointments/application/store/appointments.types';
import type { Appointment } from '@/features/appointments/application/store/appointments.types';
import { AppointmentDrawer } from '@/features/appointments/presentation/components/AppointmentDrawer';
import { MarkPaymentModal } from '@/features/appointments/presentation/components/MarkPaymentModal';
import { ReceiptModal } from '@/features/appointments/presentation/components/ReceiptModal';

const APPT_TABS = ['All', 'Online', 'Walk-in', 'Pending Payment', 'In Queue'];
const APPT_PAGE = 8;

const SORT_KEYS: Readonly<Record<string, string | undefined>> = {
  'MR Number': 'mrn',
  Patient: 'name',
  'Doctor / Dept': 'doctor',
  Source: 'source',
  Time: 'time',
  Payment: 'payment',
  Status: 'status',
};

const COLUMNS = [
  'MR Number',
  'Patient',
  'Doctor / Dept',
  'Source',
  'Time',
  'Payment',
  'Status',
  'Action',
];

/** Appointments list — tabs, filters, sortable table, drawer + receipt chain (design `Screens.jsx` `Appointments`). */
export function AppointmentsScreen() {
  const navigate = useNavigate();
  const roleParam = useParams().role;
  const role: HospitalRole = isHospitalRole(roleParam) ? roleParam : 'receptionist';

  const appts = useAppointmentsStore((s) => s.appts);
  const checkIn = useAppointmentsStore((s) => s.checkIn);

  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [dateF, setDateF] = useState('Today');
  const [docF, setDocF] = useState('All Doctors');
  const [statusF, setStatusF] = useState('All Status');
  const [deptF, setDeptF] = useState('All Departments');
  const [exact, setExact] = useState('');
  const [page, setPage] = useState(0);
  const { sort, onSort, sorted } = useSort<Appointment>();
  const [drawer, setDrawer] = useState<string | null>(null);
  const [pay, setPay] = useState<Appointment | null>(null);
  const [receipt, setReceipt] = useState<Appointment | null>(null);

  const byTab = (a: Appointment) => {
    if (tab === 'Online') return a.source === 'Online';
    if (tab === 'Walk-in') return a.source === 'Walk-in';
    if (tab === 'Pending Payment') return a.payment === 'Pending';
    if (tab === 'In Queue') return a.status === 'In Queue';
    return true;
  };
  const counts: Record<string, number> = {
    Online: appts.filter((a) => a.source === 'Online').length,
    'Walk-in': appts.filter((a) => a.source === 'Walk-in').length,
    'Pending Payment': appts.filter((a) => a.payment === 'Pending').length,
    'In Queue': appts.filter((a) => a.status === 'In Queue').length,
  };
  const ql = q.trim().toLowerCase();
  const filtered = appts.filter((a) => {
    if (!byTab(a)) return false;
    if (ql && !(a.name + ' ' + a.mrn + ' ' + (a.token || '')).toLowerCase().includes(ql))
      return false;
    if (exact) {
      if (a.date !== isoToRel(exact)) return false;
    } else if (dateF !== 'This Week' && a.date !== dateF) return false;
    if (deptF !== 'All Departments' && a.dept !== deptF) return false;
    if (docF !== 'All Doctors' && a.doctor !== docF) return false;
    if (statusF !== 'All Status' && a.status !== statusF) return false;
    return true;
  });
  const ordered = sorted(filtered, {
    mrn: (a) => a.mrn,
    name: (a) => a.name,
    doctor: (a) => a.doctor,
    source: (a) => a.source,
    time: (a) => timeToMinutes(a.time),
    payment: (a) => a.payment,
    status: (a) => a.status,
  });
  const pages = Math.max(1, Math.ceil(ordered.length / APPT_PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = ordered.slice(pg * APPT_PAGE, pg * APPT_PAGE + APPT_PAGE);

  const reset =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setPage(0);
    };
  const tabLabel = (t: string) => {
    const c = counts[t];
    return c != null ? `${t} (${c})` : t;
  };
  const filtersActive =
    ql !== '' ||
    exact !== '' ||
    dateF !== 'Today' ||
    deptF !== 'All Departments' ||
    docF !== 'All Doctors' ||
    statusF !== 'All Status';
  const clearAll = () => {
    setQ('');
    setExact('');
    setDateF('Today');
    setDeptF('All Departments');
    setDocF('All Doctors');
    setStatusF('All Status');
    setPage(0);
  };
  const doPrimary = (a: Appointment) => {
    const p = primaryAction(a);
    if (!p) return;
    if (p.key === 'pay') setPay(a);
    else if (p.key === 'checkin') checkIn(a.id);
    else if (p.key === 'receipt') setReceipt(a);
    else if (p.key === 'queue') navigate(hospitalPath(role, 'token'));
  };

  return (
    <div className="flex flex-col gap-5">
      <Card pad={14} className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          tabs={APPT_TABS.map(tabLabel)}
          value={tabLabel(tab)}
          onChange={(v) => reset(setTab)(v.split(' (')[0] ?? v)}
        />
        <Button icon="plus" onClick={() => navigate(hospitalPath(role, 'create'))}>
          New Appointment
        </Button>
      </Card>
      <Card pad={20}>
        <div className="mb-4">
          <SearchField
            value={q}
            onChange={reset(setQ)}
            placeholder="Search by patient name, MR number or token"
          />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <FilterSelect
            value={dateF}
            options={['Today', 'Tomorrow', 'This Week']}
            onChange={reset(setDateF)}
          />
          <input
            type="date"
            value={exact}
            onChange={(e) => reset(setExact)(e.target.value)}
            title="Pick a specific date"
            className="rounded-input border-border text-body text-text-body h-11 border bg-white px-3"
          />
          <FilterSelect
            value={deptF}
            options={['All Departments', ...DEPARTMENTS]}
            onChange={reset(setDeptF)}
          />
          <FilterSelect
            value={docF}
            options={['All Doctors', ...Object.values(DOCTORS).flat()]}
            onChange={reset(setDocF)}
          />
          <FilterSelect
            value={statusF}
            options={['All Status', 'Scheduled', 'In Queue', 'Completed', 'Cancelled', 'No-show']}
            onChange={reset(setStatusF)}
          />
          {filtersActive && (
            <button type="button" onClick={clearAll} className="text-body text-blue cursor-pointer">
              Clear all
            </button>
          )}
        </div>
        <TableShell columns={COLUMNS} sortKeys={SORT_KEYS} sort={sort} onSort={onSort}>
          {rows.map((a) => {
            const p = primaryAction(a);
            return (
              <tr
                key={a.id}
                onClick={() => setDrawer(a.id)}
                className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
              >
                <td className={tdClass}>{a.mrn}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.name} size={30} />
                    <span className="text-text-strong font-medium">{a.name}</span>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="text-body">{a.doctor}</div>
                  <div className="text-caption text-text-muted">{a.dept}</div>
                </td>
                <td className={tdClass}>
                  <Badge status={a.source} />
                </td>
                <td className={tdClass}>
                  <div>{a.time}</div>
                  <div className="text-caption text-text-muted">{a.date}</div>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-col items-start gap-0.75">
                    <Badge status={a.payment} />
                    <span className="text-caption text-text-muted tabular-nums">
                      {money(a.amount)}
                    </span>
                  </div>
                </td>
                <td className={tdClass}>
                  {a.token ? (
                    <div className="flex flex-col items-start gap-0.75">
                      <Badge status={a.status} />
                      <span className="text-caption text-blue font-semibold">{a.token}</span>
                    </div>
                  ) : (
                    <Badge status={a.status} />
                  )}
                </td>
                <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {p && p.key !== 'queue' ? (
                      <Button
                        size="sm"
                        variant={p.variant}
                        icon={p.icon}
                        onClick={() => doPrimary(a)}
                      >
                        {p.label}
                      </Button>
                    ) : (
                      <span className="w-1"></span>
                    )}
                    <IconBtn
                      name="eye"
                      box={36}
                      size={16}
                      onClick={() => setDrawer(a.id)}
                      title="Details"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </TableShell>
        {filtered.length === 0 && (
          <div className="text-text-faint text-body-lg py-9 text-center">
            No appointments match your filters.
          </div>
        )}
        <Pager
          total={filtered.length}
          page={pg}
          pageSize={APPT_PAGE}
          onPage={setPage}
          noun="appointments"
        />
      </Card>
      <AppointmentDrawer
        id={drawer}
        onClose={() => setDrawer(null)}
        onViewPatient={(a) => navigate(`/${role}/${HOSPITAL_VIEW_SEGMENT.patients}/${a.mrn}`)}
      />
      <MarkPaymentModal
        appt={pay}
        onClose={() => setPay(null)}
        onPaid={() => {
          const fresh = pay
            ? (useAppointmentsStore.getState().appts.find((x) => x.id === pay.id) ?? null)
            : null;
          setPay(null);
          setReceipt(fresh);
        }}
      />
      <ReceiptModal appt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
