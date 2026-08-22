import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * Labelled auth input with an optional trailing adornment (the password
 * show/hide eye), ported 1:1 from the design `Auth.jsx` `AuthField`.
 */
interface AuthFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  /** Trailing adornment rendered inside the field (e.g. the eye toggle). */
  trailing?: ReactNode;
}

export function AuthField({ label, value, onChange, placeholder, type, trailing }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label font-ui text-text-navy">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type ?? 'text'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'text-body border-border-input bg-bg-subtle text-text-navy h-14 w-full rounded-sm border',
            trailing ? 'pr-12 pl-4' : 'px-4',
          )}
        />
        {trailing && (
          <span className="text-text-muted absolute right-4 flex cursor-pointer">{trailing}</span>
        )}
      </div>
    </div>
  );
}
