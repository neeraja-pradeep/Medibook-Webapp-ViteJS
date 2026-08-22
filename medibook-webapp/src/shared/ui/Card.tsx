import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface CardProps {
  children?: ReactNode;
  /** Runtime data-driven overrides only — static styling goes in className. */
  style?: CSSProperties;
  /** Padding in px — screens pass varying values (0, 14, 24…), hence style. */
  pad?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Elevate to shadow-pop on hover (prototype's JS boxShadow swap). */
  hover?: boolean;
  className?: string;
}

export function Card({ children, style, pad = 20, onClick, hover, className }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-border shadow-card rounded-xl border bg-white transition-shadow duration-150',
        hover && 'hover:shadow-pop',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}
