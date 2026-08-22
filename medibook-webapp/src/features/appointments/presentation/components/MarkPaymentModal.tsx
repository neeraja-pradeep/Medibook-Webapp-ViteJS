import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { Modal } from '@/shared/ui/Modal';
import { TextInput } from '@/shared/ui/TextInput';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import type {
  Appointment,
  PaymentMode,
} from '@/features/appointments/application/store/appointments.types';

const MODES: readonly (readonly [PaymentMode, IconName])[] = [
  ['Cash', 'banknote'],
  ['UPI', 'smartphone'],
  ['Card', 'credit-card'],
];

interface MarkPaymentModalProps {
  appt: Appointment | null;
  onClose: () => void;
  onPaid?: () => void;
}

/** Record a walk-in's external payment (design `Flows.jsx` `MarkPaymentModal`). */
export function MarkPaymentModal({ appt, onClose, onPaid }: MarkPaymentModalProps) {
  const markPaid = useAppointmentsStore((s) => s.markPaid);
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [ref, setRef] = useState('');
  if (!appt) return null;
  return (
    <Modal
      open={!!appt}
      onClose={onClose}
      title="Record Payment"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            icon="check"
            onClick={() => {
              markPaid(appt.id, { mode, ref });
              onPaid?.();
            }}
          >
            Mark Paid &amp; Issue Token
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <div className="bg-blue-soft-bg flex items-center gap-3 rounded-md px-3.5 py-3">
          <Avatar name={appt.name} size={38} />
          <div className="flex-1">
            <div className="text-body text-text-strong font-medium">{appt.name}</div>
            <div className="text-caption text-text-muted">
              {appt.mrn} · {appt.doctor} · {appt.dept}
            </div>
          </div>
          <Badge status="Walk-in" />
        </div>
        <div className="border-border-soft overflow-hidden rounded-md border">
          <div className="border-border-soft text-body text-text-body flex justify-between border-b px-3.5 py-3">
            <span>Consultation — {appt.dept}</span>
            <span className="font-semibold tabular-nums">{money(appt.amount)}</span>
          </div>
          <div className="bg-bg-tint text-body text-text-navy flex justify-between px-3.5 py-3 font-medium">
            <span>Total Payable</span>
            <span className="tabular-nums">{money(appt.amount)}</span>
          </div>
        </div>
        <div className="text-caption text-text-muted bg-y-100 flex items-center gap-2 rounded-md px-3 py-2.25">
          <Icon name="info" size={15} className="text-y-700" /> Payment is collected externally —
          record the mode here to generate the bill & token.
        </div>
        <div>
          <div className="text-body text-text-strong mb-2">Payment Mode</div>
          <div className="flex gap-3">
            {MODES.map(([m, ic]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg py-3.5',
                  mode === m
                    ? 'border-blue bg-blue-soft-bg text-blue border-2'
                    : 'border-border text-text-muted border bg-white',
                )}
              >
                <Icon name={ic} size={22} />
                <span className="text-body">{m}</span>
              </button>
            ))}
          </div>
        </div>
        {mode !== 'Cash' && (
          <Field label={`${mode} Reference No. (optional)`}>
            <TextInput
              value={ref}
              onChange={setRef}
              placeholder="e.g. UPI txn id / last 4 digits"
              height={48}
            />
          </Field>
        )}
      </div>
    </Modal>
  );
}
