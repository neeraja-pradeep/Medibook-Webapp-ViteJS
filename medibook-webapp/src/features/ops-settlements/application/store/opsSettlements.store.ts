import { create } from 'zustand';

import { OPS_SETTLEMENTS } from './opsSettlements.fixtures';
import type { OpsSettlementSeed } from './opsSettlements.types';

/**
 * Ops-side settlement rows — the 8 non-Apollo statements (design
 * `OpsDB.settlements`). Apollo's statements live in the hospital app's
 * `settlements.store` (the shared ledger): the OpsSettlements SCREEN merges
 * both lists, computes the derived `commission`/`net` columns at the live
 * platform-commission rate, routes Apollo releases through
 * `settlements.store.settleRelease`, and closes matching inbox requests —
 * exactly as the prototype's screen-level `applyReleasePatch` did. This
 * store only owns the non-Apollo rows and their release patch.
 */

/** Fields a release patch writes onto a statement row. */
export type OpsReleasePatch = Partial<
  Pick<OpsSettlementSeed, 'utr' | 'releasedAmt' | 'remark' | 'requested'>
>;

interface OpsSettlementsState {
  settlements: readonly OpsSettlementSeed[];
}

interface OpsSettlementsActions {
  /** Mark a non-Apollo statement Released with the recorded transfer details. */
  applyReleasePatch: (id: string, patch: OpsReleasePatch) => void;
}

export const useOpsSettlementsStore = create<OpsSettlementsState & OpsSettlementsActions>()(
  (set) => ({
    settlements: OPS_SETTLEMENTS,
    applyReleasePatch: (id, patch) =>
      set((s) => ({
        settlements: s.settlements.map((r) =>
          r.id === id ? { ...r, status: 'Released', ...patch } : r,
        ),
      })),
  }),
);
