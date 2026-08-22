import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { opsPath } from '@/app/router/paths';
import { usePlatformUsersStore } from '@/features/ops-platform-users/application/store/platformUsers.store';
import type { PlatformUser } from '@/features/ops-platform-users/application/store/platformUsers.types';
import { useSort } from '@/shared/hooks/useSort';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { OpsPerson } from '@/shared/ui/OpsPerson';
import { Pager } from '@/shared/ui/Pager';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';
import { SearchField } from '@/shared/ui/SearchField';
import { StatCard } from '@/shared/ui/StatCard';
import type { StatCardData } from '@/shared/ui/StatCard';
import { TableShell, tdClass } from '@/shared/ui/TableShell';

const OPS_PU_PAGE = 6;

/** Platform-users KPI tiles (design `OpsPlatformUsers.KPIS`, Ops.jsx). */
const KPIS: readonly StatCardData[] = [
  {
    icon: 'users',
    label: 'Registered Users',
    value: '2,41,300',
    sub: '+8.2% vs last week',
    iconClass: 'bg-blue-soft-bg text-text-navy',
    valueClass: 'text-text-navy',
    subClass: 'text-g-600',
  },
  {
    icon: 'trending-up',
    label: 'Monthly Active',
    value: '86,400',
    sub: '+4.6% vs last week',
    iconClass: 'bg-g-100 text-g-600',
    valueClass: 'text-g-600',
    subClass: 'text-g-600',
  },
  {
    icon: 'user-plus',
    label: 'New This Week',
    value: '4,120',
    sub: '+8.2% vs last week',
    iconClass: 'bg-blue-soft-bg text-blue',
    valueClass: 'text-blue',
    subClass: 'text-g-600',
  },
  {
    icon: 'ban',
    label: 'Blocked Accounts',
    value: '214',
    sub: 'Fraud or abuse reports',
    iconClass: 'bg-badge-noshow-bg text-orange',
    valueClass: 'text-orange',
  },
];

/** Platform users — patient accounts from the Medibook mobile app (design `OpsPlatformUsers`). */
export function OpsPlatformUsersScreen() {
  const users = usePlatformUsersStore((s) => s.users);
  const logView = usePlatformUsersStore((s) => s.logView);
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('All');
  const [page, setPage] = useState(0);

  const ql = q.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      (!ql ||
        u.name.toLowerCase().includes(ql) ||
        u.email.toLowerCase().includes(ql) ||
        u.city.toLowerCase().includes(ql)) &&
      (statusF === 'All' || u.status === statusF),
  );
  const pg = Math.min(page, Math.max(0, Math.ceil(filtered.length / OPS_PU_PAGE) - 1));
  const { sort, onSort, sorted } = useSort<PlatformUser>();
  const orderedPu = sorted([...filtered], {
    name: (u) => u.name,
    phone: (u) => u.phone,
    city: (u) => u.city,
    bookings: (u) => u.bookings,
    joined: (u) => Date.parse(u.joined) || 0,
    status: (u) => u.status,
  });
  const rows = orderedPu.slice(pg * OPS_PU_PAGE, pg * OPS_PU_PAGE + OPS_PU_PAGE);

  const reset =
    (fn: (v: string) => void) =>
    (v: string): void => {
      fn(v);
      setPage(0);
    };
  const clearAll = (): void => {
    setQ('');
    setStatusF('All');
    setPage(0);
  };
  const view = (u: PlatformUser): void => {
    logView(u.email);
    navigate(`${opsPath('platform-users')}/${u.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4">
        {KPIS.map((k) => (
          <StatCard key={k.label} k={k} />
        ))}
      </div>
      <Card>
        <div className="mb-4">
          <SearchField value={q} onChange={reset(setQ)} placeholder="Search user, email or city" />
        </div>
        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <RefreshBtn />
          <FilterSelect
            value={statusF}
            options={['All', 'Active', 'Blocked'].map((x) => (x === 'All' ? 'Status: All' : x))}
            onChange={(v) => reset(setStatusF)(v === 'Status: All' ? 'All' : v)}
          />
          {(ql || statusF !== 'All') && (
            <button
              type="button"
              onClick={clearAll}
              className="text-body text-blue cursor-pointer border-none bg-transparent p-0"
            >
              Clear all
            </button>
          )}
        </div>
        {rows.length > 0 ? (
          <>
            <TableShell
              columns={['User', 'Phone', 'City', 'Bookings', 'Joined', 'Status', 'Action']}
              rightCols={['Bookings']}
              sortKeys={{
                User: 'name',
                Phone: 'phone',
                City: 'city',
                Bookings: 'bookings',
                Joined: 'joined',
                Status: 'status',
              }}
              sort={sort}
              onSort={onSort}
            >
              {rows.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => view(u)}
                  className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                >
                  <td className={tdClass}>
                    <OpsPerson row={u} />
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{u.phone}</td>
                  <td className={tdClass}>{u.city}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{u.bookings}</td>
                  <td className={tdClass}>{u.joined}</td>
                  <td className={tdClass}>
                    <Badge status={u.status} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <IconBtn
                      name="eye"
                      box={36}
                      size={16}
                      title="View account (logged)"
                      onClick={() => view(u)}
                    />
                  </td>
                </tr>
              ))}
            </TableShell>
            <Pager
              total={filtered.length}
              page={pg}
              pageSize={OPS_PU_PAGE}
              onPage={setPage}
              noun="users"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-11 text-center">
            <div className="bg-grey-300 text-text-muted flex size-12 items-center justify-center rounded-full">
              <Icon name="users" size={22} />
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
