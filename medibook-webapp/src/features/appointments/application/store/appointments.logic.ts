import type { IconName } from '@/shared/ui/icon-registry';

import type { Appointment } from './appointments.types';

/** Button variant the primary action renders with (subset of shared Button). */
export type PrimaryActionVariant = 'primary' | 'secondary' | 'ghost';

/** The one action an appointment row/card offers in its current state. */
export interface PrimaryAction {
  readonly key: 'receipt' | 'queue' | 'pay' | 'checkin';
  readonly label: string;
  readonly icon: IconName;
  readonly variant: PrimaryActionVariant;
}

/**
 * The primary action available for an appointment given its state — pure
 * helper ported 1:1 from the design prototype (`data.jsx` `primaryAction`).
 */
export function primaryAction(a: Appointment): PrimaryAction | null {
  if (a.status === 'Cancelled' || a.status === 'No-show') return null;
  if (a.status === 'Completed')
    return { key: 'receipt', label: 'Receipt', icon: 'receipt', variant: 'secondary' };
  if (a.status === 'In Queue')
    return { key: 'queue', label: 'In Queue', icon: 'ticket', variant: 'ghost' };
  if (a.source === 'Walk-in' && a.payment === 'Pending')
    return { key: 'pay', label: 'Mark Payment', icon: 'indian-rupee', variant: 'primary' };
  // paid (online) or walk-in already paid, not yet in queue
  return {
    key: 'checkin',
    label: a.source === 'Online' ? 'Check In' : 'Issue Token',
    icon: 'log-in',
    variant: 'primary',
  };
}
