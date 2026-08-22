import { useState } from 'react';

import { toast } from '@/shared/ui/toast/toast.store';

/** How long a fake-latency ops action "runs" before applying (design default). */
const OPS_ACT_DEFAULT_DELAY_MS = 700;

/** Per-key busy flags — `busy.approve`, `busy.release`, … */
export type OpsBusyMap = Readonly<Record<string, boolean>>;

/**
 * Kick off a fake-latency action: marks `key` busy, waits `delay` ms, then
 * runs `apply` and (when `msg` is set) fires a success toast. Re-entrant
 * calls on a busy key are ignored.
 */
export type OpsActRun = (
  key: string,
  msg?: string | null,
  apply?: () => void,
  delay?: number,
) => void;

/**
 * Fake-latency action helper, ported 1:1 from the design file's `useOpsAct`
 * (`Ops.jsx`). Returns `[busy, run]` exactly like the prototype.
 */
export function useOpsAct(): [OpsBusyMap, OpsActRun] {
  const [busy, setBusy] = useState<OpsBusyMap>({});
  const run: OpsActRun = (key, msg, apply, delay = OPS_ACT_DEFAULT_DELAY_MS) => {
    if (busy[key]) return;
    setBusy((b) => ({ ...b, [key]: true }));
    setTimeout(() => {
      setBusy((b) => ({ ...b, [key]: false }));
      if (apply) apply();
      if (msg) toast(msg, 'success');
    }, delay);
  };
  return [busy, run];
}
