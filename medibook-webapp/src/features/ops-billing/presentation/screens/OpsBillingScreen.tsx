import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { type SortAccessors, useSort } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { KpiStrip } from '@/shared/ui/KpiStrip';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import type { StatCardData } from '@/shared/ui/StatCard';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { Tabs } from '@/shared/ui/Tabs';

import { OPS_BASE_PATH, OPS_VIEW_SEGMENT } from '@/app/router/paths';

import { useBillingStore } from '@/features/ops-billing/application/store/billing.store';
import type { Invoice, Payment } from '@/features/ops-billing/application/store/billing.types';
import { hospName } from '@/features/ops-hospitals/application/store/hospitals.store';

/** Rows per page for both billing tables (design `OPS_BILL_PAGE`). */
const OPS_BILL_PAGE = 6;

type BillTab = 'Invoices' | 'Payments';

/** KPI tiles — the prototype's `{ c, bg, sc }` colors mapped to token classes. */
const KPIS: readonly StatCardData[] = [
  {
    icon: 'indian-rupee',
    label: 'Collected This Month',
    value: '₹ 18.4L',
    sub: '+8.2% vs last week',
    iconClass: 'bg-g-100 text-g-600',
    valueClass: 'text-g-600',
  },
  {
    icon: 'hourglass',
    label: 'Outstanding Dues',
    value: '₹ 2.6L',
    sub: '9 invoices open',
    iconClass: 'bg-y-100 text-y-600',
    valueClass: 'text-y-600',
  },
  {
    icon: 'file-text',
    label: 'Invoices Issued',
    value: '214',
    sub: '+4.6% vs last week',
    iconClass: 'bg-blue-soft-bg text-text-navy',
    valueClass: 'text-text-navy',
    subClass: 'text-g-600',
  },
  {
    icon: 'circle-x',
    label: 'Failed Payments',
    value: '6',
    sub: '−2.1% vs last week',
    iconClass: 'bg-badge-noshow-bg text-orange',
    valueClass: 'text-orange',
  },
];

const isInvoice = (v: Invoice | Payment): v is Invoice => 'no' in v;
const isPayment = (v: Invoice | Payment): v is Payment => 'txn' in v;

/**
 * Ops subscription billing (design `Ops.jsx` `OpsBilling`): KPI row, the
 * Invoices | Payments tabs (preset through the `?tab=` search param —
 * `OpsSel.billTab` equivalent), search + issued/paid date range + method /
 * status filters, sortable columns, pagination, and the per-row eye /
 * download actions (download via `useOpsAct`).
 */
