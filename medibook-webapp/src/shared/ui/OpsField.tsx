import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/Icon';

interface OpsFieldProps {
  label: ReactNode;
  /** Inline validation error shown under the control with a warning glyph. */
  error?: string | null;
  children?: ReactNode;
  required?: boolean;
}

/** Ops form field — label (+ required star) with an inline validation error line. */
export function OpsField({ label, error, children, required }: OpsFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-ui text-label text-text-strong">
        {label}
        {required && <span className="text-d-500"> *</span>}
      </label>
      {children}
      {error && (
        <span className="text-caption text-d-500 flex items-center gap-1.5">
          <Icon name="triangle-alert" size={13} /> {error}
        </span>
      )}
    </div>
  );
}
