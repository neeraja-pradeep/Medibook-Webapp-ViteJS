import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import { usePatientsStore } from '@/features/patients/application/store/patients.store';
import type { Gender, PatientStatus } from '@/features/patients/application/store/patients.types';

/**
 * Loose view of the record being edited — the Patient Detail screen may pass a
 * real patient record OR (for patients that exist only as appointment history)
 * an appointment-derived object, exactly like the prototype's `rec || p`.
 */
export interface PatientModalPatient {
  readonly mrn: string;
  readonly name?: string;
  readonly phone?: string;
  readonly age?: number;
  readonly gender?: Gender;
  readonly email?: string;
  readonly address?: string;
  readonly status?: string;
}

interface PatientModalProps {
  open: boolean;
  /** Absent = "Add Patient" (new); present = "Edit Patient". */
  patient?: PatientModalPatient;
  onClose: () => void;
  onSaved?: (mrn: string) => void;
}

interface PatientForm {
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  email: string;
  address: string;
  status: PatientStatus;
}

const BLANK: PatientForm = {
  name: '',
  phone: '',
  age: '',
  gender: 'Male',
  email: '',
  address: '',
  status: 'Active',
};

/**
 * Add / Edit patient modal — identity + contact only (Medibook stores no
 * clinical data). Ported 1:1 from the design prototype's `PatientModal`.
 */
export function PatientModal({ open, patient, onClose, onSaved }: PatientModalProps) {
  const isNew = !patient;
  const patAdd = usePatientsStore((s) => s.patAdd);
  const patUpdate = usePatientsStore((s) => s.patUpdate);
  const [f, setF] = useState<PatientForm>(BLANK);

  useEffect(() => {
    if (open) {
      setF(
        patient
          ? {
              name: patient.name || '',
              phone: patient.phone || '',
              age: patient.age ? String(patient.age) : '',
              gender: patient.gender || 'Male',
              email: patient.email || '',
              address: patient.address || '',
              status: patient.status === 'Inactive' ? 'Inactive' : 'Active',
            }
          : BLANK,
      );
    }
  }, [open, patient]);

  const set = <K extends keyof PatientForm>(k: K, v: PatientForm[K]) =>
    setF((x) => ({ ...x, [k]: v }));

  const save = () => {
    if (!f.name || !f.phone) {
      toast('Name and phone are required', 'error');
      return;
    }
    const payload = {
      name: f.name,
      phone: f.phone,
      age: Number(f.age) || 0,
      gender: f.gender,
      email: f.email,
      address: f.address,
      status: f.status,
    };
    if (!patient) {
      const mrn = patAdd(payload);
      toast('Patient added', 'success');
      onSaved?.(mrn);
    } else {
      patUpdate(patient.mrn, payload);
      toast('Patient details updated', 'success');
      onSaved?.(patient.mrn);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Add Patient' : 'Edit Patient'}
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={save}>
            {isNew ? 'Add Patient' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4.5">
        <Field label="Full Name" required>
          <TextInput value={f.name} onChange={(v) => set('name', v)} placeholder="Patient name" />
        </Field>
        <Field label="Phone Number" required>
          <TextInput
            value={f.phone}
            onChange={(v) => set('phone', v)}
            placeholder="10-digit mobile"
          />
        </Field>
        <Field label="Age">
          <TextInput value={f.age} onChange={(v) => set('age', v)} placeholder="Age" />
        </Field>
        <Field label="Gender">
          <Select
            value={f.gender}
            options={['Male', 'Female', 'Other']}
            onChange={(v) => set('gender', v as Gender)}
          />
        </Field>
        <Field label="Email">
          <TextInput
            value={f.email}
            onChange={(v) => set('email', v)}
            placeholder="name@mail.com"
          />
        </Field>
        <Field label="Status">
          <Select
            value={f.status}
            options={['Active', 'Inactive']}
            onChange={(v) => set('status', v as PatientStatus)}
          />
        </Field>
        <Field label="Address" className="col-span-full">
          <TextInput
            value={f.address}
            onChange={(v) => set('address', v)}
            placeholder="Area, City"
          />
        </Field>
      </div>
      {isNew && (
        <div className="bg-blue-soft-bg text-caption text-text-muted mt-3.5 flex items-center gap-2 rounded-md px-3 py-2.5">
          <Icon name="info" size={15} className="text-blue flex-none" /> An MR Number is generated
          automatically. Medibook stores identity &amp; contact only — no clinical data.
        </div>
      )}
    </Modal>
  );
}
