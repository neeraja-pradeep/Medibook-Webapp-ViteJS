import { Card } from '@/shared/ui/Card';

interface BlockProps {
  /** Width in px or a % string — per-block geometry, hence style. */
  w: number | string;
  /** Height in px. */
  h: number;
}

/** Shimmer block — the prototype's local `blk(w, h)` helper as a component. */
function Block({ w, h }: BlockProps) {
  return (
    <div
      className="animate-skeleton-pulse bg-grey-300 rounded-[6px]"
      style={{ width: w, height: h }}
    />
  );
}

/** Ops screen-load skeleton: KPI cards + toolbar + table shimmer. */
export function OpsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} pad={18} className="flex-1">
            <div className="flex flex-col gap-3">
              <Block w="42%" h={12} />
              <Block w="58%" h={26} />
              <Block w="66%" h={10} />
            </div>
          </Card>
        ))}
      </div>
      <Card pad={16} className="flex items-center gap-3">
        <Block w={300} h={42} />
        <Block w={150} h={42} />
        <div className="flex-1" />
        <Block w={170} h={42} />
      </Card>
      <Card>
        <div className="bg-bg-tint mb-3 h-11 rounded-md opacity-60" />
        <div className="flex flex-col gap-3.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Block w="26%" h={14} />
              <Block w="14%" h={12} />
              <Block w="14%" h={12} />
              <Block w="12%" h={12} />
              <Block w="12%" h={12} />
              <Block w="8%" h={12} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
