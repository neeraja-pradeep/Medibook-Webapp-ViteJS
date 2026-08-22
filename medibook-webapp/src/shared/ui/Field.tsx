import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface FieldProps {
  label: ReactNode;
  children?: ReactNode;
  required?: boolean;
  /** Layout passthrough for the design's `style` cases (e.g. `col-span-full` for gridColumn "1 / -1"). */
  className?: string;
}

/** White in-app form field (label + select/input). */
export function Field({ label, children, required, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="font-ui text-label text-text-strong">
        {label}
        {required && <span className="text-d-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
