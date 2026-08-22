import { Icon } from '@/shared/ui/Icon';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Full-width search bar used at the top of list screens. */
export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <div className="border-border text-text-muted flex h-12 w-full items-center gap-3 rounded-lg border bg-white px-4.5">
      <Icon name="search" size={20} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-body-lg text-text-strong flex-1 border-none bg-transparent outline-none"
      />
    </div>
  );
}
