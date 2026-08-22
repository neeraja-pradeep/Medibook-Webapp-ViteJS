import type { SortState } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

interface SortThProps {
  label: string;
  /** Base header-cell classes (the prototype's `baseStyle`) — pass `thClass`. */
  baseClassName?: string;
  /** Right-align the column: text right + label/chevron row reversed. */
  right?: boolean;
  /** Column label → sort key; labels without an entry render non-clickable. */
  sortKeys?: Readonly<Record<string, string | undefined>>;
  sort?: SortState;
  onSort?: (key: string) => void;
}

/** Shared clickable sort header cell — used by table shells. */
export function SortTh({ label, baseClassName, right, sortKeys, sort, onSort }: SortThProps) {
  const key = sortKeys?.[label];
  const clickable = Boolean(key && onSort);
  const active = Boolean(sort && key && sort.key === key);
  return (
    <th
      onClick={key && onSort ? () => onSort(key) : undefined}
      className={cn(
        baseClassName,
        right ? 'text-right' : 'text-left',
        clickable ? 'cursor-pointer' : 'cursor-default',
        'select-none',
      )}
    >
      <span className={cn('inline-flex items-center gap-1.25', right && 'flex-row-reverse')}>
        {label}
        {clickable && (
          <Icon
            name={
              active && sort
                ? sort.dir === 'asc'
                  ? 'chevron-up'
                  : 'chevron-down'
                : 'chevrons-up-down'
            }
            size={14}
            className={active ? 'text-text-navy' : 'text-text-faint'}
          />
        )}
      </span>
    </th>
  );
}
