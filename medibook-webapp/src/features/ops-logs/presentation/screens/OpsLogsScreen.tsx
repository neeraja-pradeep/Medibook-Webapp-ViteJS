import { useState } from 'react';

import { useLogsStore } from '@/features/ops-logs/application/store/logs.store';
import type { LogSeverity } from '@/features/ops-logs/application/store/logs.types';
import { useSort } from '@/shared/hooks/useSort';
import { opsTime } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import type { OpsTint } from '@/shared/ui/OpsConfirm';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import type { LogEntry } from '@/features/ops-logs/application/store/logs.types';

const OPS_LOG_PAGE = 7;

/** Compliance logs — the platform audit trail (design `OpsLogs`, Ops.jsx). */
export function OpsLogsScreen() {
  const logs = useLogsStore((s) => s.logs);
  const [q, setQ] = useState('');
  const [sevF, setSevF] = useState('All');
  const [modF, setModF] = useState('All');
  const [dateF, setDateF] = useState('');
  const [dateT, setDateT] = useState('');
  const [page, setPage] = useState(0);
  const ql = q.trim().toLowerCase();
  const filtered = logs.filter(
    (l) =>
      (!ql || l.action.toLowerCase().includes(ql) || l.actor.toLowerCase().includes(ql)) &&
      (sevF === 'All' || l.sev === sevF) &&
      (modF === 'All' || l.module === modF) &&
      (!dateF || opsTime(l.time) >= Date.parse(dateF)) &&
      (!dateT || opsTime(l.time) <= Date.parse(dateT) + 86399999),
  );
  const { sort, onSort, sorted } = useSort<LogEntry>();
  const orderedLogs = sorted(filtered, {
    module: (l) => l.module,
    ip: (l) => l.ip,
    time: (l) => opsTime(l.time),
    sev: (l) => l.sev,
  });
  const pg = Math.min(page, Math.max(0, Math.ceil(filtered.length / OPS_LOG_PAGE) - 1));
  const rows = orderedLogs.slice(pg * OPS_LOG_PAGE, pg * OPS_LOG_PAGE + OPS_LOG_PAGE);
  const sevTint: Record<LogSeverity, OpsTint> = {
    Critical: 'danger',
    Warning: 'warning',
    Info: 'info',
  };
  const reset =
    (fn: (v: string) => void) =>
    (v: string): void => {
      fn(v);
      setPage(0);
    };
  const clearAll = (): void => {
    setQ('');
    setSevF('All');
    setModF('All');
    setDateF('');
    setDateT('');
    setPage(0);
  };
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="mb-4">
          <SearchField value={q} onChange={reset(setQ)} placeholder="Search action or user" />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <FilterSelect
            value={sevF}
            options={['All', 'Info', 'Warning', 'Critical'].map((x) =>
              x === 'All' ? 'Severity: All' : x,
            )}
            onChange={(v) => reset(setSevF)(v === 'Severity: All' ? 'All' : v)}
          />
          <FilterSelect
            value={modF}
            options={[
              'All',
              'Hospitals',
              'Settlements',
              'Billing',
              'Subscription Plans',
              'Users & Roles',
              'Platform Users',
              'Reports',
              'Settings',
              'Auth',
              'Media',
            ].map((x) => (x === 'All' ? 'Module: All' : x))}
            onChange={(v) => reset(setModF)(v === 'Module: All' ? 'All' : v)}
          />
          <input
            type="date"
            value={dateF}
            onChange={(e) => reset(setDateF)(e.target.value)}
            title="From date"
            className="rounded-input border-border text-body text-text-body h-11 border bg-white px-3"
          />
          <input
            type="date"
            value={dateT}
            onChange={(e) => reset(setDateT)(e.target.value)}
            title="To date"
            className="rounded-input border-border text-body text-text-body h-11 border bg-white px-3"
          />
          {(ql || sevF !== 'All' || modF !== 'All' || dateF || dateT) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-body text-blue cursor-pointer border-none bg-transparent p-0"
            >
              Clear all
            </button>
          )}
          <div className="flex-1"></div>
          <span className="text-caption text-text-faint">Retention: 365 days</span>
        </div>
        {rows.length > 0 ? (
          <>
            <TableShell
              columns={['Action', 'Module', 'IP Address', 'Timestamp', 'Severity']}
              sortKeys={{
                Module: 'module',
                'IP Address': 'ip',
                Timestamp: 'time',
                Severity: 'sev',
              }}
              sort={sort}
              onSort={onSort}
            >
              {rows.map((l) => (
                <tr key={l.id}>
                  <td className={`${tdClass} max-w-90`}>
                    <OpsEntity
                      icon="scroll-text"
                      tint={sevTint[l.sev] || 'neutral'}
                      title={l.action}
                      sub={l.actor}
                    />
                  </td>
                  <td className={tdClass}>{l.module}</td>
                  <td className={`${tdClass} tabular-nums`}>{l.ip}</td>
                  <td className={tdClass}>{l.time}</td>
                  <td className={tdClass}>
                    <Badge status={l.sev} />
                  </td>
                </tr>
              ))}
            </TableShell>
            <Pager
              total={filtered.length}
              page={pg}
              pageSize={OPS_LOG_PAGE}
              onPage={setPage}
              noun="log entries"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-11 text-center">
            <div className="bg-grey-300 text-text-muted flex size-12 items-center justify-center rounded-full">
              <Icon name="scroll-text" size={22} />
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
    </div>
  );
}
