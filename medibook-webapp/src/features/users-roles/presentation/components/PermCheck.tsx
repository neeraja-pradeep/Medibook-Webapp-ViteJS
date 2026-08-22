import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

interface PermCheckProps {
  on: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Permission-grid checkbox cell (design `Rbac.jsx` `Check`): a filled blue box
 * with a tick when on, a hollow bordered box when off, dimmed when locked.
 */
export function PermCheck({ on, disabled, onClick }: PermCheckProps) {
  return (
    <span
      onClick={disabled ? undefined : onClick}
      className={cn(
        'inline-flex size-5.5 items-center justify-center rounded-[6px] text-white',
        on ? 'bg-blue' : 'border-border border-[1.5px] bg-white',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      {on && <Icon name="check" size={14} />}
    </span>
  );
}
