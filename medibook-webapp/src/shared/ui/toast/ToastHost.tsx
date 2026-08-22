import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';

import { useToastStore, type ToastType } from './toast.store';

/** Pill tint + glyph per toast type (the prototype's `tints` map). */
const TOAST_TINTS: Record<ToastType, { bg: string; icon: IconName }> = {
  success: { bg: 'bg-g-600', icon: 'check' },
  info: { bg: 'bg-blue', icon: 'info' },
  error: { bg: 'bg-d-500', icon: 'triangle-alert' },
};

/** Global toast host — fixed bottom-center pill stack, rendered once per shell. */
export function ToastHost() {
  const items = useToastStore((s) => s.items);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-9999 flex -translate-x-1/2 flex-col items-center gap-2.5">
      {items.map((t) => {
        const s = TOAST_TINTS[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'animate-toast-in text-body shadow-pop flex items-center gap-2.5 rounded-full px-4.5 py-2.75 font-medium text-white',
              s.bg,
            )}
          >
            <Icon name={s.icon} size={17} /> {t.msg}
          </div>
        );
      })}
    </div>
  );
}
