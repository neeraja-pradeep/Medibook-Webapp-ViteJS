/**
 * Interim view-model types + constants for Users & Roles (design
 * `data.jsx` RBAC seeds, consumed by `Rbac.jsx`): admin-defined roles
 * with granular CRUD permissions plus hospital users.
 */

/** The ten permission-gated modules, in grid display order. */
export const RBAC_MODULES = [
  'Dashboard',
  'Appointments',
  'Patients',
  'Token Management',
  'Payments',
  'Billing & Settlements',
  'Doctors & Departments',
  'Reports',
  'Hospital Settings',
  'Users & Roles',
] as const;

export type RbacModule = (typeof RBAC_MODULES)[number];

/** The four CRUD actions of the permission grid, in column order. */
export const PERM_ACTIONS = ['view', 'add', 'edit', 'del'] as const;

export type PermAction = (typeof PERM_ACTIONS)[number];

/** One module's CRUD flags. */
export type ModulePerms = Readonly<Record<PermAction, boolean>>;

/** The full module x action permission grid of a role. */
export type PermsGrid = Readonly<Record<RbacModule, ModulePerms>>;

export interface Role {
  readonly id: string;
  readonly name: string;
  /** Concrete hex color — feeds the role dot / role name inline styles. */
  readonly color: string;
  readonly desc: string;
  /** True for the locked Administrator role (always full access). */
  readonly system?: boolean;
  readonly perms: PermsGrid;
}

export type UserStatus = 'Active' | 'Inactive';

export type InviteStatus = 'Accepted' | 'Pending';

export interface HospitalUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly username: string;
  readonly roleId: string;
  readonly status: UserStatus;
  /** Last-active label, e.g. "5 min ago". */
  readonly last: string;
  readonly invite: InviteStatus;
}
