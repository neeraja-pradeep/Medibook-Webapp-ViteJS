import { create } from 'zustand';

import { toast } from '@/shared/ui/toast/toast.store';

import { DEFAULT_SETTINGS } from './settings.fixtures';
import type {
  HospitalBank,
  HospitalNotify,
  HospitalRules,
  HospitalSettings,
} from './settings.types';

/**
 * Hospital settings store — the saved (draft-free) settings record. Persisted
 * to localStorage so Save survives reload in the demo, exactly like the
 * prototype (`data.jsx` `loadSettings` / `Actions.saveSettings`).
 */

/** The prototype's localStorage key for saved hospital settings. */
const SETTINGS_STORAGE_KEY = 'mb_settings';

/** Logos above this data-URL length are dropped from persistence (quota guard). */
const LOGO_PERSIST_MAX_CHARS = 400000;

/** Shape of a persisted settings blob — any subset of fields may be present. */
type StoredSettings = Partial<Omit<HospitalSettings, 'rules' | 'notify' | 'bank'>> & {
  readonly rules?: Partial<HospitalRules>;
  readonly notify?: Partial<HospitalNotify>;
  readonly bank?: Partial<HospitalBank>;
};

/** Hydrate saved settings, deep-merging over the defaults (design `loadSettings`). */
function loadSettings(): HospitalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const s = raw ? (JSON.parse(raw) as StoredSettings | null) : null;
    if (!s) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...s,
      rules: { ...DEFAULT_SETTINGS.rules, ...(s.rules ?? {}) },
      notify: { ...DEFAULT_SETTINGS.notify, ...(s.notify ?? {}) },
      bank: { ...DEFAULT_SETTINGS.bank, ...(s.bank ?? {}) },
    };
  } catch {
    // Unreadable/corrupt persisted blob — fall back to the seed defaults.
    return DEFAULT_SETTINGS;
  }
}

interface SettingsState {
  settings: HospitalSettings;
}

interface SettingsActions {
  /** Save + persist (oversized logos are not persisted); toasts on success. */
  saveSettings: (s: HospitalSettings) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()((set) => ({
  settings: loadSettings(),
  saveSettings: (s) => {
    set({ settings: s });
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          ...s,
          logo: s.logo && s.logo.length > LOGO_PERSIST_MAX_CHARS ? null : s.logo,
        }),
      );
    } catch {
      // Persistence is best-effort in the demo (storage full/unavailable).
    }
    toast('Settings saved', 'success');
  },
}));
