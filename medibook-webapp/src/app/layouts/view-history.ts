/**
 * Visited-view history stack behind each shell's topbar back button — the
 * prototype's `histRef` (`AppShell`/`OpsShell`) as a tiny module. The shells
 * record synchronously during render, exactly like the design, so back
 * availability is correct immediately; the duplicate-guard makes
 * StrictMode's double render a no-op.
 */

export interface VisitedEntry<V extends string> {
  readonly view: V;
  readonly path: string;
}

export interface ViewHistory<V extends string> {
  /** Record the current view + path (same-view revisits update the path). */
  record: (view: V, path: string) => void;
  depth: () => number;
  pop: () => VisitedEntry<V> | undefined;
  /** Forget everything (called on logout so a new session starts clean). */
  clear: () => void;
}

/** Design cap on the visited-view stack. */
const HISTORY_MAX = 24;

export function createViewHistory<V extends string>(): ViewHistory<V> {
  const stack: VisitedEntry<V>[] = [];
  return {
    record: (view, path) => {
      const last = stack[stack.length - 1];
      if (!last || last.view !== view) stack.push({ view, path });
      else if (last.path !== path) stack[stack.length - 1] = { view, path };
      if (stack.length > HISTORY_MAX) stack.shift();
    },
    depth: () => stack.length,
    pop: () => stack.pop(),
    clear: () => {
      stack.length = 0;
    },
  };
}
