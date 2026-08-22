import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';

interface TextInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Control height in px (design default 54; modals pass 48 — dynamic, hence style). */
  height?: number;
  type?: string;
  /** Optional leading glyph (e.g. "search"). */
  icon?: IconName;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  height = 54,
  type,
  icon,
}: TextInputProps) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="text-text-muted absolute left-4 flex">
          <Icon name={icon} size={18} />
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        type={type ?? 'text'}
        className={cn(
          'rounded-input border-border text-body text-text-strong w-full border bg-white',
          icon ? 'pr-4 pl-11' : 'px-4',
        )}
        style={{ height }}
      />
    </div>
  );
}
