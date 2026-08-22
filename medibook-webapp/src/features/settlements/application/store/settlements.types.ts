/**
 * Interim view-model types for weekly settlements (Medibook -> hospital).
 * Shared lifecycle with the ops console: Pending -> Released (by Medibook)
 * -> Received (confirmed by the hospital); Overdue = past expected without
 * release; "Payout failed" occurs on the ops side.
 */

export type SettlementStatus = 'Pending' | 'Overdue' | 'Released' | 'Received' | 'Payout failed';

export interface Settlement {
  readonly id: string;
  /** Statement period label, e.g. "10 – 16 Jun 2026". */
  readonly period: string;
  /** Gross online fees accrued for completed appointments. */
  readonly gross: number;
  /** Expected transfer date (ISO). */
  readonly expected: string;
  readonly status: SettlementStatus;
  /** Tenant id in the ops registry — cross-app records join on it. */
  readonly hid: number;
  readonly hospital: string;
  readonly utr: string | null;
  readonly remark: string | null;
  /** Platform commission (10% of gross), materialized. */
  readonly commission: number;
  /** Net transferred = gross - commission, materialized. */
  readonly net: number;
  /** ISO date the hospital confirmed receipt (Received rows only). */
  readonly receivedOn: string | null;
  /** Lifecycle fields written by release / request actions. */
  readonly releasedAmt?: number;
  readonly requested?: boolean;
  readonly requestedOn?: string;
}
