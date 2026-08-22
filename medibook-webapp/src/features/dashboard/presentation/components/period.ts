/** The four period presets the admin dashboard scales its figures against. */
export const PERIOD_OPTIONS = ['Today', 'Yesterday', 'This Week', 'This Month'] as const;

export type Period = (typeof PERIOD_OPTIONS)[number];

/** Narrow a raw select value back to the closed `Period` set. */
export function isPeriod(value: string): value is Period {
  return (PERIOD_OPTIONS as readonly string[]).includes(value);
}
