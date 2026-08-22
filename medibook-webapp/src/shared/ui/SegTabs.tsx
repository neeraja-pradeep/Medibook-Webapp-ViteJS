import { cn } from '@/shared/lib/cn';

interface SegTabsProps {
  tabs: readonly string[];
  value: string;
  onChange: (tab: string) => void;
}

/** Pill segmented control (used for revenue tabs / period toggles). */
export function SegTabs({ tabs, value, onChange }: SegTabsProps) {
  return (
    <div className="bg-grey-300 inline-flex items-center gap-1.5 rounded-lg p-1">
      {tabs.map((t) => (
        <span
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'text-body cursor-pointer rounded-md px-4 py-2 font-semibold transition-all duration-150',
            value === t ? 'text-text-navy shadow-card bg-white' : 'text-text-muted bg-transparent',
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
