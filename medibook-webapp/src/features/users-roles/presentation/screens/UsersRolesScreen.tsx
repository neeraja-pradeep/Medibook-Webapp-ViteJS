import { useState } from 'react';

import { useSort } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { IconBtn } from '@/shared/ui/IconBtn';
import { SearchField } from '@/shared/ui/SearchField';
import { SegTabs } from '@/shared/ui/SegTabs';
import { tdClass, TableShell } from '@/shared/ui/TableShell';

import { useRbacStore } from '@/features/users-roles/application/store/rbac.store';
import {
  PERM_ACTIONS,
  RBAC_MODULES,
  type HospitalUser,
  type PermsGrid,
  type Role,
} from '@/features/users-roles/application/store/rbac.types';
import { AddUserModal } from '@/features/users-roles/presentation/components/AddUserModal';
import { ResetModal } from '@/features/users-roles/presentation/components/ResetModal';
import { RoleEditor } from '@/features/users-roles/presentation/components/RoleEditor';
import { UserDrawer } from '@/features/users-roles/presentation/components/UserDrawer';

/** Module coverage summary for a role card (design `permSummary`). */
function permSummary(perms: PermsGrid): { count: number; full: number } {
  const mods = RBAC_MODULES.filter((m) => PERM_ACTIONS.some((a) => perms[m][a]));
  const full = RBAC_MODULES.filter((m) => PERM_ACTIONS.every((a) => perms[m][a]));
  return { count: mods.length, full: full.length };
}

interface Kpi {
  readonly icon: IconName;
  readonly label: string;
  readonly value: number;
  readonly fg: string;
  readonly bg: string;
}

const USER_COLUMNS = ['User', 'Username', 'Role', 'Last Active', 'Status', 'Action'] as const;

const USER_SORT_KEYS: Readonly<Record<string, string | undefined>> = {
  User: 'name',
  Username: 'username',
  Role: 'role',
  Status: 'status',
};

/**
 * Users & Roles (hospital RBAC), admin-only. A Users / Roles & Permissions
 * segmented view: users get KPI tiles, search + role/status filters, a sortable
 * table, a detail drawer and an add-user modal; roles get a card grid with live
 * permission summaries plus the role editor drawer. Design `Rbac.jsx`.
 */
