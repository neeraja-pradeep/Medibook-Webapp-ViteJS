import {
  PERM_ACTIONS,
  RBAC_MODULES,
  type PermsGrid,
  type RbacModule,
} from '@/features/users-roles/application/store/rbac.types';

/** Plain-words access breakdown of a permission grid (design `accessBuckets`). */
export interface AccessBuckets {
  readonly full: RbacModule[];
  readonly partial: RbacModule[];
  readonly viewOnly: RbacModule[];
  readonly none: number;
}

/**
 * Sort a role's modules into full / limited / view-only buckets and count the
 * modules it can't touch — derived live from the permission grid.
 */
export function accessBuckets(perms: PermsGrid): AccessBuckets {
  const full: RbacModule[] = [];
  const partial: RbacModule[] = [];
  const viewOnly: RbacModule[] = [];
  RBAC_MODULES.forEach((m) => {
    const pm = perms[m];
    const n = PERM_ACTIONS.filter((a) => pm[a]).length;
    if (n === PERM_ACTIONS.length) full.push(m);
    else if (n === 1 && pm.view) viewOnly.push(m);
    else if (n > 0) partial.push(m);
  });
  return {
    full,
    partial,
    viewOnly,
    none: RBAC_MODULES.length - full.length - partial.length - viewOnly.length,
  };
}
