import { useId } from 'react';

/** Default line color — the design's `var(--blue)` accent token. */
const DEFAULT_LINE_COLOR = 'var(--color-blue)';

/** Fixed viewBox width + inner padding (from the design file). */
const VIEW_W = 640;
const VIEW_PAD = 28;

/** Headroom multiplier above the highest point (from the design file). */
const MAX_HEADROOM = 1.1;

export interface LineChartDatum {
  readonly v: number;
  readonly l: string;
}

interface LineChartProps {
  data: readonly LineChartDatum[];
  height?: number;
  /** CSS color string for line, points and gradient fill. */
  color?: string;
  /** Accepted for prop-shape parity with the prototype — it never reads it. */
  money?: boolean;
}

/** SVG line/area chart with gridlines, point markers and x-axis labels. */
export function LineChart({ data, height = 220, color = DEFAULT_LINE_COLOR }: LineChartProps) {
  // The prototype's fixed gradient id "lcg" breaks with multiple charts.
  const gradientId = useId();
  const W = VIEW_W;
  const H = height;
  const pad = VIEW_PAD;
  const max = Math.max(...data.map((d) => d.v)) * MAX_HEADROOM || 1;
  const min = 0;
  const denom = Math.max(1, data.length - 1);
  const x = (i: number): number => pad + (i / denom) * (W - pad * 2);
  const y = (v: number): number => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const pts = data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ');
  const area = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={pad + g * (H - pad * 2)}
          y2={pad + g * (H - pad * 2)}
          className="stroke-border-soft"
          strokeWidth="1"
        />
      ))}
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(d.v)}
          r="3.5"
          className="fill-white"
          stroke={color}
          strokeWidth="2"
        />
      ))}
      {data.map((d, i) => (
        <text
          key={'t' + i}
          x={x(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="11"
          className="fill-text-muted font-sans"
        >
          {d.l}
        </text>
      ))}
    </svg>
  );
}
