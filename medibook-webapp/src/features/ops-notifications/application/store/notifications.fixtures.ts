/**
 * Seed data for patient-app notifications — transcribed verbatim from the
 * design prototype's `OpsDB.banners`, `OpsDB.bannerFallback`, `OpsDB.pushes`,
 * `AUDIENCES` and `BAN_TODAY` (Ops.jsx).
 */
import { DEMO_TODAY_ISO } from '@/core/config/demo';
import type {
  Banner,
  BannerFallback,
  PushAudience,
  PushNotification,
} from '@/features/ops-notifications/application/store/notifications.types';

export const OPS_BANNERS: readonly Banner[] = [
  {
    id: 1,
    title: 'Monsoon Health Camp — full-body checkups at 20% off',
    img: null,
    from: '2026-06-10',
    to: '2026-06-24',
    active: true,
  },
  {
    id: 2,
    title: 'Free tele-consult week with top cardiologists',
    img: null,
    from: '2026-06-15',
    to: '2026-06-22',
    active: true,
  },
  {
    id: 3,
    title: 'World Yoga Day — wellness packages near you',
    img: null,
    from: '2026-06-18',
    to: '2026-06-21',
    active: false,
  },
  {
    id: 4,
    title: 'Summer vaccination drive for kids',
    img: null,
    from: '2026-05-20',
    to: '2026-06-05',
    active: true,
  },
];

export const BANNER_FALLBACK: BannerFallback = {
  title: 'Book trusted doctors near you — Medibook',
  img: null,
};

export const OPS_PUSHES: readonly PushNotification[] = [
  {
    id: 1,
    title: '20% off health checkups',
    body: 'This week only — full-body checkups at partner hospitals near you.',
    audience: 'All users',
    when: 'June 11, 2026 · 10:00',
    status: 'Sent',
    delivered: '2,28,400',
    opened: '18%',
  },
  {
    id: 2,
    title: 'Live queue updates are here',
    body: 'Track your token in real time from the home screen.',
    audience: 'Android only',
    when: 'June 08, 2026 · 09:30',
    status: 'Sent',
    delivered: '1,41,050',
    opened: '22%',
  },
  {
    id: 3,
    title: "Father's Day heart camp",
    body: 'Book a cardiology screening for your parents this weekend.',
    audience: 'All users',
    when: 'June 21, 2026 · 09:00',
    status: 'Scheduled',
    delivered: '—',
    opened: '—',
  },
];

/** Audience segment → approximate reach shown in the push composer. */
export const AUDIENCES: Readonly<Record<PushAudience, string>> = {
  'All users': '2,41,300',
  'Android only': '1,48,200',
  'iOS only': '93,100',
  'Inactive 30+ days': '38,400',
};

/** The demo "today" banner scheduling compares against (design `BAN_TODAY`). */
export const BAN_TODAY = DEMO_TODAY_ISO;
