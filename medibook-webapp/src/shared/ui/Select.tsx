import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

interface SelectProps {
  value: string;
  options?: readonly string[];
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Control height in px (design default 54; screens pass 40/44/48 — dynamic, hence style). */
  height?: number;
}

export function Select({ value, options = [], onChange, placeholder, height = 54 }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'rounded-input border-border text-body w-full cursor-pointer appearance-none border bg-white pr-11 pl-4',
          value ? 'text-text-strong' : 'text-text-faint',
        )}
        style={{ height }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="text-text-muted pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
        <Icon name="chevron-down" size={20} />
      </span>
    </div>
  );
}
