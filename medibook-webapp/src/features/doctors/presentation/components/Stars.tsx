import { Icon } from '@/shared/ui/Icon';

interface StarsProps {
  r: number;
  /** Glyph size in px — data-driven, hence forwarded to Icon. */
  size?: number;
}

/** Row of five rating stars, filled up to the rounded rating (design `Stars`). */
export function Stars({ r, size = 14 }: StarsProps) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(r);
        return (
          <Icon
            key={i}
            name="star"
            size={size}
            className={filled ? 'text-y-500' : 'text-grey-400'}
            style={{ fill: filled ? 'var(--color-y-500)' : 'none' }}
          />
        );
      })}
    </span>
  );
}
