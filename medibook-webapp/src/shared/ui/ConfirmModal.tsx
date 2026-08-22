import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

interface ConfirmModalProps {
  open: boolean;
  title?: ReactNode;
  body?: ReactNode;
  confirmLabel?: string;
  /** Render the confirm button in the danger variant (destructive actions). */
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Generic confirm dialog (hospital side, from Flows.jsx) — Cancel + confirm. */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-body-lg text-text-body m-0 leading-[1.6]">{body}</p>
    </Modal>
  );
}
