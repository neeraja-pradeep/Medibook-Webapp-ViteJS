import { useState } from 'react';

interface InfoDotProps {
  text: string;
  /** Size driver in px: dot box = size + 5, glyph = size − 4 (dynamic, hence style). */
  size?: number;
}

/**
 * Small 'i' info dot with hover tooltip — explains why a field/data matters
 * (e.g. mobile-app impact).
 */
export function InfoDot({ text, size = 15 }: InfoDotProps) {
  const [hover, setHover] = useState(false);
  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="border-text-faint text-text-muted inline-flex flex-none cursor-help items-center justify-center rounded-full border-[1.5px] leading-normal font-semibold"
        style={{ width: size + 5, height: size + 5, fontSize: size - 4 }}
      >
        i
      </span>
      {hover && (
        <span className="bg-text-strong text-caption shadow-pop absolute bottom-full left-1/2 z-80 mb-2 w-57.5 -translate-x-1/2 rounded-md px-3 py-2.25 text-left font-normal text-white">
          {text}
          <span className="border-t-text-strong absolute top-full left-1/2 -translate-x-1/2 border-x-6 border-t-6 border-x-transparent"></span>
        </span>
      )}
    </span>
  );
}
