import type { ReactNode } from 'react';

import type { SortState } from '@/shared/hooks/useSort';
import { SortTh } from '@/shared/ui/SortTh';

/**
 * Shared table cell classes — the prototype's `thBase` / `tdBase` translated
 * to tokens. Vertical padding comes from the global 22px "Comfy" density rule
 * on all `td`/`th` (`src/index.css`) — never add per-cell `py-*`.
 */
export const thClass =
  'bg-bg-tint text-text-navy text-body font-semibold px-3.5 text-left border-b border-border-soft whitespace-nowrap';
export const tdClass = 'px-3.5 border-b border-border-soft text-body text-text-body align-middle';

interface TableShellProps {
  columns: readonly string[];
  /** Columns to right-align (label + sort chevron flipped). */
  rightCols?: readonly string[];
  /** Column label → sort key, wiring headers to `useSort`. */
  sortKeys?: Readonly<Record<string, string | undefined>>;
  sort?: SortState;
  onSort?: (key: string) => void;
  children?: ReactNode;
}

/** Bordered, rounded table wrapper with a SortTh header row per column. */
export function TableShell({
  columns,
  children,
  rightCols = [],
  sortKeys,
  sort,
  onSort,
}: TableShellProps) {
  return (
    <div className="border-border-soft overflow-hidden rounded-md border">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <SortTh
                key={c}
                label={c}
                baseClassName={thClass}
                right={rightCols.includes(c)}
                sortKeys={sortKeys}
                sort={sort}
                onSort={onSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
