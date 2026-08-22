import type { CSSProperties, ReactNode } from 'react';

interface RupeeProps {
  children?: ReactNode;
  /** Runtime data-driven overrides only — static styling goes in className. */
  style?: CSSProperties;
  className?: string;
}

/** Inline ₹ rupee glyph (kept as text — Poppins renders it well). */
export function Rupee({ children, style, className }: RupeeProps) {
  return (
    <span className={className} style={style}>
      ₹ {children}
    </span>
  );
}
