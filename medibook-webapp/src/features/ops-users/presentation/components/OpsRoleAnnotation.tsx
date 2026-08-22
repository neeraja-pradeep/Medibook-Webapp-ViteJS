import { OPS_ROLE_INFO } from '@/features/ops-users/application/store/opsUsers.fixtures';
import type { OpsRole } from '@/features/ops-users/application/store/opsUsers.types';
import { Icon } from '@/shared/ui/Icon';

interface OpsRoleAnnotationProps {
  role: OpsRole;
}

/**
 * Role annotation card — the plain-language "can / no access" summary shown
 * wherever a role is picked, so access is explicit before assigning (design
 * `OpsRoleAnnotation`).
 */
export function OpsRoleAnnotation({ role }: OpsRoleAnnotationProps) {
  const info = OPS_ROLE_INFO[role];
  if (!info) return null;
  return (
    <div className="border-border-soft bg-bg-subtle flex flex-col gap-1.75 rounded-md border px-3.5 py-3">
      <span className="text-body text-text-strong font-medium">
        {role} — <span className="text-text-body font-normal">{info.desc}</span>
      </span>
      {info.can.map((c) => (
        <span key={c} className="text-caption text-text-body flex items-start gap-1.75">
          <Icon name="circle-check" size={14} className="text-g-600 mt-px flex-none" /> {c}
        </span>
      ))}
      {info.cant.map((c) => (
        <span key={c} className="text-caption text-text-muted flex items-start gap-1.75">
          <Icon name="circle-slash" size={14} className="text-text-faint mt-px flex-none" /> No
          access: {c}
        </span>
      ))}
    </div>
  );
}
