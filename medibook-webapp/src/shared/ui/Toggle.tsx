import { cn } from '@/shared/lib/cn';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

/** 44×24 switch pill with an 18px knob (left 23px on / 3px off). */
export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'relative h-6 w-11 flex-none cursor-pointer rounded-full border-none p-0 transition-colors duration-150',
        value ? 'bg-blue' : 'bg-grey-500',
      )}
    >
      <span
        className={cn(
          'absolute top-0.75 size-4.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[left] duration-150',
          value ? 'left-5.75' : 'left-0.75',
        )}
      />
    </button>
  );
}
