/**
 * Seed data for the ops inbox — transcribed verbatim from the design
 * prototype's `OpsDB.alerts` / `OpsDB.requests` (Ops.jsx). `hid` is
 * materialized from the prototype's `OPS_NAME_TO_ID` back-fill.
 */
import type { OpsAlert, OpsRequest } from '@/features/ops-dashboard/application/store/inbox.types';

export const OPS_ALERTS: readonly OpsAlert[] = [
  {
    id: 1,
    sev: 'danger',
    title: 'Settlement failure — Lotus Heart Institute',
    sub: 'UPI payout bounced twice · 12 min ago',
    go: 'settlements',
  },
  {
    id: 2,
    sev: 'warning',
    title: 'Plan limit reached — Kaveri General',
    sub: 'Booking quota at 98% of Starter plan · 1 hr ago',
    go: 'hospital:3',
  },
  {
    id: 3,
    sev: 'danger',
    title: 'Compliance log gap — Nirmal Ortho',
    sub: 'No audit entries for 48 hrs · 3 hrs ago',
    go: 'logs',
  },
];

export const OPS_REQUESTS: readonly OpsRequest[] = [
  {
    id: 1,
    type: 'Support',
    hid: 1,
    hospital: 'Sunrise Multispeciality',
    subject: 'Support ticket — unable to update doctor schedule',
    detail: '',
    on: 'June 12, 2026',
    status: 'Open',
  },
];
