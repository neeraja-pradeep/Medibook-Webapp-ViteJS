import { useEffect, useState } from 'react';

import type { WeekDay } from '@/features/doctors/application/store/catalog.types';
import { InfoDot } from '@/shared/ui/InfoDot';
import { Select } from '@/shared/ui/Select';
import { Toggle } from '@/shared/ui/Toggle';

/** Bookable-time options offered per day (design `TIME_OPTS`). */
const TIME_OPTS = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '8:00 pm',
] as const;

interface WeeklyHoursProps {
  week: readonly WeekDay[];
  info?: string;
}

/**
 * Per-day working-hours editor (design `WeeklyHours`). Keeps its own local
 * copy of the grid — like the prototype it does not report edits upward.
 */
export function WeeklyHours({ week, info }: WeeklyHoursProps) {
  const [w, setW] = useState<readonly WeekDay[]>(week);
  useEffect(() => setW(week), [week]);
  const set = (i: number, patch: Partial<WeekDay>) =>
    setW((xs) => xs.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-body text-text-strong font-medium">Working Hours</span>
        {info && <InfoDot text={info} />}
      </div>
      <div className="flex flex-col gap-2">
        {w.map((d, i) => (
          <div
            key={d.day}
            className="border-border-soft flex items-center gap-3 rounded-md border px-3 py-2"
          >
            <span className="text-body text-text-strong w-9.5 font-medium">{d.day}</span>
            <Toggle value={d.on} onChange={(v) => set(i, { on: v })} />
            {d.on ? (
              <div className="ml-auto flex items-center gap-2">
                <div className="w-27.5">
                  <Select
                    value={d.from}
                    options={TIME_OPTS}
                    onChange={(v) => set(i, { from: v })}
                    height={40}
                  />
                </div>
                <span className="text-text-faint">–</span>
                <div className="w-27.5">
                  <Select
                    value={d.to}
                    options={TIME_OPTS}
                    onChange={(v) => set(i, { to: v })}
                    height={40}
                  />
                </div>
              </div>
            ) : (
              <span className="text-body text-text-faint ml-auto">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
