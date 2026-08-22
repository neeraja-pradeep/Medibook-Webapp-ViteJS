/**
 * Internal Medibook users & roles view-model types (interim entities for the
 * static-seed phase). Shapes transcribed from the design prototype's
 * `OpsDB.users`, `OPS_USER` and `OPS_ROLE_INFO` (Ops.jsx).
 */

/** Fixed platform access profiles for internal Medibook users. */
export type OpsRole = 'Super Admin' | 'Finance Admin' | 'Support' | 'Auditor';

/** Two-factor authentication state of an internal user. */
export type OpsTwoFaState = 'Enabled' | 'Pending';

/** Account state of an internal user. */
export type OpsUserStatus = 'Active' | 'Pending' | 'Suspended';

/** One internal Medibook user in the operations console. */
export interface OpsUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: OpsRole;
  readonly twofa: OpsTwoFaState;
  readonly lastActive: string;
  readonly status: OpsUserStatus;
  readonly av: string | null;
}

/** The signed-in operations user shown in the ops topbar. */
export interface OpsCurrentUser {
  readonly name: string;
  readonly role: OpsRole;
  readonly av: string | null;
}

/** Role annotation — what a role can and cannot do, shown before assigning. */
export interface OpsRoleInfo {
  readonly desc: string;
  readonly can: readonly string[];
  readonly cant: readonly string[];
}

/**
 * One row of the role-permission matrix:
 * `[permission label, Super Admin, Finance Admin, Support, Auditor]`
 * (1 = granted, 0 = no access, as in the prototype).
 */
export type OpsPermissionRow = readonly [string, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
