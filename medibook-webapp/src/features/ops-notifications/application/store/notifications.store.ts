import { create } from 'zustand';

import { DEMO_TODAY } from '@/core/config/demo';
import { fmtDate } from '@/shared/lib/format';
import { toast } from '@/shared/ui/toast/toast.store';

import { useLogsStore } from '@/features/ops-logs/application/store/logs.store';

import { AUDIENCES, BANNER_FALLBACK, OPS_BANNERS, OPS_PUSHES } from './notifications.fixtures';
import type { Banner, BannerFallback, PushAudience, PushNotification } from './notifications.types';

/**
 * Patient-app notifications store — home-screen banners (ordered rotation),
 * the always-on default banner, and push notifications (design
 * `OpsDB.banners` / `OpsDB.bannerFallback` / `OpsDB.pushes` + the Ops.jsx
 * OpsNotifications mutations). Every mutation writes its exact compliance
 * log line. Toast split follows the prototype: save-banner and cancel-push
 * toast here; delete-banner and send/schedule-push toasts come from the
 * screen's `useOpsAct` runs.
 */

/** Compliance-log module name for banner/push actions. */
const NOTIFICATIONS_LOG_MODULE = 'Notifications';

/** Banner editor payload (title + optional creative + campaign window). */
export interface BannerDraft {
  readonly title: string;
  readonly img: string | null;
  readonly from: string;
  readonly to: string;
}

/**
 * Which banner a save targets — mirrors the screen's `edit` state:
 * `{ fallback: true }` edits the default banner, `{ bannerId }` edits a
 * campaign banner, `{}` adds a new campaign banner.
 */
export interface BannerSaveTarget {
  readonly fallback?: boolean;
  readonly bannerId?: number;
}

/** Push composer payload for an immediate send. */
export interface PushSendInput {
  readonly title: string;
  readonly body: string;
  readonly audience: PushAudience;
}

/** Push composer payload for a scheduled send (delivered 09:00 that day). */
export interface PushScheduleInput extends PushSendInput {
  readonly date: string;
}

interface NotificationsState {
  banners: readonly Banner[];
  fallback: BannerFallback;
  pushes: readonly PushNotification[];
}

interface NotificationsActions {
  /** Reorder rotation priority — swap the banner at index i with i+dir. */
  move: (i: number, dir: -1 | 1) => void;
  /** Add / edit / edit-default, with the design's exact log line + toast. */
  saveBanner: (target: BannerSaveTarget, f: BannerDraft) => void;
  /** Remove a campaign banner (Warning audit line; toast via the screen). */
  deleteBanner: (id: number) => void;
  /** Pause a banner out of rotation, or resume it, keeping its schedule. */
  togglePause: (id: number) => void;
  /** Queue an immediate push (audit line; toast via the screen's run). */
  sendPush: (input: PushSendInput) => void;
  /** Schedule a push for 09:00 on a date (audit line; toast via the screen). */
  schedulePush: (input: PushScheduleInput) => void;
  /** Cancel a scheduled push before delivery. */
  cancelPush: (id: number) => void;
}

const log = (action: string, sev: 'Info' | 'Warning' = 'Info'): void =>
  useLogsStore.getState().addLog({ action, module: NOTIFICATIONS_LOG_MODULE, sev });

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  (set, get) => ({
    banners: OPS_BANNERS,
    fallback: BANNER_FALLBACK,
    pushes: OPS_PUSHES,

    move: (i, dir) =>
      set((s) => {
        const j = i + dir;
        if (j < 0 || j >= s.banners.length) return s;
        const next = [...s.banners];
        [next[i], next[j]] = [next[j], next[i]];
        return { banners: next };
      }),

    saveBanner: (target, f) => {
      if (target.fallback) {
        set({ fallback: { title: f.title, img: f.img } });
        log('Default app banner updated');
      } else if (target.bannerId != null) {
        set((s) => ({
          banners: s.banners.map((b) => (b.id === target.bannerId ? { ...b, ...f } : b)),
        }));
        log(`App banner updated — ${f.title}`);
      } else {
        set((s) => {
          const id = Math.max(0, ...s.banners.map((b) => b.id)) + 1;
          return {
            banners: [
              ...s.banners,
              { id, title: f.title, img: f.img, from: f.from, to: f.to, active: true },
            ],
          };
        });
        log(`App banner added — ${f.title}`);
      }
      toast(
        target.fallback
          ? 'Default banner saved.'
          : target.bannerId != null
            ? 'Banner updated.'
            : 'Banner added — it goes live on its start date.',
        'success',
      );
    },

    deleteBanner: (id) => {
      const b = get().banners.find((x) => x.id === id);
      if (!b) return;
      log(`App banner deleted — ${b.title}`, 'Warning');
      set((s) => ({ banners: s.banners.filter((x) => x.id !== id) }));
    },

    togglePause: (id) => {
      const b = get().banners.find((x) => x.id === id);
      if (!b) return;
      const nowActive = !b.active;
      set((s) => ({
        banners: s.banners.map((x) => (x.id === id ? { ...x, active: nowActive } : x)),
      }));
      log(`App banner ${nowActive ? 'resumed' : 'paused'} — ${b.title}`);
    },

    sendPush: (input) => {
      const title = input.title.trim();
      set((s) => {
        const id = Math.max(0, ...s.pushes.map((n) => n.id)) + 1;
        const record: PushNotification = {
          id,
          title,
          body: input.body.trim(),
          audience: input.audience,
          when: `${DEMO_TODAY} · Just now`,
          status: 'Queued',
          delivered: AUDIENCES[input.audience],
          opened: '—',
        };
        return { pushes: [record, ...s.pushes] };
      });
      log(`Push notification sent — “${title}” to ${input.audience}`, 'Warning');
    },

    schedulePush: (input) => {
      const title = input.title.trim();
      set((s) => {
        const id = Math.max(0, ...s.pushes.map((n) => n.id)) + 1;
        const record: PushNotification = {
          id,
          title,
          body: input.body.trim(),
          audience: input.audience,
          when: `${fmtDate(input.date)} · 09:00`,
          status: 'Scheduled',
          delivered: '—',
          opened: '—',
        };
        return { pushes: [record, ...s.pushes] };
      });
      log(`Push notification scheduled — “${title}” to ${input.audience}`, 'Warning');
    },

    cancelPush: (id) => {
      const n = get().pushes.find((x) => x.id === id);
      if (!n) return;
      set((s) => ({
        pushes: s.pushes.map((x) => (x.id === id ? { ...x, status: 'Cancelled' } : x)),
      }));
      log(`Scheduled push cancelled — “${n.title}”`);
      toast('Scheduled notification cancelled.', 'info');
    },
  }),
);
