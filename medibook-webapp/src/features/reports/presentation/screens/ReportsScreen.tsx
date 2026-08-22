import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { SegTabs } from '@/shared/ui/SegTabs';
import { StatCard } from '@/shared/ui/StatCard';
import { toast } from '@/shared/ui/toast/toast.store';

import { DEPARTMENTS, DOCTORS } from '@/features/appointments/application/store/appointments.types';
import { useSettlementsStore } from '@/features/settlements/application/store/settlements.store';

import { ReportPickerCard } from '../components/ReportPickerCard';
import {
  aggregateSettlements,
  CAT_ICON_CLASS,
  REPORT_CATS,
  REPORTS,
  reportKPIs,
  type ReportFilter,
} from '../reports.data';

const DATE_INPUT_CLASS = 'text-body text-text-body border-border h-11 rounded-md border px-3.5';

/**
 * Hospital Reports (design `Admin.jsx` → `Reports`): selected-report header,
 * report-driven filter row, KPI grid, category picker. Admin-only (route
 * guarded by `RequireAdmin`). Settlement/Commission KPIs derive from the
 * shared settlements ledger; every other report shows the design's literals.
 */
export function ReportsScreen() {
  const settlements = useSettlementsStore((s) => s.settlements);

  const [cat, setCat] = useState('All');
  const [sel, setSel] = useState(REPORTS[0].id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dept, setDept] = useState('All Departments');
  const [doctor, setDoctor] = useState('All Doctors');
  const [status, setStatus] = useState('All Status');
  const [mode, setMode] = useState('All Modes');
  const [source, setSource] = useState('All Sources');

  const report = REPORTS.find((r) => r.id === sel) ?? REPORTS[0];
  const sg = aggregateSettlements(settlements);
  const kpis = reportKPIs(report.id, sg);
  const fil = (name: ReportFilter): boolean => report.filters.includes(name);
  const shown = REPORTS.filter((r) => cat === 'All' || r.cat === cat);

  const exportCsv = (): void => {
    const range = (from || '—') + ' to ' + (to || '—');
    const rows: readonly (readonly string[])[] = [
      ['Report', 'Range', 'Metric', 'Value'],
      ...kpis.map((k) => [report.name, range, k.label, k.value]),
    ];
    const csv = rows.map((row) => row.map((c) => '"' + c + '"').join(',')).join('\n');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    el.download = report.id + '-report.csv';
    el.click();
    toast('Exported ' + report.id + '-report.csv', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* selected report + filters + export */}
      <Card pad={18} className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex size-11.5 flex-none items-center justify-center rounded-lg',
            CAT_ICON_CLASS[report.cat],
          )}
        >
          <Icon name={report.icon} size={22} />
        </div>
        <div className="min-w-45 flex-1">
          <SectionTitle size={18}>{report.name}</SectionTitle>
          <div className="text-caption text-text-muted mt-0.5">{report.brief}</div>
        </div>
        <Button variant="secondary" icon="download" onClick={exportCsv}>
          Export CSV
        </Button>
        <Button icon="printer" onClick={() => toast('Preparing PDF…', 'info')}>
          Export PDF
        </Button>
      </Card>

      <Card pad={16} className="flex flex-wrap items-center gap-3">
        {fil('date') && (
          <>
            <span className="text-body text-text-muted">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={DATE_INPUT_CLASS}
            />
            <span className="text-body text-text-muted">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={DATE_INPUT_CLASS}
            />
          </>
        )}
        {fil('dept') && (
          <FilterSelect
            value={dept}
            options={['All Departments', ...DEPARTMENTS]}
            onChange={setDept}
          />
        )}
        {fil('doctor') && (
          <FilterSelect
            value={doctor}
            options={['All Doctors', ...Object.values(DOCTORS).flat()]}
            onChange={setDoctor}
          />
        )}
        {fil('status') && (
          <FilterSelect
            value={status}
            options={['All Status', 'Scheduled', 'In Queue', 'Completed', 'Cancelled', 'No-show']}
            onChange={setStatus}
          />
        )}
        {fil('mode') && (
          <FilterSelect
            value={mode}
            options={['All Modes', 'Cash', 'UPI', 'Card']}
            onChange={setMode}
          />
        )}
        {fil('source') && (
          <FilterSelect
            value={source}
            options={['All Sources', 'Online', 'Walk-in']}
            onChange={setSource}
          />
        )}
        {fil('user') && (
          <FilterSelect
            value="All Users"
            options={['All Users', 'Riya Menon', 'Karthik Rao', 'Dr. S. Nair']}
            onChange={() => {}}
          />
        )}
        <span className="flex-1" />
        {(from || to) && (
          <span
            onClick={() => {
              setFrom('');
              setTo('');
            }}
            className="text-body text-blue cursor-pointer"
          >
            Clear dates
          </span>
        )}
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.label} k={k} />
        ))}
      </div>

      {/* report picker */}
      <Card pad={16} className="flex flex-wrap items-center justify-between gap-3">
        <SegTabs tabs={REPORT_CATS} value={cat} onChange={setCat} />
        <span className="text-caption text-text-muted">Choose a report</span>
      </Card>

      <div className="grid grid-cols-3 gap-3.5">
        {shown.map((r) => (
          <ReportPickerCard
            key={r.id}
            report={r}
            selected={r.id === sel}
            onSelect={() => setSel(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
