/**
 * Compliance-log view-model types (interim entities for the static-seed
 * phase). Shape transcribed from the design prototype's `OpsDB.logs`
 * (Ops.jsx) — many features' actions append entries to this trail.
 */

/** Severity of an audit-trail entry. */
export type LogSeverity = 'Info' | 'Warning' | 'Critical';

/** One entry in the platform audit trail. */
export interface LogEntry {
  readonly id: number;
  /** Tenant id when the action concerns one hospital (set by later actions). */
  readonly hid?: number;
  readonly action: string;
  readonly actor: string;
  readonly module: string;
  readonly ip: string;
  readonly time: string;
  readonly sev: LogSeverity;
}
