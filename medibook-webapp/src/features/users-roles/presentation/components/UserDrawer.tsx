import type { ReactNode } from 'react';

import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Drawer } from '@/shared/ui/Drawer';
import { toast } from '@/shared/ui/toast/toast.store';

import { useRbacStore } from '@/features/users-roles/application/store/rbac.store';
import type { HospitalUser, Role } from '@/features/users-roles/application/store/rbac.types';
import { AccessSummary } from '@/features/users-roles/presentation/components/AccessSummary';

interface UserDrawerProps {
  user: HospitalUser | null;
  roles: readonly Role[];
  onClose: () => void;
  onReset: (user: HospitalUser) => void;
}

/**
 * User detail drawer (design `Rbac.jsx` `UserDrawer`): identity header with the
 * role annotation, the plain-words access summary, an info card, and the
 * reset-password / activate-deactivate / edit / resend actions.
 */
export function UserDrawer({ user, roles, onClose, onReset }: UserDrawerProps) {
  const rbacUpdateUser = useRbacStore((s) => s.rbacUpdateUser);
  if (!user) return null;
  const activeUser = user;
  const role = roles.find((r) => r.id === activeUser.roleId);
  const active = activeUser.status === 'Active';
  const row = (k: string, v: ReactNode) => (
    <div className="border-border-soft flex justify-between border-b py-3">
      <span className="text-body text-text-muted">{k}</span>
      <span className="text-body text-text-strong text-right font-medium">{v}</span>
    </div>
  );
  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      title={activeUser.name}
      subtitle={activeUser.email}
      width={460}
      footer={
        <>
          <Button variant="secondary" icon="key-round" onClick={() => onReset(activeUser)}>
            Reset Password
          </Button>
          <span className="flex-1" />
          <Button
            variant={active ? 'ghost' : 'success'}
            icon={active ? 'user-x' : 'user-check'}
            style={active ? { color: 'var(--color-d-500)' } : undefined}
            onClick={() => {
              rbacUpdateUser(activeUser.id, { status: active ? 'Inactive' : 'Active' });
              toast(active ? 'User deactivated' : 'User activated', 'info');
              onClose();
            }}
          >
            {active ? 'Deactivate' : 'Activate'}
          </Button>
        </>
      }
    >
      <div className="mb-4.5 flex items-center gap-3.5">
        <Avatar name={activeUser.name} size={56} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-h3 text-text-strong">{activeUser.name}</span>
            <Badge status={activeUser.status} />
          </div>
          {role && (
            <div
              className="text-body mt-1.25 inline-flex items-center gap-1.5 font-semibold"
              style={{ color: role.color }}
            >
              <span className="size-2 rounded-full" style={{ background: role.color }} />
              {role.name}
            </div>
          )}
        </div>
      </div>
      {role && (
        <div className="border-border-soft bg-bg-subtle mb-4 rounded-md border px-3.5 py-3">
          {role.desc && <div className="text-caption text-text-muted mb-2">{role.desc}</div>}
          <AccessSummary perms={role.perms} />
        </div>
      )}
      <Card pad={16} className="mb-4">
        {row('Username', activeUser.username)}
        {row('Email', activeUser.email)}
        {row('Phone', activeUser.phone)}
        {row('Role', role ? role.name : '—')}
        {row(
          'Invite status',
          <Badge status={activeUser.invite === 'Accepted' ? 'Active' : 'Pending'}>
            {activeUser.invite}
          </Badge>,
        )}
        <div className="flex justify-between py-3">
          <span className="text-body text-text-muted">Last active</span>
          <span className="text-body text-text-strong font-medium">{activeUser.last}</span>
        </div>
      </Card>
      <div className="flex gap-2.5">
        <Button
          variant="secondary"
          icon="pencil"
          className="flex-1"
          onClick={() => toast('Edit user — demo', 'info')}
        >
          Edit Details
        </Button>
        {activeUser.invite === 'Pending' && (
          <Button
            variant="secondary"
            icon="send"
            className="flex-1"
            onClick={() => toast('Invite resent', 'success')}
          >
            Resend Invite
          </Button>
        )}
      </div>
    </Drawer>
  );
}
