import { useEffect, useState } from 'react';

/**
 * A "current time" value that refreshes on an interval, so components can show
 * live elapsed timers by reading state (pure) instead of calling `Date.now()`
 * during render. Returns the timestamp captured at mount, then re-renders
 * every `intervalMs` with a fresh one.
 */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
