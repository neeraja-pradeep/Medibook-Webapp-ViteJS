import type { ReactNode } from 'react';

export interface DonutDatum {
  readonly v: number;
  /** Segment color from data (CSS color string). */
  readonly color: string;
}

interface DonutProps {
  data: readonly DonutDatum[];
  size?: number;
  thickness?: number;
  /** Content rendered in the donut hole. */
  center?: ReactNode;
}

/** Donut chart drawn with stroke-dashed circles, rotated to start at 12 o'clock. */
export function Donut({ data, size = 168, thickness = 26, center }: DonutProps) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  // Prefix-sum arc offsets so each segment starts where the previous ended
  // (the prototype accumulated this inline while mapping).
  const offsets: number[] = [];
  let acc = 0;
  for (const d of data) {
    offsets.push(acc);
    acc += (d.v / total) * C;
  }
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-grey-300"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const len = (d.v / total) * C;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-(offsets[i] ?? 0)}
            />
          );
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
      )}
    </div>
  );
}
