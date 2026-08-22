/**
 * Ops inbox view-model types (interim entities for the static-seed phase).
 * Shapes transcribed from the design prototype's `OpsDB.alerts` and
 * `OpsDB.requests` (Ops.jsx).
 */

/** Severity of a critical alert on the ops dashboard. */
export type OpsAlertSeverity = 'danger' | 'warning';

/** Navigation target an alert jumps to (`hospital:<id>` opens that profile). */
export type OpsAlertTarget = 'settlements' | 'logs' | `hospital:${number}`;

/** One critical alert on the ops dashboard. */
export interface OpsAlert {
  readonly id: number;
  readonly sev: OpsAlertSeverity;
  readonly title: string;
  readonly sub: string;
  readonly go: OpsAlertTarget;
}

/** Kind of request a hospital raised with Medibook. */
export type OpsRequestType = 'Support' | 'Plan' | 'Settlement';

/** Lifecycle state of a hospital request. */
export type OpsRequestStatus = 'Open' | 'Closed';

/** One hospital request in the ops inbox. */
export interface OpsRequest {
  readonly id: number;
  readonly type: OpsRequestType;
  /** Tenant id in the ops hospital registry (joined on id, never on name). */
  readonly hid: number;
  readonly hospital: string;
  readonly subject: string;
  /** Free-text payload (e.g. the settlement id a request refers to). */
  readonly detail?: string;
  readonly on: string;
  readonly status: OpsRequestStatus;
}
