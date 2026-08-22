import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useSort, type SortAccessors } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { InfoDot } from '@/shared/ui/InfoDot';
import { KpiStrip } from '@/shared/ui/KpiStrip';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import type { StatCardData } from '@/shared/ui/StatCard';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { Tabs } from '@/shared/ui/Tabs';
import { toast } from '@/shared/ui/toast/toast.store';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import {
  DEPARTMENTS,
  DOCTORS,
  type Appointment,
} from '@/features/appointments/application/store/appointments.types';
import { MarkPaymentModal } from '@/features/appointments/presentation/components/MarkPaymentModal';
import { ReceiptModal } from '@/features/appointments/presentation/components/ReceiptModal';

/** Payment tabs (design `["All", "Paid", "Pending", "Refunded"]`). */
type PayTab = 'All' | 'Paid' | 'Pending' | 'Refunded';

/** Records shown per page (design `PAY_PAGE`). */
const PAY_PAGE = 9;

/**
 * Payments — record external walk-in payments + view prepaid online bookings
 * (design `Payments`, `Billing.jsx`). Ported 1:1 onto the appointments store,
 * reusing the appointments feature's Mark Payment + Receipt modals.
 */
export function PaymentsScreen() {
  const { role } = useParams();
  const appts = useAppointmentsStore((s) => s.appts);
  const [tab, setTab] = useState<PayTab>('All');
  const [q, setQ] = useState('');
  const [sourceF, setSourceF] = useState('All Sources');
  const [modeF, setModeF] = useState('All Modes');
  const [dateF, setDateF] = useState('Today');
  const [deptF, setDeptF] = useState('All Departments');
  const [docF, setDocF] = useState('All Doctors');
  const [page, setPage] = useState(0);
  const { sort, onSort, sorted } = useSort<Appointment>();
  const [pay, setPay] = useState<Appointment | null>(null);
  const [receipt, setReceipt] = useState<Appointment | null>(null);

  const paid = appts.filter((a) => a.payment === 'Paid');
  const deskPaid = paid.filter((a) => a.source === 'Walk-in' && a.date === 'Today'); // collected at the hospital desk today
  const onlinePaid = paid.filter((a) => a.source === 'Online' && a.date === 'Today'); // prepaid via Medibook (settled to hospital later)
  const deskTotal = deskPaid.reduce((s, a) => s + a.amount, 0);
  const cash = deskPaid
    .filter((a) => (a.payMode ?? 'Cash') === 'Cash')
    .reduce((s, a) => s + a.amount, 0);
  const onlineTotal = onlinePaid.reduce((s, a) => s + a.amount, 0);
  const pendingCount = appts.filter((a) => a.payment === 'Pending').length;
  const KPIS: readonly StatCardData[] = [
    {
      icon: 'indian-rupee',
      label: 'Collected at Desk',
      value: money(deskTotal),
      sub: `${deskPaid.length} walk-in payment${deskPaid.length === 1 ? '' : 's'}`,
      iconClass: 'bg-g-100 text-g-600',
      valueClass: 'text-g-600',
    },
    {
      icon: 'banknote',
      label: 'Desk Cash',
      value: money(cash),
      sub: 'Cash at the counter',
      iconClass: 'bg-blue-soft-bg text-blue',
      valueClass: 'text-blue',
    },
    {
      icon: 'smartphone',
      label: 'Prepaid Online',
      value: money(onlineTotal),
      sub: 'via Medibook · settled later',
      iconClass: 'bg-y-100 text-y-600',
      valueClass: 'text-y-600',
    },
    {
      icon: 'circle-alert',
      label: 'Pending Collection',
      value: pendingCount,
      sub: 'Walk-ins to collect',
      iconClass: 'bg-d-100 text-d-500',
      valueClass: 'text-d-500',
    },
  ];
  const counts: Record<Exclude<PayTab, 'All'>, number> = {
    Paid: paid.length,
    Pending: pendingCount,
    Refunded: appts.filter((a) => a.payment === 'Refunded').length,
  };
  const ql = q.trim().toLowerCase();
  const filtered = appts.filter((a) => {
    if (tab === 'Paid' && a.payment !== 'Paid') return false;
    if (tab === 'Pending' && a.payment !== 'Pending') return false;
    if (tab === 'Refunded' && a.payment !== 'Refunded') return false;
    if (tab === 'All' && a.payment === 'Refunded') return false;
    if (sourceF !== 'All Sources' && a.source !== sourceF) return false;
    if (
      modeF !== 'All Modes' &&
      !(a.payment === 'Paid' && a.source === 'Walk-in' && (a.payMode ?? 'Cash') === modeF)
    )
      return false;
    if (deptF !== 'All Departments' && a.dept !== deptF) return false;
    if (docF !== 'All Doctors' && a.doctor !== docF) return false;
    if (dateF === 'Today' && a.date !== 'Today') return false;
    if (ql && !(a.name + ' ' + a.mrn).toLowerCase().includes(ql)) return false;
    return true;
  });
  const ACC: SortAccessors<Appointment> = {
    name: (a) => a.name,
    doctor: (a) => a.doctor,
    source: (a) => a.source,
    mode: (a) => a.payMode ?? '',
    amount: (a) => a.amount,
    status: (a) => a.payment,
  };
  const ordered = sorted(filtered, ACC);
  const pages = Math.max(1, Math.ceil(ordered.length / PAY_PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = ordered.slice(pg * PAY_PAGE, pg * PAY_PAGE + PAY_PAGE);
  const reset =
    <V,>(fn: (value: V) => void) =>
    (value: V): void => {
      fn(value);
      setPage(0);
    };
  const tabLabel = (t: PayTab): string => (t === 'All' ? 'All' : `${t} (${counts[t]})`);
  const onTab = (v: string): void => {
    setTab(v.split(' (')[0] as PayTab);
    setPage(0);
  };
  const clearAll = (): void => {
    setQ('');
    setDateF('Today');
    setSourceF('All Sources');
    setDeptF('All Departments');
    setDocF('All Doctors');
    setModeF('All Modes');
    setPage(0);
  };
  const exportCsv = (): void => {
    const head = [
      'Patient',
      'MR Number',
      'Doctor',
      'Department',
      'Source',
      'Mode',
      'Amount',
      'Status',
    ];
    const lines: (string | number)[][] = filtered.map((a) => [
      a.name,
      a.mrn,
      a.doctor,
      a.dept,
      a.source,
      a.payment === 'Paid'
        ? a.source === 'Online'
          ? 'Prepaid (Online)'
          : (a.payMode ?? 'Cash')
        : '—',
      a.amount,
      a.payment,
    ]);
    const csv = [head, ...lines].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    el.download = 'medibook-payments.csv';
    el.click();
    toast('Exported medibook-payments.csv', 'success');
  };
  return (
    <div className="flex flex-col gap-5" data-role={role}>
      <KpiStrip items={KPIS} />
      <Card pad={14} className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          tabs={(['All', 'Paid', 'Pending', 'Refunded'] as const).map(tabLabel)}
          value={tabLabel(tab)}
          onChange={onTab}
        />
        <Button variant="secondary" icon="download" onClick={exportCsv}>
          Export
        </Button>
      </Card>
      <Card pad={20}>
        <div className="mb-4">
          <SearchField
            value={q}
            onChange={reset(setQ)}
            placeholder="Search by patient name or MR number"
          />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <FilterSelect
            value={dateF}
            options={['Today', 'This Week', 'This Month']}
            onChange={reset(setDateF)}
          />
          <FilterSelect
            value={sourceF}
            options={['All Sources', 'Walk-in', 'Online']}
            onChange={reset(setSourceF)}
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
            value={modeF}
            options={['All Modes', 'Cash', 'UPI', 'Card']}
            onChange={reset(setModeF)}
          />
          {(ql ||
            dateF !== 'Today' ||
            sourceF !== 'All Sources' ||
            deptF !== 'All Departments' ||
            docF !== 'All Doctors' ||
            modeF !== 'All Modes') && (
            <button type="button" onClick={clearAll} className="text-body text-blue cursor-pointer">
              Clear all
            </button>
          )}
          <div className="text-caption text-text-muted flex items-center gap-1.75">
            <InfoDot text="Walk-in payments are collected at the hospital desk (cash / UPI / card). Online bookings are prepaid through the Medibook app — Medibook collects them and settles the net to the hospital later, so they are shown as 'Prepaid'." />
          </div>
          <span className="flex-1"></span>
        </div>
        <TableShell
          columns={['Patient', 'Doctor / Dept', 'Source', 'Mode', 'Amount', 'Status', 'Action']}
          rightCols={['Amount']}
          sortKeys={{
            Patient: 'name',
            'Doctor / Dept': 'doctor',
            Source: 'source',
            Mode: 'mode',
            Amount: 'amount',
            Status: 'status',
          }}
          sort={sort}
          onSort={onSort}
        >
          {rows.map((a) => (
            <tr key={a.id} className="hover:bg-grey-200 transition-colors duration-150">
              <td className={cn(tdClass, 'text-text-strong font-medium')}>
                {a.name}
                <div className="text-caption text-text-muted font-normal">{a.mrn}</div>
              </td>
              <td className={tdClass}>
                {a.doctor}
                <div className="text-caption text-text-muted">{a.dept}</div>
              </td>
              <td className={tdClass}>
                <Badge status={a.source} />
              </td>
              <td className={tdClass}>
                {a.payment === 'Paid' ? (
                  a.source === 'Online' ? (
                    <span className="text-text-muted">Prepaid</span>
                  ) : (
                    (a.payMode ?? 'Cash')
                  )
                ) : (
                  '—'
                )}
              </td>
              <td className={cn(tdClass, 'text-text-strong text-right font-semibold tabular-nums')}>
                {money(a.amount)}
              </td>
              <td className={tdClass}>
                <Badge status={a.payment} />
              </td>
              <td className={tdClass}>
                {a.payment === 'Pending' ? (
                  <Button size="sm" icon="indian-rupee" onClick={() => setPay(a)}>
                    Record
                  </Button>
                ) : a.payment === 'Paid' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="receipt"
                    onClick={() => setReceipt(a)}
                  >
                    Receipt
                  </Button>
                ) : (
                  <span className="text-text-faint text-caption">
                    {a.source === 'Online' ? 'Refunded by Medibook' : 'Refunded at desk'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
        {filtered.length === 0 && (
          <div className="text-text-faint text-body-lg py-9 text-center">
            No payments match your filters.
          </div>
        )}
        <Pager
          total={filtered.length}
          page={pg}
          pageSize={PAY_PAGE}
          onPage={setPage}
          noun="records"
          right={
            <span className="text-body text-text-navy font-medium tabular-nums">
              Desk collected: {money(deskTotal)}
            </span>
          }
        />
      </Card>
      <MarkPaymentModal
        appt={pay}
        onClose={() => setPay(null)}
        onPaid={() => {
          const current = pay;
          setPay(null);
          if (!current) return;
          const fresh =
            useAppointmentsStore.getState().appts.find((x) => x.id === current.id) ?? null;
          setReceipt(fresh);
        }}
      />
      <ReceiptModal appt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
