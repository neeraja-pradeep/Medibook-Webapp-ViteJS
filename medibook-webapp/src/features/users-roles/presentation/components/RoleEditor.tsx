import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import { blankPerms, ROLE_COLORS } from '@/features/users-roles/application/store/rbac.fixtures';
import { useRbacStore } from '@/features/users-roles/application/store/rbac.store';
import {
  PERM_ACTIONS,
  RBAC_MODULES,
  type ModulePerms,
  type PermsGrid,
  type PermAction,
  type RbacModule,
  type Role,
} from '@/features/users-roles/application/store/rbac.types';
import {
  AccessSummary,
  accessBuckets,
} from '@/features/users-roles/presentation/components/AccessSummary';
import { PermCheck } from '@/features/users-roles/presentation/components/PermCheck';

const PERM_COLS: readonly (readonly [PermAction, string])[] = [
  ['view', 'View'],
  ['add', 'Add'],
  ['edit', 'Edit'],
  ['del', 'Delete'],
];

/** Monotonic counter for new role ids (replaces the prototype's `Date.now()`). */
let roleIdSeq = 0;

interface RoleEditorProps {
  role: Role | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Role editor drawer (design `Rbac.jsx` `RoleEditor`): name + description, the
 * full module x action permission grid (row-toggle by clicking the module
 * name), the locked system-role notice, and the live "What this role can do"
 * panel.
 */
export function RoleEditor({ role, open, onClose }: RoleEditorProps) {
  const rbacAddRole = useRbacStore((s) => s.rbacAddRole);
  const rbacUpdateRole = useRbacStore((s) => s.rbacUpdateRole);
  const rbacDeleteRole = useRbacStore((s) => s.rbacDeleteRole);

  const isNew = !role;
  const locked = Boolean(role?.system);
  const [name, setName] = useState(role ? role.name : '');
  const [desc, setDesc] = useState(role ? role.desc : '');
  const [perms, setPerms] = useState<PermsGrid>(role ? role.perms : blankPerms());
  useEffect(() => {
    if (open) {
      setName(role ? role.name : '');
      setDesc(role ? role.desc : '');
      setPerms(role ? role.perms : blankPerms());
    }
  }, [open, role]);

  const toggle = (mod: RbacModule, act: PermAction) => {
    if (locked) return;
    setPerms((p) => {
      const next: Record<RbacModule, ModulePerms> = { ...p };
      next[mod] = { ...p[mod], [act]: !p[mod][act] };
      return next;
    });
  };
  const toggleRow = (mod: RbacModule) => {
    if (locked) return;
    setPerms((p) => {
      const all = PERM_ACTIONS.every((a) => p[mod][a]);
      const next: Record<RbacModule, ModulePerms> = { ...p };
      next[mod] = { view: !all, add: !all, edit: !all, del: !all };
      return next;
    });
  };

  const save = () => {
    if (!name.trim()) {
      toast('Give the role a name', 'error');
      return;
    }
    if (!role) {
      roleIdSeq += 1;
      const count = useRbacStore.getState().roles.length;
      rbacAddRole({
        id: `r-new-${roleIdSeq}`,
        name,
        desc,
        color: ROLE_COLORS[count % ROLE_COLORS.length],
        perms,
      });
      toast(`Role "${name}" created`, 'success');
    } else {
      rbacUpdateRole(role.id, { name, desc, perms });
      toast('Role updated', 'success');
    }
    onClose();
  };

  let title: string;
  if (!role) title = 'Create Role';
  else if (locked) title = `${role.name} (System)`;
  else title = `Edit ${role.name}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Name the role and choose what it can do in each module"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {!isNew && !locked && role && (
            <Button
              variant="ghost"
              icon="trash-2"
              style={{ color: 'var(--color-d-500)' }}
              onClick={() => {
                rbacDeleteRole(role.id);
                toast('Role deleted', 'info');
                onClose();
              }}
            >
              Delete
            </Button>
          )}
          <span className="flex-1" />
          {!locked && (
            <Button icon="check" onClick={save}>
              {isNew ? 'Create Role' : 'Save Role'}
            </Button>
          )}
        </>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-x-4.5 gap-y-4">
        <Field label="Role Name" required>
          <TextInput value={name} onChange={setName} placeholder="e.g. Billing Supervisor" />
        </Field>
        <Field label="Description">
          <TextInput value={desc} onChange={setDesc} placeholder="Short description" />
        </Field>
      </div>
      {locked && (
        <div className="text-caption text-text-muted bg-y-100 mb-3.5 flex items-center gap-2 rounded-md px-3 py-2.25">
          <Icon name="lock" size={15} className="text-y-700" /> The Administrator role always has
          full access and can&apos;t be edited.
        </div>
      )}
      <div className="text-body text-text-strong mb-2.5 font-medium">Module Permissions</div>
      <div className="border-border-soft overflow-hidden rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-bg-tint text-text-navy text-body border-border-soft border-b px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                Module
              </th>
              {PERM_COLS.map(([k, l]) => (
                <th
                  key={k}
                  className="bg-bg-tint text-text-navy text-body border-border-soft border-b px-2 py-2.5 text-center font-semibold whitespace-nowrap"
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RBAC_MODULES.map((mod) => (
              <tr key={mod}>
                <td className="border-border-soft text-text-strong text-body border-b px-3 py-2.5 align-middle font-medium whitespace-nowrap">
                  <span
                    onClick={() => toggleRow(mod)}
                    className={cn(locked ? 'cursor-default' : 'cursor-pointer')}
                  >
                    {mod}
                  </span>
                </td>
                {PERM_ACTIONS.map((a) => (
                  <td
                    key={a}
                    className="border-border-soft border-b px-2 py-2.5 text-center align-middle"
                  >
                    <PermCheck
                      on={perms[mod][a]}
                      disabled={locked}
                      onClick={() => toggle(mod, a)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!locked && (
        <div className="text-caption text-text-muted mt-2.5">
          Tip: click a module name to toggle its whole row.
        </div>
      )}
      <div className="border-border-soft bg-bg-subtle mt-4 rounded-md border px-3.5 py-3">
        <div className="text-body text-text-strong mb-2 font-medium">What this role can do</div>
        {accessBuckets(perms).none === RBAC_MODULES.length ? (
          <span className="text-caption text-text-muted">
            Nothing yet — grant at least View on one module.
          </span>
        ) : (
          <AccessSummary perms={perms} />
        )}
        <div className="text-caption text-text-faint mt-2">
          Updates as you toggle permissions. Users see only the modules they can at least view.
        </div>
      </div>
    </Drawer>
  );
}
