import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import { useRbacStore } from '@/features/users-roles/application/store/rbac.store';
import type { Role } from '@/features/users-roles/application/store/rbac.types';
import { AccessSummary } from '@/features/users-roles/presentation/components/AccessSummary';

type InviteMethod = 'email' | 'otp' | 'manual';

interface AddUserForm {
  name: string;
  email: string;
  phone: string;
  username: string;
  roleId: string;
  invite: InviteMethod;
  password: string;
}

const BLANK_FORM: AddUserForm = {
  name: '',
  email: '',
  phone: '',
  username: '',
  roleId: '',
  invite: 'email',
  password: '',
};

const INVITES: readonly (readonly [InviteMethod, string])[] = [
  ['email', 'Email invite'],
  ['otp', 'Mobile OTP'],
  ['manual', 'Set password now'],
];

/** Monotonic counter for new user ids (replaces the prototype's `Date.now()`). */
let userIdSeq = 0;

interface AddUserModalProps {
  open: boolean;
  roles: readonly Role[];
  onClose: () => void;
}

/**
 * Add-user modal (design `Rbac.jsx` `AddUserModal`): the details grid, a live
 * role annotation card, and the invite-method picker. The role Select stores
 * the roleId but displays the role name — ported exactly.
 */
export function AddUserModal({ open, roles, onClose }: AddUserModalProps) {
  const rbacAddUser = useRbacStore((s) => s.rbacAddUser);
  const [f, setF] = useState<AddUserForm>(BLANK_FORM);
  const set = <K extends keyof AddUserForm>(k: K, v: AddUserForm[K]) =>
    setF((x) => ({ ...x, [k]: v }));
  useEffect(() => {
    if (open) setF(BLANK_FORM);
  }, [open]);
  const submit = () => {
    if (!f.name || !f.email || !f.roleId) {
      toast('Name, email and role are required', 'error');
      return;
    }
    userIdSeq += 1;
    rbacAddUser({
      id: `u-${userIdSeq}`,
      name: f.name,
      email: f.email,
      phone: f.phone,
      username: f.username || f.email.split('@')[0],
      roleId: f.roleId,
      status: 'Active',
      last: 'Never',
      invite: f.invite === 'manual' ? 'Accepted' : 'Pending',
    });
    toast(
      f.invite === 'email'
        ? 'Email invite sent'
        : f.invite === 'otp'
          ? 'OTP sent for confirmation'
          : 'User created with password',
      'success',
    );
    onClose();
  };
  const picked = roles.find((r) => r.id === f.roleId);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add User"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="user-plus" onClick={submit}>
            Add User
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4.5">
        <Field label="Full Name" required>
          <TextInput
            value={f.name}
            onChange={(v) => set('name', v)}
            placeholder="e.g. Asha Verma"
          />
        </Field>
        <Field label="Role" required>
          <Select
            value={roles.find((r) => r.id === f.roleId)?.name ?? ''}
            placeholder="Select role"
            options={roles.map((r) => r.name)}
            onChange={(name) => set('roleId', roles.find((r) => r.name === name)?.id ?? '')}
          />
        </Field>
        <Field label="Email" required>
          <TextInput
            value={f.email}
            onChange={(v) => set('email', v)}
            placeholder="name@hospital.med"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={f.phone}
            onChange={(v) => set('phone', v)}
            placeholder="Mobile number"
          />
        </Field>
        <Field label="Username">
          <TextInput
            value={f.username}
            onChange={(v) => set('username', v)}
            placeholder="Auto from email if blank"
          />
        </Field>
        <Field label={f.invite === 'manual' ? 'Password' : 'Password (set later)'}>
          <TextInput
            value={f.password}
            onChange={(v) => set('password', v)}
            placeholder={f.invite === 'manual' ? 'Set a password' : 'Sent via invite'}
            type="password"
          />
        </Field>
      </div>
      {picked && (
        <div className="border-border-soft bg-bg-subtle mt-4 rounded-md border px-3.5 py-3">
          <div className="mb-1.5 flex items-center gap-1.75">
            <span className="size-2 flex-none rounded-full" style={{ background: picked.color }} />
            <span className="text-body text-text-strong font-medium">{picked.name}</span>
            {picked.desc && <span className="text-caption text-text-muted">— {picked.desc}</span>}
          </div>
          <AccessSummary perms={picked.perms} />
        </div>
      )}
      <div className="mt-4.5">
        <div className="text-body text-text-strong mb-2">How should they get access?</div>
        <div className="flex gap-2.5">
          {INVITES.map(([k, l]) => (
            <div
              key={k}
              onClick={() => set('invite', k)}
              className={cn(
                'text-body flex-1 cursor-pointer rounded-md py-3 text-center font-medium',
                f.invite === k
                  ? 'border-blue bg-blue-soft-bg text-blue border-2'
                  : 'border-border text-text-body border bg-white',
              )}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