export function UsersRolesScreen() {
  const roles = useRbacStore((s) => s.roles);
  const users = useRbacStore((s) => s.users);

  const [tab, setTab] = useState('Users');
  const [add, setAdd] = useState(false);
  const [roleEdit, setRoleEdit] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });
  const [userView, setUserView] = useState<HospitalUser | null>(null);
  const [reset, setReset] = useState<HospitalUser | null>(null);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const roleById = Object.fromEntries(roles.map((r) => [r.id, r] as const));
  const { sort, onSort, sorted } = useSort<HospitalUser>();

  const shown = users.filter((u) => {
    if (q && !(u.name + u.email + u.username).toLowerCase().includes(q.toLowerCase())) return false;
    if (roleFilter !== 'All Roles' && roleById[u.roleId]?.name !== roleFilter) return false;
    if (statusFilter !== 'All Status' && u.status !== statusFilter) return false;
    return true;
  });

  const kpis: readonly Kpi[] = [
    {
      icon: 'users',
      label: 'Total Users',
      value: users.length,
      fg: 'text-blue',
      bg: 'bg-blue-soft-bg',
    },
    {
      icon: 'user-check',
      label: 'Active',
      value: users.filter((u) => u.status === 'Active').length,
      fg: 'text-g-600',
      bg: 'bg-g-100',
    },
    { icon: 'shield', label: 'Roles', value: roles.length, fg: 'text-p-500', bg: 'bg-p-100' },
    {
      icon: 'mail',
      label: 'Pending Invites',
      value: users.filter((u) => u.invite === 'Pending').length,
      fg: 'text-y-600',
      bg: 'bg-y-100',
    },
  ];

  const filtersActive = q !== '' || roleFilter !== 'All Roles' || statusFilter !== 'All Status';

  return (
    <div className="flex flex-col gap-5">
      <Card pad={16} className="flex flex-wrap items-center justify-between gap-3">
        <SegTabs tabs={['Users', 'Roles & Permissions']} value={tab} onChange={setTab} />
        {tab === 'Users' ? (
          <Button icon="user-plus" onClick={() => setAdd(true)}>
            Add User
          </Button>
        ) : (
          <Button icon="plus" onClick={() => setRoleEdit({ open: true, role: null })}>
            Create Role
          </Button>
        )}
      </Card>

      {tab === 'Users' ? (
        <>
          <div className="flex gap-4">
            {kpis.map((k) => (
              <Card key={k.label} pad={18} className="flex-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex size-9.5 flex-none items-center justify-center rounded-md',
                      k.bg,
                      k.fg,
                    )}
                  >
                    <Icon name={k.icon} size={20} />
                  </div>
                  <span className="text-body text-text-strong font-medium">{k.label}</span>
                </div>
                <div className={cn('text-stat mt-2.5', k.fg)}>{k.value}</div>
              </Card>
            ))}
          </div>
          <Card pad={20}>
            <div className="mb-4">
              <SearchField
                value={q}
                onChange={setQ}
                placeholder="Search users by name, email or username"
              />
            </div>
            <div className="mb-4.5 flex items-center gap-3">
              <FilterSelect
                value={roleFilter}
                options={['All Roles', ...roles.map((r) => r.name)]}
                onChange={setRoleFilter}
              />
              <FilterSelect
                value={statusFilter}
                options={['All Status', 'Active', 'Inactive']}
                onChange={setStatusFilter}
              />
              {filtersActive && (
                <span
                  onClick={() => {
                    setQ('');
                    setRoleFilter('All Roles');
                    setStatusFilter('All Status');
                  }}
                  className="text-body text-blue cursor-pointer whitespace-nowrap"
                >
                  Clear all
                </span>
              )}
            </div>
            <TableShell
              columns={USER_COLUMNS}
              sortKeys={USER_SORT_KEYS}
              sort={sort}
              onSort={onSort}
            >
              {sorted(shown, {
                name: (u) => u.name,
                username: (u) => u.username,
                role: (u) => roleById[u.roleId]?.name,
                status: (u) => u.status,
              }).map((u) => {
                const r = roleById[u.roleId];
                return (
                  <tr
                    key={u.id}
                    onClick={() => setUserView(u)}
                    className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size={32} />
                        <div>
                          <div className="text-body text-text-strong font-medium">{u.name}</div>
                          <div className="text-caption text-text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={cn(tdClass, 'text-text-muted')}>{u.username}</td>
                    <td className={tdClass}>
                      {r && (
                        <span
                          className="text-body inline-flex items-center gap-1.75 font-semibold"
                          style={{ color: r.color }}
                        >
                          <span className="size-2 rounded-full" style={{ background: r.color }} />
                          {r.name}
                        </span>
                      )}
                    </td>
                    <td className={cn(tdClass, 'text-text-muted')}>{u.last}</td>
                    <td className={tdClass}>
                      <Badge status={u.status} />
                    </td>
                    <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <IconBtn
                          name="eye"
                          box={34}
                          size={15}
                          title="View"
                          onClick={() => setUserView(u)}
                        />
                        <IconBtn
                          name="key-round"
                          box={34}
                          size={15}
                          title="Reset password"
                          onClick={() => setReset(u)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </TableShell>
            {shown.length === 0 && (
              <div className="text-body-lg text-text-faint py-10 text-center">
                No users match your filters.
              </div>
            )}
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {roles.map((r) => {
            const s = permSummary(r.perms);
            const count = users.filter((u) => u.roleId === r.id).length;
            return (
              <Card key={r.id} pad={18} hover onClick={() => setRoleEdit({ open: true, role: r })}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="size-2.5 rounded-[3px]" style={{ background: r.color }} />
                  <span className="text-body text-text-strong font-medium">{r.name}</span>
                  {r.system ? (
                    <span className="text-caption text-text-faint ml-auto inline-flex items-center gap-1">
                      <Icon name="lock" size={12} /> System
                    </span>
                  ) : (
                    <Icon name="pencil" size={15} className="text-text-faint ml-auto" />
                  )}
                </div>
                <p className="text-caption text-text-muted mb-3 min-h-10">{r.desc}</p>
                <div className="text-caption text-text-body flex gap-4">
                  <span className="inline-flex items-center gap-1.25">
                    <Icon name="users" size={14} className="text-text-muted" /> {count}{' '}
                    {count === 1 ? 'user' : 'users'}
                  </span>
                  <span className="inline-flex items-center gap-1.25">
                    <Icon name="shield-check" size={14} className="text-text-muted" /> {s.count}/
                    {RBAC_MODULES.length} modules
                  </span>
                </div>
              </Card>
            );
          })}
          <Card
            pad={18}
            hover
            onClick={() => setRoleEdit({ open: true, role: null })}
            className="border-border text-text-muted flex min-h-30 flex-col items-center justify-center gap-2 border-[1.5px] border-dashed"
          >
            <Icon name="plus" size={24} />
            <span className="text-body font-medium">Create Role</span>
          </Card>
        </div>
      )}

      <AddUserModal open={add} roles={roles} onClose={() => setAdd(false)} />
      <RoleEditor
        open={roleEdit.open}
        role={roleEdit.role}
        onClose={() => setRoleEdit({ open: false, role: null })}
      />
      <UserDrawer
        user={userView}
        roles={roles}
        onClose={() => setUserView(null)}
        onReset={(u) => {
          setUserView(null);
          setReset(u);
        }}
      />
      <ResetModal user={reset} onClose={() => setReset(null)} />
    </div>
  );
}
