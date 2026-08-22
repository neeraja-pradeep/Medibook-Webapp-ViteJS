import { create } from 'zustand';

import { useLogsStore } from '@/features/ops-logs/application/store/logs.store';

import { OPS_DEFAULT_SETTINGS } from './opsSettings.fixtures';
import type { OpsSettings } from './opsSettings.types';

/**
 * Platform settings store (design `OpsDB.settings` + the Ops.jsx OpsSettings
 * save flow). Saving replaces the whole record and writes the design's audit
 * line; the "Settings saved." toast comes from the screen's `useOpsAct` run.
 */

interface OpsSettingsState {
  settings: OpsSettings;
}

interface OpsSettingsActions {
  /** Persist the edited settings (+ "Settings updated" audit line). */
  save: (next: OpsSettings) => void;
}

export const useOpsSettingsStore = create<OpsSettingsState & OpsSettingsActions>()((set) => ({
  settings: OPS_DEFAULT_SETTINGS,
  save: (next) => {
    set({ settings: { ...next } });
    useLogsStore.getState().addLog({
      action: 'Settings updated — platform preferences',
      module: 'Settings',
      sev: 'Info',
    });
  },
}));
