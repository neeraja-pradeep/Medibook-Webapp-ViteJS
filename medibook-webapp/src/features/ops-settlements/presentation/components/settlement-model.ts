import type { Settlement } from '@/features/settlements/application/store/settlements.types';
import type { OpsTint } from '@/shared/ui/OpsConfirm';

/**
 * View-model for one row of the settlement queue. The screen merges the
 * hospital-side Apollo ledger (`settlements.store`) with the ops-side
 * non-Apollo rows (`opsSettlements.store`) into this uniform shape — a full
 * `Settlement` plus an `apollo` flag marking which store owns the row (the
 * live cross-app link the release flow writes back through).
 */
export type SettlementRow = Settlement & { readonly apollo: boolean };

/** A payout-run group — one bucket per expected date (design grouping). */
export interface PayoutRun {
  date: string;
  rows: SettlementRow[];
}

/** Ops accent tint cycle (design `opsTintOf`). */
const OPS_TINT_CYCLE: readonly OpsTint[] = ['primary', 'info', 'success', 'warning', 'neutral'];

export function opsTintOf(i: number): OpsTint {
  return OPS_TINT_CYCLE[i % OPS_TINT_CYCLE.length] ?? 'primary';
}

/** A statement Medibook can still release (design `releasable`). */
export function releasable(r: SettlementRow): boolean {
  return r.status === 'Pending' || r.status === 'Overdue';
}

/** Inline validation state for the Record Settlement Release form. */
export interface RelErr {
  amt?: string | null;
  ref?: string | null;
}

/** The transfer-detail patch a release writes onto a statement row. */
export interface ReleasePatch {
  utr: string;
  releasedAmt: number;
  remark: string | null;
  requested: false;
}
