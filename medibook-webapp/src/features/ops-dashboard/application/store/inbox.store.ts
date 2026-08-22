import { create } from 'zustand';

import { toast } from '@/shared/ui/toast/toast.store';

import { OPS_ALERTS, OPS_REQUESTS } from './inbox.fixtures';
import type { OpsAlert, OpsRequest } from './inbox.types';

/**
 * Ops inbox store — critical alerts on the dashboard plus the hospital →
 * Medibook request channels (design `OpsDB.alerts` / `OpsDB.requests`).
 * Hospital-side actions (settlement requests, plan changes, support tickets)
 * push into it; ops-side flows close matching requests.
 */

/** New request payload — the id is minted (max+1, replacing `Date.now()`). */
export type OpsRequestDraft = Omit<OpsRequest, 'id'>;

interface InboxState {
  alerts: readonly OpsAlert[];
  requests: readonly OpsRequest[];
}

interface InboxActions {
  /** Dismiss a critical alert ("Resolve Now" on the ops dashboard). */
  resolveAlert: (id: number) => void;
  /** Prepend a hospital request (settlement / plan / support). */
  addRequest: (r: OpsRequestDraft) => void;
  /** Close every Open request the predicate matches. */
  closeRequests: (predicate: (r: OpsRequest) => boolean) => void;
}

export const useInboxStore = create<InboxState & InboxActions>()((set) => ({
  alerts: OPS_ALERTS,
  requests: OPS_REQUESTS,

  resolveAlert: (id) => {
    set((s) => ({ alerts: s.alerts.filter((x) => x.id !== id) }));
    toast('Alert resolved', 'success');
  },

  addRequest: (r) =>
    set((s) => {
      const id = Math.max(0, ...s.requests.map((q) => q.id)) + 1;
      return { requests: [{ ...r, id }, ...s.requests] };
    }),

  closeRequests: (predicate) =>
    set((s) => ({
      requests: s.requests.map((q) =>
        q.status === 'Open' && predicate(q) ? { ...q, status: 'Closed' } : q,
      ),
    })),
}));
