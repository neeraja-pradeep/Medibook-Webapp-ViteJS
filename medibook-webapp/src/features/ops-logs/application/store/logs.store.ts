import { create } from 'zustand';

import { OPS_LOGS } from './logs.fixtures';
import type { LogEntry, LogSeverity } from './logs.types';

/**
 * Compliance-log store — the platform audit trail many features' actions
 * append to (design `OpsDB.logs`). New entries are prepended with the
 * prototype's fixed demo actor/IP and a "Just now" timestamp; ids come from
 * a max+1 counter instead of the prototype's `Date.now()`.
 */

/** The demo operations actor every prototype log write used. */
const DEMO_LOG_ACTOR = 'riya.sharma@medibook.in';

/** The demo console IP every prototype log write used. */
const DEMO_LOG_IP = '10.42.8.11';

/** New audit entry — actor/ip/time default to the prototype's demo values. */
export interface LogEntryDraft {
  readonly hid?: number;
  readonly action: string;
  readonly module: string;
  readonly sev: LogSeverity;
  readonly actor?: string;
  readonly ip?: string;
  readonly time?: string;
}

interface LogsState {
  logs: readonly LogEntry[];
}

interface LogsActions {
  /** Prepend an audit entry (id minted, time "Just now" unless given). */
  addLog: (entry: LogEntryDraft) => void;
}

export const useLogsStore = create<LogsState & LogsActions>()((set) => ({
  logs: OPS_LOGS,
  addLog: (entry) =>
    set((s) => {
      const id = Math.max(0, ...s.logs.map((l) => l.id)) + 1;
      const record: LogEntry = {
        id,
        ...(entry.hid != null ? { hid: entry.hid } : {}),
        action: entry.action,
        actor: entry.actor ?? DEMO_LOG_ACTOR,
        module: entry.module,
        ip: entry.ip ?? DEMO_LOG_IP,
        time: entry.time ?? 'Just now',
        sev: entry.sev,
      };
      return { logs: [record, ...s.logs] };
    }),
}));
