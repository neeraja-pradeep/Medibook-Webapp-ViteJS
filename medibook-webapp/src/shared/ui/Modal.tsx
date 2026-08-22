import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/Icon';
import { SectionTitle } from '@/shared/ui/SectionTitle';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Panel width in px — varies per call site (440/560/720…), hence style. */
  width?: number;
  footer?: ReactNode;
}

/**
 * Centered modal with scrim. The prototype positioned this absolutely inside
 * its windowed stage — ported as a fixed full-viewport overlay (same visual
 * at 100% zoom).
 */
export function Modal({ open, onClose, title, children, width = 560, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="animate-fade-in bg-text-strong/45 fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in shadow-pop max-h-full max-w-full overflow-y-auto rounded-xl bg-white"
        style={{ width }}
      >
        <div className="border-border-soft flex items-center justify-between border-b px-6 py-5">
          <SectionTitle>{title}</SectionTitle>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-text-muted flex cursor-pointer"
          >
            <Icon name="x" size={22} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 pb-6">{footer}</div>}
      </div>
    </div>
  );
}
