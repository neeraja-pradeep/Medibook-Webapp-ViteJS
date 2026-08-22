/**
 * Seed data for platform settings — transcribed verbatim from the design
 * prototype's `OpsDB.settings` (Ops.jsx).
 */
import type { OpsSettings } from '@/features/ops-settings/application/store/opsSettings.types';

export const OPS_DEFAULT_SETTINGS: OpsSettings = {
  orgName: 'Medibook',
  orgEmail: 'support@medibook.in',
  orgPhone: '1800 220 440',
  payoutSched: 'Weekly',
  commission: '10',
  gst: '27AABCM9407L1ZK',
  notifSettle: true,
  notifCompliance: true,
  notifDigest: false,
  twoFAReq: true,
  sessTimeout: '30 min',
};
