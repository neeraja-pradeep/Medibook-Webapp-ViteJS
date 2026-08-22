import { useState } from 'react';

/** Sortable cell value an accessor may produce (nulls sort last). */
export type SortValue = string | number | null | undefined;

/** One accessor per sortable column key, mapping a row to its sort value. */
export type SortAccessors<T> = Readonly<Record<string, (row: T) => SortValue>>;

export type SortDir = 'asc' | 'desc';

export interface SortState {
  readonly key: string | null;
  readonly dir: SortDir;
}

export interface UseSortResult<T> {
  sort: SortState;
  onSort: (key: string) => void;
  sorted: (rows: T[], accessors?: SortAccessors<T>) => T[];
}

/**
 * Table sort hook, ported 1:1 from the design file's `useSort` (`ui.jsx`):
 * clicking a header toggles asc/desc on the same key and resets to asc on a
 * new key. `sorted(rows, accessors)` returns rows unchanged until a sort key
 * with an accessor is active; numbers compare numerically, everything else
 * via numeric-aware, case-insensitive `localeCompare`, nulls last.
 */
export function useSort<T>(initial?: SortState): UseSortResult<T> {
  const [sort, setSort] = useState<SortState>(initial ?? { key: null, dir: 'asc' });

  const onSort = (key: string): void =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );

  const sorted = (rows: T[], accessors?: SortAccessors<T>): T[] => {
    if (!sort.key || !accessors) return rows;
    const acc = accessors[sort.key];
    if (!acc) return rows;
    const out = [...rows].sort((a, b) => {
      const va = acc(a);
      const vb = acc(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      return String(va).localeCompare(String(vb), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
    return sort.dir === 'desc' ? out.reverse() : out;
  };

  return { sort, onSort, sorted };
}
