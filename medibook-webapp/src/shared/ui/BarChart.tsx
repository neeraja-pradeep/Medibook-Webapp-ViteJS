/** Default bar color — the design's `var(--blue)` accent token. */
const DEFAULT_BAR_COLOR = 'var(--color-blue)';

/** Headroom multiplier above the tallest bar (from the design file). */
const MAX_HEADROOM = 1.15;

export interface BarChartDatum {
  readonly v: number;
  readonly l: string;
  /** Per-bar color from data (CSS color string) — overrides `color`. */
  readonly color?: string;
}

interface BarChartProps {
  data: readonly BarChartDatum[];
  height?: number;
  /** CSS color string for the bars (defaults to the accent blue). */
  color?: string;
  /** Render values as "₹" + en-IN grouped figures. */
  money?: boolean;
}

/** Lightweight vertical bar chart with value labels above each bar. */
export function BarChart({ data, height = 200, color = DEFAULT_BAR_COLOR, money }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.v)) * MAX_HEADROOM || 1;
  return (
    <div className="flex items-end gap-4.5 px-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-caption text-text-muted font-semibold">
            {money ? '₹' + d.v.toLocaleString('en-IN') : d.v}
          </span>
          <div
            /* Chart geometry + per-bar data color — sanctioned style usage. */
            style={{
              width: '78%',
              maxWidth: 46,
              height: `${(d.v / max) * 100}%`,
              background: d.color ?? color,
              borderRadius: '6px 6px 0 0',
              minHeight: 4,
              transition: 'height .3s',
            }}
          ></div>
          <span className="text-caption text-text-muted whitespace-nowrap">{d.l}</span>
        </div>
      ))}
    </div>
  );
}
