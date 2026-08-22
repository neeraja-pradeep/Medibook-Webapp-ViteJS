import { Icon } from '@/shared/ui/Icon';

interface FilterSelectProps {
  value: string;
  options: readonly string[];
  onChange?: (value: string) => void;
}

/** Small filter dropdown used in toolbars (compact). */
export function FilterSelect({ value, options, onChange }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-input border-border text-body text-text-body h-11 cursor-pointer appearance-none border bg-white pr-10 pl-4"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="text-text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
        <Icon name="chevron-down" size={18} />
      </span>
    </div>
  );
}
