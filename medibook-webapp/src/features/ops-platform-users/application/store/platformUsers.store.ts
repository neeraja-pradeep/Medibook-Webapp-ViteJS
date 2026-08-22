import { create } from 'zustand';

import { useLogsStore } from '@/features/ops-logs/application/store/logs.store';

import { PLATFORM_USERS } from './platformUsers.fixtures';
import type { PlatformUser } from './platformUsers.types';

/**
 * Platform users (patient accounts) store — design `OpsDB.platformUsers` +
 * the Ops.jsx block/unblock and logged detail-view flows. Block/unblock
 * toasts come from the screen's `useOpsAct` run, as in the prototype.
 */

/** Compliance-log module name for patient-account actions. */
const PLATFORM_USERS_LOG_MODULE = 'Platform Users';

interface PlatformUsersState {
  users: readonly PlatformUser[];
}

interface PlatformUsersActions {
  /** Block an active account / unblock a blocked one (+ Critical audit line). */
  toggleBlock: (id: number) => void;
  /** Compliance log written every time a patient account detail is opened. */
  logView: (email: string) => void;
}

export const usePlatformUsersStore = create<PlatformUsersState & PlatformUsersActions>()(
  (set, get) => ({
    users: PLATFORM_USERS,

    toggleBlock: (id) => {
      const u = get().users.find((x) => x.id === id);
      if (!u) return;
      const was = u.status === 'Blocked';
      set((s) => ({
        users: s.users.map((x) => (x.id === id ? { ...x, status: was ? 'Active' : 'Blocked' } : x)),
      }));
      useLogsStore.getState().addLog({
        action: `Patient account ${was ? 'unblocked' : 'blocked'} — ${u.email}`,
        module: PLATFORM_USERS_LOG_MODULE,
        sev: 'Critical',
      });
    },

    logView: (email) =>
      useLogsStore.getState().addLog({
        action: `Patient account viewed — ${email}`,
        module: PLATFORM_USERS_LOG_MODULE,
        sev: 'Info',
      }),
  }),
);
