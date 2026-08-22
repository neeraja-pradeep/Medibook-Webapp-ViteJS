import { useEffect, useState } from 'react';

import type { AddOpsUserForm } from '@/features/ops-users/application/store/opsUsers.store';
import { useOpsUsersStore } from '@/features/ops-users/application/store/opsUsers.store';
import type { OpsRole } from '@/features/ops-users/application/store/opsUsers.types';
import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { OpsField } from '@/shared/ui/OpsField';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';

import { OpsRoleAnnotation } from './OpsRoleAnnotation';

/** Assignable roles, in the design's Select order. */
const OPS_ROLE_OPTIONS: readonly OpsRole[] = ['Super Admin', 'Finance Admin', 'Support', 'Auditor'];

/**
 * Form validators, ported 1:1 from the design file's `vEmailOps` / `vReqOps`
 * (Ops.jsx). Feature-local — the shared layer ships no validation helpers yet.
 */
const vEmailOps = (v: string): string | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ? null : 'Enter a valid email address.';
const vReqOps = (v: string, msg: string): string | null => (v && v.trim() ? null : msg);

interface AddUserErrors {
  name?: string | null;
  email?: string | null;
}

interface AddOpsUserModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

/** Add-user modal — validated invite form with a live role annotation. */
export function AddOpsUserModal({ open, onClose, onDone }: AddOpsUserModalProps) {
  const addUser = useOpsUsersStore((s) => s.addUser);
  const [f, setF] = useState<AddOpsUserForm>({ name: '', email: '', role: 'Support' });
  const [err, setErr] = useState<AddUserErrors>({});
  const [busy, run] = useOpsAct();

  useEffect(() => {
    if (open) {
      setF({ name: '', email: '', role: 'Support' });
      setErr({});
    }
  }, [open]);

  const submit = () => {
    const e: AddUserErrors = {
      name: vReqOps(f.name, 'Full name is required.'),
      email: vEmailOps(f.email),
    };
    setErr(e);
    if (e.name || e.email) return;
    run('au', `${f.name} added.`, () => {
      addUser(f);
      onDone();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add User"
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={busy.au ? undefined : submit} className={cn(busy.au && 'opacity-50')}>
            {busy.au ? 'Adding…' : 'Add User'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <OpsField label="Full Name" required error={err.name}>
          <TextInput
            value={f.name}
            onChange={(v) => {
              setF({ ...f, name: v });
              setErr({ ...err, name: null });
            }}
            placeholder="e.g. Kavya Reddy"
            height={48}
          />
        </OpsField>
        <OpsField label="Work Email" required error={err.email}>
          <TextInput
            value={f.email}
            onChange={(v) => {
              setF({ ...f, email: v });
              setErr({ ...err, email: null });
            }}
            placeholder="name@medibook.in"
            height={48}
          />
        </OpsField>
        <OpsField label="Role">
          <Select
            value={f.role}
            options={OPS_ROLE_OPTIONS}
            onChange={(v) => setF({ ...f, role: OPS_ROLE_OPTIONS.find((r) => r === v) ?? f.role })}
            height={48}
          />
        </OpsField>
        <OpsRoleAnnotation role={f.role} />
        <div className="bg-blue-soft-bg text-caption text-text-muted flex items-start gap-2 rounded-sm px-3 py-2.5">
          <Icon name="info" size={14} className="mt-px flex-none" /> An invite email is sent. The
          account stays Pending until they set a password and enable 2FA.
        </div>
      </div>
    </Modal>
  );
}
