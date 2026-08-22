import type { MouseEventHandler } from 'react';

import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';

interface IconBtnProps {
  name: IconName;
  /** Per-item glyph color from data (e.g. danger red on destructive rows). */
  color?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  size?: number;
  /** Square box edge in px — data-driven, hence style. */
  box?: number;
}

/** Square icon-only button (table actions, toolbars). */
export function IconBtn({ name, color, onClick, title, size = 18, box = 44 }: IconBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="border-border text-text-muted hover:bg-grey-200 inline-flex flex-none cursor-pointer items-center justify-center rounded-md border bg-white transition-colors duration-150"
      style={{ width: box, height: box, color }}
    >
      <Icon name={name} size={size} />
    </button>
  );
}
