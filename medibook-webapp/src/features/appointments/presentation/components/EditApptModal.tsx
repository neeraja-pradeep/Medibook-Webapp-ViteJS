import { useEffect, useState } from 'react';

import { isoToRel, money, relToISO } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { toast } from '@/shared/ui/toast/toast.store';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import {
  DEPARTMENTS,
  DOCTORS,
  FEES,
} from '@/features/appointments/application/store/appointments.types';
import type {
  Appointment,
  Department,
} from '@/features/appointments/application/store/appointments.types';

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

interface EditForm {
  dept: Department;
  doctor: string;
  iso: string;
  time: string;
  remark: string;
}

interface EditApptModalProps {
  appt: Appointment | null;
  onClose: () => void;
}

/** Full edit: dept/doctor/date/time/note (design `Flows.jsx` `EditApptModal`). */
export function EditApptModal({ appt, onClose }: EditApptModalProps) {
  const editAppt = useAppointmentsStore((s) => s.editAppt);
  const [f, setF] = useState<EditForm | null>(null);
  useEffect(() => {
    if (appt) {
      setF({
        dept: appt.dept,
        doctor: appt.doctor,
        iso: relToISO(appt.date),
        time: appt.time,
        remark: appt.remark || '',
      });
    }
  }, [appt?.id]);
  if (!appt || !f) return null;
  const onDept = (v: string) => {
    const dept = DEPARTMENTS.find((d) => d === v);
    if (!dept) return;
    setF((x) => (x ? { ...x, dept, doctor: '' } : x));
  };
  const setField = (patch: Partial<EditForm>) => setF((x) => (x ? { ...x, ...patch } : x));
  const fee = FEES[f.dept] || appt.amount;
  const save = () => {
    if (!f.dept || !f.doctor) {
      toast('Select department and doctor', 'error');
      return;
    }
    editAppt(appt.id, {
      dept: f.dept,
      doctor: f.doctor,
      date: isoToRel(f.iso),
      time: f.time,
      remark: f.remark,
    });
    onClose();
  };
  return (
    <Modal
      open={!!appt}
      onClose={onClose}
      title="Edit Appointment"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={save}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4.5">
        <Field label="Department" required>
          <Select value={f.dept} options={DEPARTMENTS} onChange={onDept} />
        </Field>
        <Field label="Doctor" required>
          <Select
            value={f.doctor}
            placeholder={f.dept ? 'Select Doctor' : 'Select department first'}
            options={DOCTORS[f.dept]}
            onChange={(v) => setField({ doctor: v })}
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={f.iso}
            min={relToISO('Today')}
            onChange={(e) => setField({ iso: e.target.value })}
            className={dateInputClass}
          />
        </Field>
        <Field label="Time">
          <Select value={f.time} options={TIME_SLOTS} onChange={(v) => setField({ time: v })} />
        </Field>
        <Field label="Note" className="col-span-full">
          <textarea
            value={f.remark}
            onChange={(e) => setField({ remark: e.target.value })}
            placeholder="Add any relevant notes..."
            className="rounded-input border-border text-body-lg text-text-strong h-20 w-full resize-none border p-3"
          ></textarea>
        </Field>
      </div>
      <div className="text-body text-text-body mt-4 flex items-center gap-2">
        <Icon name="indian-rupee" size={16} className="text-text-muted" /> Consultation fee:{' '}
        <b className="tabular-nums">{money(fee)}</b>
        {fee !== appt.amount && (
          <span className="text-caption text-text-muted">(was {money(appt.amount)})</span>
        )}
      </div>
      {appt.payment === 'Paid' && fee !== appt.amount && (
        <div className="text-caption text-y-700 bg-y-100 mt-2.5 rounded-md px-3 py-2.25">
          Fee changed after payment — settle the difference at the desk.
        </div>
      )}
    </Modal>
  );
}
