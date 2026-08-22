import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { STATUS } from '@/shared/ui/status-map';

interface BadgeProps {
  status?: string;
  /** Overrides the displayed label (prototype: `children || status`). */
  children?: ReactNode;
  className?: string;
  /** Runtime data-driven overrides only — static styling goes in className. */
  style?: CSSProperties;
}

/** Widened view for safe lookup of statuses outside the known map. */
const STATUS_LOOKUP: Record<string, { bg: string; fg: string } | undefined> = STATUS;

/** Status pill; unknown statuses fall back to Scheduled styling. */
export function Badge({ status, children, className, style }: BadgeProps) {
  const label = children || status;
  const s = STATUS_LOOKUP[status ?? ''] ?? STATUS.Scheduled;
  return (
    <span
      className={cn(
        'text-badge inline-flex items-center rounded-full px-3.5 py-1 font-semibold whitespace-nowrap',
        s.bg,
        s.fg,
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );
}
