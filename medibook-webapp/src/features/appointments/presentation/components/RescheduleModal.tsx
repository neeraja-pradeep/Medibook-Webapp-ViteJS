import { useEffect, useState } from 'react';

import { isoToRel, relToISO } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import type { Appointment } from '@/features/appointments/application/store/appointments.types';

const TIME_SLOTS = [
  '9:00 am',
  '9:30 am',
  '10:00 am',
  '10:30 am',
  '11:00 am',
  '11:30 am',
  '12:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
];

/** Native date-input styling — the design's `flowDateInput`. */
const dateInputClass =
  'rounded-input border-border text-body text-text-strong h-13.5 w-full border bg-white px-4';

interface RescheduleModalProps {
  appt: Appointment | null;
  onClose: () => void;
  onCancelInstead?: () => void;
}

/** Move an appointment's date/time, same doctor (design `Flows.jsx` `RescheduleModal`). */
export function RescheduleModal({ appt, onClose, onCancelInstead }: RescheduleModalProps) {
  const reschedule = useAppointmentsStore((s) => s.reschedule);
  const [iso, setIso] = useState(relToISO('Today'));
  const [time, setTime] = useState('10:00 am');
  useEffect(() => {
    if (appt) {
      setIso(relToISO(appt.date));
      setTime(appt.time);
    }
  }, [appt?.id]);
  if (!appt) return null;
  const save = () => {
    reschedule(appt.id, { date: isoToRel(iso), time });
    onClose();
  };
  return (
    <Modal
      open={!!appt}
      onClose={onClose}
      title="Reschedule Appointment"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="calendar-check" onClick={save}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="bg-blue-soft-bg flex items-center gap-3 rounded-md px-3.5 py-3">
          <Avatar name={appt.name} size={38} />
          <div className="flex-1">
            <div className="text-body text-text-strong font-medium">{appt.name}</div>
            <div className="text-caption text-text-muted">
              {appt.doctor} · {appt.dept}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="New Date">
            <input
              type="date"
              value={iso}
              min={relToISO('Today')}
              onChange={(e) => setIso(e.target.value)}
              className={dateInputClass}
            />
          </Field>
          <Field label="New Time">
            <Select value={time} options={TIME_SLOTS} onChange={setTime} />
          </Field>
        </div>
        <div className="text-caption text-text-muted bg-grey-200 flex items-center gap-2 rounded-md px-3 py-2.5">
          <Icon name="info" size={15} className="flex-none" />{' '}
          <span>
            Same doctor only. Need a different doctor?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onCancelInstead?.();
              }}
              className="text-blue cursor-pointer font-semibold"
            >
              Cancel &amp; rebook
            </button>
            .
          </span>
        </div>
      </div>
    </Modal>
  );
}
