import { useEffect, useState } from 'react';

import { money } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { Toggle } from '@/shared/ui/Toggle';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import type { Appointment } from '@/features/appointments/application/store/appointments.types';

const CANCEL_REASONS = [
  'Patient request',
  'Doctor unavailable',
  'Duplicate booking',
  'Scheduling error',
  'Other',
];

interface CancelApptModalProps {
  appt: Appointment | null;
  onClose: () => void;
}

/** Cancel with optional reason + refund context (design `Flows.jsx` `CancelApptModal`). */
export function CancelApptModal({ appt, onClose }: CancelApptModalProps) {
  const cancel = useAppointmentsStore((s) => s.cancel);
  const [reason, setReason] = useState('');
  const [refund, setRefund] = useState(true);
  useEffect(() => {
    if (appt) {
      setReason('');
      setRefund(true);
    }
  }, [appt?.id]);
  if (!appt) return null;
  const deskPaid = appt.source === 'Walk-in' && appt.payment === 'Paid';
  const refundNote =
    appt.source === 'Online'
      ? 'Prepaid online — Medibook processes any refund to the patient per its slab policy (little or none on the day of the visit, near-full if cancelled well in advance).'
      : appt.payment === 'Paid'
        ? 'Payment was collected at the desk. Handle any refund directly with the patient.'
        : 'No payment was collected for this walk-in.';
  const confirm = () => {
    cancel(appt.id, reason, deskPaid && refund);
    onClose();
  };
  return (
    <Modal
      open={!!appt}
      onClose={onClose}
      title="Cancel Appointment"
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button variant="danger" icon="x" onClick={confirm}>
            Cancel Appointment
          </Button>
        </>
      }
    >
      <p className="text-body-lg text-text-body m-0 mb-3.5">
        Cancel the appointment for <b>{appt.name}</b> with {appt.doctor}?
      </p>
      <Field label="Reason (optional)">
        <Select
          value={reason}
          placeholder="Select a reason"
          options={CANCEL_REASONS}
          onChange={setReason}
        />
      </Field>
      <div className="bg-blue-soft-bg mt-4 flex gap-2.5 rounded-md px-3.5 py-3">
        <Icon name="info" size={16} className="text-blue mt-0.5 flex-none" />
        <div className="text-caption text-text-body leading-[1.55]">{refundNote}</div>
      </div>
      {deskPaid && (
        <div className="border-border-soft mt-3 flex items-center gap-3 rounded-md border px-3.5 py-3">
          <Toggle value={refund} onChange={setRefund} />
          <div className="flex-1">
            <div className="text-body text-text-strong font-medium">
              Record desk refund of <span className="tabular-nums">{money(appt.amount)}</span>
            </div>
            <div className="text-caption text-text-muted">
              Marks the payment Refunded so desk collections reconcile.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