export function OpsBillingScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const allInvoices = useBillingStore((s) => s.invoices);
  const allPayments = useBillingStore((s) => s.payments);

  const initialTab: BillTab = searchParams.get('tab') === 'Payments' ? 'Payments' : 'Invoices';
  const [tab, setTabRaw] = useState<BillTab>(initialTab);
  const setTab = (t: BillTab) => {
    setTabRaw(t);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', t);
        return next;
      },
      { replace: true },
    );
  };

  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('All');
  const [methodF, setMethodF] = useState('All');
  const [dateF, setDateF] = useState('');
  const [dateT, setDateT] = useState('');
  const [page, setPage] = useState(0);
  const [, run] = useOpsAct();

  const reset =
    (fn: (v: string) => void) =>
    (v: string): void => {
      fn(v);
      setPage(0);
    };

  const clearAll = (): void => {
    setQ('');
    setStatusF('All');
    setMethodF('All');
    setDateF('');
    setDateT('');
    setPage(0);
  };

  const ql = q.trim().toLowerCase();
  const inRange = (dstr: string): boolean => {
    const ts = Date.parse(dstr) || 0;
    if (dateF && ts < Date.parse(dateF)) return false;
    if (dateT && ts > Date.parse(dateT) + 86399999) return false;
    return true;
  };

  const invoices = allInvoices.filter(
    (v) =>
      (!ql || v.no.toLowerCase().includes(ql) || hospName(v).toLowerCase().includes(ql)) &&
      (statusF === 'All' || v.status === statusF) &&
      inRange(v.issued),
  );
  const payments = allPayments.filter(
    (v) =>
      (!ql ||
        v.txn.toLowerCase().includes(ql) ||
        v.inv.toLowerCase().includes(ql) ||
        hospName(v).toLowerCase().includes(ql)) &&
      (methodF === 'All' || v.method === methodF) &&
      (statusF === 'All' || v.status === statusF) &&
      inRange(v.date),
  );

  const { sort, onSort, sorted } = useSort<Invoice | Payment>();
  const accessors: SortAccessors<Invoice | Payment> =
    tab === 'Invoices'
      ? {
          no: (v) => (isInvoice(v) ? v.no : null),
          amount: (v) => v.amount,
          issued: (v) => (isInvoice(v) ? Date.parse(v.issued) || 0 : 0),
          due: (v) => (isInvoice(v) ? Date.parse(v.due) || 0 : 0),
          status: (v) => v.status,
        }
      : {
          txn: (v) => (isPayment(v) ? v.txn : null),
          inv: (v) => (isPayment(v) ? v.inv : null),
          method: (v) => (isPayment(v) ? v.method : null),
          amount: (v) => v.amount,
          date: (v) => (isPayment(v) ? Date.parse(v.date) || 0 : 0),
          status: (v) => v.status,
        };
  const source: readonly (Invoice | Payment)[] = tab === 'Invoices' ? invoices : payments;
  const list = sorted([...source], accessors);
  const pg = Math.min(page, Math.max(0, Math.ceil(list.length / OPS_BILL_PAGE) - 1));
  const rows = list.slice(pg * OPS_BILL_PAGE, pg * OPS_BILL_PAGE + OPS_BILL_PAGE);

  const statusOpts =
    tab === 'Invoices'
      ? ['All', 'Completed', 'Pending', 'Overdue', 'Payment failed']
      : ['All', 'Success', 'Pending', 'Payment failed'];

  const toInvoice = (id: number): void => {
    navigate(`${OPS_BASE_PATH}/${OPS_VIEW_SEGMENT['invoice-detail'].replace(':id', String(id))}`);
  };
  const toPayment = (id: number): void => {
    navigate(`${OPS_BASE_PATH}/${OPS_VIEW_SEGMENT['payment-detail'].replace(':id', String(id))}`);
  };

  const dateInputClass =
    'rounded-input border-border text-body text-text-body h-11 border bg-white px-3';
  const filtersActive = Boolean(ql || statusF !== 'All' || methodF !== 'All' || dateF || dateT);

  return (
    <div className="flex flex-col gap-5">
      <KpiStrip items={KPIS} />
      <Card pad={14}>
        <Tabs
          tabs={['Invoices', 'Payments']}
          value={tab}
          onChange={(v) => {
            setTab(v as BillTab);
            setQ('');
            setStatusF('All');
            setMethodF('All');
            setDateF('');
            setDateT('');
            setPage(0);
          }}
        />
      </Card>
      <Card>
        <div className="mb-4">
          <SearchField
            value={q}
            onChange={reset(setQ)}
            placeholder={
              tab === 'Invoices'
                ? 'Search invoice or hospital'
                : 'Search transaction, invoice or hospital'
            }
          />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <input
            type="date"
            value={dateF}
            onChange={(e) => reset(setDateF)(e.target.value)}
            title={tab === 'Invoices' ? 'Issued from' : 'Paid from'}
            className={dateInputClass}
          />
          <input
            type="date"
            value={dateT}
            onChange={(e) => reset(setDateT)(e.target.value)}
            title={tab === 'Invoices' ? 'Issued to' : 'Paid to'}
            className={dateInputClass}
          />
          {tab === 'Payments' && (
            <FilterSelect
              value={methodF}
              options={['All', 'UPI', 'Card', 'NetBanking'].map((x) =>
                x === 'All' ? 'Method: All' : x,
              )}
              onChange={(v) => reset(setMethodF)(v === 'Method: All' ? 'All' : v)}
            />
          )}
          <FilterSelect
            value={statusF}
            options={statusOpts.map((x) => (x === 'All' ? 'Status: All' : x))}
            onChange={(v) => reset(setStatusF)(v === 'Status: All' ? 'All' : v)}
          />
          {filtersActive && (
            <span onClick={clearAll} className="text-body text-blue cursor-pointer">
              Clear all
            </span>
          )}
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-11 text-center">
            <div className="bg-grey-300 text-text-muted flex size-12 items-center justify-center rounded-full">
              <Icon name={tab === 'Invoices' ? 'file-text' : 'indian-rupee'} size={22} />
            </div>
            <span className="text-body text-text-strong font-medium">
              No results match your filters.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ('');
                setStatusF('All');
                setMethodF('All');
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : tab === 'Invoices' ? (
          <>
            <TableShell
              columns={['Invoice', 'Amount', 'Issued', 'Due', 'Status', 'Action']}
              rightCols={['Amount']}
              sortKeys={{
                Invoice: 'no',
                Amount: 'amount',
                Issued: 'issued',
                Due: 'due',
                Status: 'status',
              }}
              sort={sort}
              onSort={onSort}
            >
              {rows.filter(isInvoice).map((v) => (
                <tr
                  key={v.id}
                  onClick={() => toInvoice(v.id)}
                  className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                >
                  <td className={tdClass}>
                    <OpsEntity icon="file-text" tint="primary" title={v.no} sub={hospName(v)} />
                  </td>
                  <td
                    className={cn(tdClass, 'text-text-strong text-right font-medium tabular-nums')}
                  >
                    {money(v.amount)}
                  </td>
                  <td className={tdClass}>{v.issued}</td>
                  <td className={tdClass}>{v.due}</td>
                  <td className={tdClass}>
                    <Badge status={v.status} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <IconBtn
                        name="eye"
                        box={36}
                        size={16}
                        title="View invoice"
                        onClick={() => toInvoice(v.id)}
                      />
                      <IconBtn
                        name="download"
                        box={36}
                        size={16}
                        title="Download PDF"
                        onClick={() => run(`dl${v.id}`, `Invoice ${v.no} downloaded.`)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </TableShell>
            <Pager
              total={invoices.length}
              page={pg}
              pageSize={OPS_BILL_PAGE}
              onPage={setPage}
              noun="invoices"
            />
          </>
        ) : (
          <>
            <TableShell
              columns={['Transaction', 'Invoice', 'Method', 'Amount', 'Date', 'Status', 'Action']}
              rightCols={['Amount']}
              sortKeys={{
                Transaction: 'txn',
                Invoice: 'inv',
                Method: 'method',
                Amount: 'amount',
                Date: 'date',
                Status: 'status',
              }}
              sort={sort}
              onSort={onSort}
            >
              {rows.filter(isPayment).map((v) => (
                <tr
                  key={v.id}
                  onClick={() => toPayment(v.id)}
                  className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                >
                  <td className={tdClass}>
                    <OpsEntity icon="indian-rupee" tint="success" title={v.txn} sub={hospName(v)} />
                  </td>
                  <td className={cn(tdClass, 'tabular-nums')}>{v.inv}</td>
                  <td className={tdClass}>{v.method}</td>
                  <td
                    className={cn(tdClass, 'text-text-strong text-right font-medium tabular-nums')}
                  >
                    {money(v.amount)}
                  </td>
                  <td className={tdClass}>{v.date}</td>
                  <td className={tdClass}>
                    <Badge status={v.status} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <IconBtn
                      name="eye"
                      box={36}
                      size={16}
                      title="View payment"
                      onClick={() => toPayment(v.id)}
                    />
                  </td>
                </tr>
              ))}
            </TableShell>
            <Pager
              total={payments.length}
              page={pg}
              pageSize={OPS_BILL_PAGE}
              onPage={setPage}
              noun="payments"
            />
          </>
        )}
      </Card>
    </div>
  );
}
