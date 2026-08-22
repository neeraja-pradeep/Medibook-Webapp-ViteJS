/**
 * Ops-side settlement types. The row shape is shared with the hospital app's
 * settlement ledger (`features/settlements`) — the ops screen merges both, so
 * the seed rows reuse that entity minus the derived money columns:
 * `commission`/`net` are NOT stored here; the store/screen computes them at
 * the platform commission rate (10%), matching the prototype.
 */
import type { Settlement } from '@/features/settlements/application/store/settlements.types';

/**
 * A non-Apollo settlement seed row (derived money columns stripped). The
 * prototype's `OpsDB.settlements` rows simply omit `utr`/`remark`/`receivedOn`
 * until a lifecycle action writes them, so those fields are optional here.
 */
export type OpsSettlementSeed = Omit<
  Settlement,
  'commission' | 'net' | 'utr' | 'remark' | 'receivedOn'
> &
  Partial<Pick<Settlement, 'utr' | 'remark' | 'receivedOn'>>;

export type { Settlement };
