import { create } from 'zustand';

import { APOLLO_HID, DEMO_TODAY, DEMO_TODAY_ISO } from '@/core/config/demo';
import { toast } from '@/shared/ui/toast/toast.store';

import { useInboxStore } from '@/features/ops-dashboard/application/store/inbox.store';
import { useHospitalsStore } from '@/features/ops-hospitals/application/store/hospitals.store';
import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import { useSettingsStore } from '@/features/settings/application/store/settings.store';

import { SEED_SETTLEMENTS } from './settlements.fixtures';
import type { Settlement } from './settlements.types';

/**
 * Hospital-side settlement ledger (design `Store.settlements` +
 * `Actions.settleMarkReceived/settleRelease/settleRequest/requestPlanChange/
 * raiseTicket`). This IS the shared ledger: the ops console's release flow
 * writes Apollo rows here via `settleRelease`, and hospital requests land in
 * the ops inbox — the live cross-app link.
 */

/** This tenant's display name on cross-app records (design literal). */
const APOLLO_NAME = 'Apollo Hospital';

/** Fields a release/lifecycle patch may write onto a statement. */
export type SettlementReleasePatch = Partial<Omit<Settlement, 'id' | 'hid'>>;

/** The hospital's pending plan-change request banner (design `planChangeReq`). */
export interface PlanChangeReq {
  readonly to: string;
  readonly on: string;
}

/** Which request the hospital raises for a statement (design `settleRequest`). */
export type SettleRequestKind = 'raise' | 'request';

interface SettlementsState {
  settlements: readonly Settlement[];
  planChangeReq: PlanChangeReq | null;
}

interface SettlementsActions {
  /** Confirm a released transfer reached the hospital's account. */
  settleMarkReceived: (id: string) => void;
  /** Ops-side release of an Apollo statement (shared ledger — both apps see it). */
  settleRelease: (id: string, patch: SettlementReleasePatch) => void;
  /** Ask Medibook to release ('request') or chase an overdue transfer ('raise'). */
  settleRequest: (id: string, kind: SettleRequestKind) => void;
  /** Request a plan change — lands in the ops plan queue + inbox. */
  requestPlanChange: (toPlan: string) => void;
  /** Clear the pending plan-change banner (ops applies/declines the change). */
  clearPlanChangeReq: () => void;
  /** Raise a support ticket with Medibook (lands in the ops inbox). */
  raiseTicket: (subject: string, detail?: string) => void;
}

export const useSettlementsStore = create<SettlementsState & SettlementsActions>()((set) => ({
  settlements: SEED_SETTLEMENTS,
  planChangeReq: null,

  settleMarkReceived: (id) => {
    set((s) => ({
      settlements: s.settlements.map((r) =>
        r.id === id ? { ...r, status: 'Received', receivedOn: DEMO_TODAY_ISO } : r,
      ),
    }));
    toast('Marked as received', 'success');
  },

  settleRelease: (id, patch) =>
    set((s) => ({
      settlements: s.settlements.map((r) =>
        r.id === id ? { ...r, status: 'Released', ...patch } : r,
      ),
    })),

  settleRequest: (id, kind) => {
    set((s) => ({
      settlements: s.settlements.map((r) =>
        r.id === id ? { ...r, requested: true, requestedOn: DEMO_TODAY } : r,
      ),
    }));
    useInboxStore.getState().addRequest({
      type: 'Settlement',
      hid: APOLLO_HID,
      hospital: APOLLO_NAME,
      subject:
        (kind === 'raise' ? 'Overdue settlement follow-up — ' : 'Settlement release requested — ') +
        id,
      detail: id,
      on: DEMO_TODAY,
      status: 'Open',
    });
    toast(
      kind === 'raise'
        ? 'Follow-up raised with Medibook for the overdue transfer'
        : 'Settlement requested from Medibook',
      'success',
    );
  },

  requestPlanChange: (toPlan) => {
    set({ planChangeReq: { to: toPlan, on: DEMO_TODAY } });
    const apollo = useHospitalsStore.getState().hospitals.find((h) => h.id === APOLLO_HID);
    usePlansStore.getState().addPlanChange({
      hid: APOLLO_HID,
      hospital: APOLLO_NAME,
      email: useSettingsStore.getState().settings.email,
      change: `${apollo ? apollo.plan : 'Growth'} → ${toPlan}`,
      requested: DEMO_TODAY,
      status: 'Pending',
    });
    useInboxStore.getState().addRequest({
      type: 'Plan',
      hid: APOLLO_HID,
      hospital: APOLLO_NAME,
      subject: `Plan change requested — ${toPlan}`,
      on: DEMO_TODAY,
      status: 'Open',
    });
    toast('Plan change request sent to Medibook', 'success');
  },

  clearPlanChangeReq: () => set({ planChangeReq: null }),

  raiseTicket: (subject, detail) => {
    useInboxStore.getState().addRequest({
      type: 'Support',
      hid: APOLLO_HID,
      hospital: APOLLO_NAME,
      subject,
      detail: detail ?? '',
      on: DEMO_TODAY,
      status: 'Open',
    });
    toast('Ticket raised with Medibook support', 'success');
  },
}));
