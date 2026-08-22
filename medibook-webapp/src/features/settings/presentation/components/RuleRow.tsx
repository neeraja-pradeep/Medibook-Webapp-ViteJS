import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface RuleRowProps {
  label: ReactNode;
  children?: ReactNode;
  /** Drop the bottom divider on the last row of a card. */
  last?: boolean;
}

/** A single label ↔ control row inside a `RuleCard` (design `RuleRow`). */
export function RuleRow({ label, children, last }: RuleRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-3.5',
        !last && 'border-border-soft border-b',
      )}
    >
      <span className="text-body text-text-body">{label}</span>
      {children}
    </div>
  );
}
