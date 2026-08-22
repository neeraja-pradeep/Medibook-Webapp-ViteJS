/**
 * Subscription-plan view-model types (interim entities for the static-seed
 * phase). Shapes transcribed from the design prototype's `OpsDB.plans` and
 * `OpsDB.planChanges` (Ops.jsx).
 */

/** One subscription plan tier in the platform catalog. */
export interface Plan {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly quota: number;
  readonly staff: string;
  readonly support: string;
  readonly extra: string;
  readonly popular: boolean;
  readonly custom: boolean;
}

/** Lifecycle state of a hospital's plan-change request. */
export type PlanChangeStatus = 'Completed' | 'Pending' | 'Cancelled';

/** A hospital's request to move between plan tiers. */
export interface PlanChange {
  readonly id: number;
  /** Tenant id in the ops hospital registry (joined on id, never on name). */
  readonly hid: number;
  readonly hospital: string;
  readonly email: string;
  readonly change: string;
  readonly requested: string;
  readonly status: PlanChangeStatus;
}
