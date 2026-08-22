import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

interface ClearChipProps {
  tint?: boolean;
}

/** Toolbar "Clear all" filter chip. */
export function ClearChip({ tint = true }: ClearChipProps) {
  return (
    <span
      className={cn(
        'text-body inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2.25',
        tint ? 'bg-blue-soft-bg text-blue' : 'bg-grey-300 text-text-muted',
      )}
    >
      Clear all <Icon name="x" size={14} />
    </span>
  );
}
