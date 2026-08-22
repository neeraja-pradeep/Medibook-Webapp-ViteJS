import { create } from 'zustand';

import { OPS_REPORTS_GEN } from './opsReports.fixtures';

/**
 * Ops reports store — the last-generated date per report card, index-aligned
 * with `OPS_REPORT_DEFS` (design `OpsDB.reportsGen`). Downloading a report
 * stamps its entry "just now"; the download toast comes from the screen's
 * `useOpsAct` run, as in the prototype.
 */

interface OpsReportsState {
  reportsGen: readonly string[];
}

interface OpsReportsActions {
  /** Stamp report `i` as generated "just now" after a download. */
  markGenerated: (i: number) => void;
}

export const useOpsReportsStore = create<OpsReportsState & OpsReportsActions>()((set) => ({
  reportsGen: OPS_REPORTS_GEN,
  markGenerated: (i) =>
    set((s) => ({ reportsGen: s.reportsGen.map((d, idx) => (idx === i ? 'just now' : d)) })),
}));
