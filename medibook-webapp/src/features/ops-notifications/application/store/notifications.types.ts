/**
 * Patient-app notification view-model types (interim entities for the
 * static-seed phase). Shapes transcribed from the design prototype's
 * `OpsDB.banners`, `OpsDB.bannerFallback`, `OpsDB.pushes` and `AUDIENCES`
 * (Ops.jsx).
 */

/** Home-screen banner in the Medibook patient app. */
export interface Banner {
  readonly id: number;
  readonly title: string;
  /** Uploaded creative as a data URI; null renders the gradient thumb. */
  readonly img: string | null;
  readonly from: string;
  readonly to: string;
  readonly active: boolean;
}

/** Default banner shown when no scheduled banner is live. */
export interface BannerFallback {
  readonly title: string;
  readonly img: string | null;
}

/** Targetable audience segment for a push notification. */
export type PushAudience = 'All users' | 'Android only' | 'iOS only' | 'Inactive 30+ days';

/** Delivery state of a push notification ('Cancelled' via the cancel action). */
export type PushStatus = 'Sent' | 'Scheduled' | 'Queued' | 'Cancelled';

/** One push notification to the Medibook patient app. */
export interface PushNotification {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly audience: PushAudience;
  readonly when: string;
  readonly status: PushStatus;
  readonly delivered: string;
  readonly opened: string;
}
