import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/cn';

import { ICONS, type IconName } from './icon-registry';

interface IconProps {
  name: IconName;
  /** Square box + glyph size in px (dynamic, data-driven — hence style). */
  size?: number;
  /** Runtime color override (data-driven, e.g. per-department accents). */
  color?: string;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}

/**
 * Lucide glyph in an inline-flex box, exactly like the design file's Icon —
 * the wrapper keeps glyphs baseline-free so rows center pixel-identically.
 */
export function Icon({ name, size = 20, color, className, style, strokeWidth }: IconProps) {
  const Glyph = ICONS[name];
  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: size, height: size, color, ...style }}
    >
      <Glyph size={size} strokeWidth={strokeWidth} className="block" />
    </span>
  );
}
