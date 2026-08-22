import { cn } from '@/shared/lib/cn';

interface TabsProps {
  tabs: readonly string[];
  value: string;
  onChange: (tab: string) => void;
  /** Gap between tab labels in px (design default 28 — dynamic, hence style). */
  gap?: number;
}

/** Underline tab group. */
export function Tabs({ tabs, value, onChange, gap = 28 }: TabsProps) {
  return (
    <div className="flex pr-2" style={{ gap }}>
      {tabs.map((t) => (
        <span
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'text-body cursor-pointer border-b-2 pb-1',
            value === t
              ? 'border-text-navy text-text-navy font-semibold'
              : 'text-text-muted border-transparent',
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
