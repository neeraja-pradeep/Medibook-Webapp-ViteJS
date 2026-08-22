/**
 * Seed data for ops reports — the six report definitions and their
 * last-generated dates, transcribed verbatim from the design prototype
 * (`OpsReports` defs + `OpsDB.reportsGen` in Ops.jsx).
 */
import type { IconName } from '@/shared/ui/icon-registry';

/**
 * Accent tint of a report card's icon box — literal keys of the shared
 * `OPS_TINTS` map (`@/shared/ui/OpsConfirm`).
 */
export type OpsReportTint = 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/** One downloadable platform report definition. */
export interface OpsReportDef {
  readonly name: string;
  readonly desc: string;
  readonly icon: IconName;
  readonly tint: OpsReportTint;
}

export const OPS_REPORT_DEFS: readonly OpsReportDef[] = [
  {
    name: 'Revenue Report',
    desc: 'Platform revenue by hospital, plan and period.',
    icon: 'indian-rupee',
    tint: 'success',
  },
  {
    name: 'Bookings Report',
    desc: 'All bookings with department and outcome detail.',
    icon: 'calendar-check',
    tint: 'primary',
  },
  {
    name: 'Onboarding Report',
    desc: 'Hospital onboarding funnel and KYC status.',
    icon: 'building-2',
    tint: 'info',
  },
  {
    name: 'Settlement Statement',
    desc: 'Payout history with commission breakdown.',
    icon: 'landmark',
    tint: 'warning',
  },
  {
    name: 'Compliance Audit',
    desc: 'Full audit trail of sensitive platform actions.',
    icon: 'scroll-text',
    tint: 'danger',
  },
  {
    name: 'Platform Users Report',
    desc: 'Registered end users, activity and growth.',
    icon: 'users',
    tint: 'neutral',
  },
];

/**
 * Last-generated date per report, index-aligned with `OPS_REPORT_DEFS`
 * (design `OpsDB.reportsGen` — entries become "just now" after a download).
 */
export const OPS_REPORTS_GEN: readonly string[] = [
  'June 12, 2026',
  'June 12, 2026',
  'June 09, 2026',
  'June 09, 2026',
  'June 06, 2026',
  'June 04, 2026',
];
