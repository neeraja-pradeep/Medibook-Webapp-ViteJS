import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { isoToRel, money, relToISO } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { InfoDot } from '@/shared/ui/InfoDot';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import { hospitalPath, isHospitalRole, type HospitalRole } from '@/app/router/paths';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import {
  DEPARTMENTS,
  DOCTORS,
  FEES,
} from '@/features/appointments/application/store/appointments.types';
import type {
  Appointment,
  Gender,
} from '@/features/appointments/application/store/appointments.types';
import { DoctorCapacityHint } from '@/features/appointments/presentation/components/DoctorCapacityHint';
import { MultiPaymentModal } from '@/features/appointments/presentation/components/MultiPaymentModal';
import { MultiReceiptModal } from '@/features/appointments/presentation/components/MultiReceiptModal';
import { usePatientsStore } from '@/features/patients/application/store/patients.store';
import type { Patient } from '@/features/patients/application/store/patients.types';

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
];

const GENDERS: readonly Gender[] = ['Male', 'Female', 'Other'];

/** Native date-input styling — the design's `dateField`. */
const dateInputClass =
  'rounded-input border-border text-body text-text-strong h-13.5 w-full border bg-white px-4';

/** Consultation-row id counter — replaces the design's `Date.now()` id mint. */
let consultSeq = 1;
function nextConsultId(): number {
  consultSeq += 1;
  return consultSeq;
}

interface NewPatientForm {
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  mrn: string;
}

interface Consult {
  id: number;
  dept: string;
  doctor: string;
}

interface MultiTarget {
  patient: string;
  appts: Appointment[];
}

const APPT_TYPE_HINT =
  'Walk-in = booked at the desk (collect payment & issue token now, even for a future date). Online = booked & prepaid via the Medibook app.';
const CONSULT_HINT =
  'One consultation = one doctor, one fee, one token. Add more to book several doctors for the same patient in a single visit — you collect one combined payment.';

/** Create Appointment — patient search/add, multi-consultation, walk-in vs online (design `Screens.jsx` `CreateAppointment`). */
export function CreateAppointmentScreen() {
  const navigate = useNavigate();
  const roleParam = useParams().role;
  const role: HospitalRole = isHospitalRole(roleParam) ? roleParam : 'receptionist';
  const onDone = () => navigate(hospitalPath(role, 'appointments'));

  const create = useAppointmentsStore((s) => s.create);
  const consumeBooking = useAppointmentsStore((s) => s.consumeBooking);
  const storePatients = usePatientsStore((s) => s.patients);

  const [apptType, setApptType] = useState('Walk-in');
  const [picked, setPicked] = useState<Patient | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<NewPatientForm>({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    mrn: '',
  });
  const [iso, setIso] = useState(relToISO('Today'));
  const [time, setTime] = useState('10:00 am');
  const [remark, setRemark] = useState('');
  const [consults, setConsults] = useState<Consult[]>([{ id: 1, dept: '', doctor: '' }]);
  const [multiPay, setMultiPay] = useState<MultiTarget | null>(null);
  const [multiReceipt, setMultiReceipt] = useState<MultiTarget | null>(null);

  useEffect(() => {
    const bm = consumeBooking();
    if (bm) {
      const pp = usePatientsStore.getState().patients.find((x) => x.mrn === bm);
      if (pp) {
        setPicked(pp);
        setForm({
          name: pp.name,
          phone: pp.phone,
          age: String(pp.age),
          gender: pp.gender,
          mrn: pp.mrn,
        });
      }
    }
  }, [consumeBooking]);

  const source = apptType === 'Online' ? 'Online' : 'Walk-in';
  const setP = (patch: Partial<NewPatientForm>) => setForm((f) => ({ ...f, ...patch }));
  const setGender = (v: string) => {
    const g = GENDERS.find((x) => x === v);
    if (g) setForm((f) => ({ ...f, gender: g }));
  };
  const setConsultDept = (id: number, dept: string) =>
    setConsults((xs) => xs.map((c) => (c.id === id ? { ...c, dept, doctor: '' } : c)));
  const setConsultDoctor = (id: number, doctor: string) =>
    setConsults((xs) => xs.map((c) => (c.id === id ? { ...c, doctor } : c)));
  const addConsult = () =>
    setConsults((xs) => [...xs, { id: nextConsultId(), dept: '', doctor: '' }]);
  const removeConsult = (id: number) =>
    setConsults((xs) => (xs.length > 1 ? xs.filter((c) => c.id !== id) : xs));

  const doctorsFor = (dept: string): readonly string[] => {
    const d = DEPARTMENTS.find((x) => x === dept);
    return d ? DOCTORS[d] : [];
  };
  const feeOf = (dept: string): number => {
    const d = DEPARTMENTS.find((x) => x === dept);
    return d ? FEES[d] : 0;
  };

  const matches = q
    ? storePatients
        .filter((p) =>
          ((p.name || '') + ' ' + (p.phone || '') + ' ' + p.mrn)
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const patientOk = picked || (adding && form.name && form.phone);
  const ready = consults.filter((c) => c.dept && c.doctor);
  const valid = patientOk && ready.length >= 1;
  const total = ready.reduce((s, c) => s + feeOf(c.dept), 0);
  const patientName = picked ? picked.name : form.name;

  const submit = () => {
    if (!valid) {
      toast('Select a patient and at least one department + doctor', 'error');
      return;
    }
    const base = picked
      ? {
          mrn: picked.mrn,
          name: picked.name,
          age: picked.age,
          gender: picked.gender,
          phone: picked.phone,
          email: picked.email,
          address: picked.address,
        }
      : {
          mrn: form.mrn,
          name: form.name,
          age: Number(form.age) || 0,
          gender: form.gender,
          phone: form.phone,
        };
    const dateLabel = isoToRel(iso);
    const created: Appointment[] = [];
    ready.forEach((c) => {
      const dept = DEPARTMENTS.find((x) => x === c.dept);
      if (!dept) return;
      created.push(
        create({ ...base, dept, doctor: c.doctor, date: dateLabel, time, remark, source }),
      );
    });
    if (source === 'Walk-in') setMultiPay({ patient: patientName, appts: created });
    else {
      toast(
        created.length > 1
          ? `${created.length} online appointments saved`
          : 'Online appointment saved',
        'success',
      );
      onDone();
    }
  };

  return (
    <div className="flex max-w-250 flex-col gap-5">
      <Card pad={24}>
        <div className="border-border-soft mb-4.5 border-b pb-3">
          <h3 className="text-h3 text-text-navy m-0">Patient details</h3>
        </div>
        {picked ? (
          <div className="bg-blue-soft-bg flex items-center gap-3.5 rounded-md px-4 py-3.5">
            <Avatar name={picked.name} size={40} />
            <div className="flex-1">
              <div className="text-body text-text-strong font-medium">{picked.name}</div>
              <div className="text-caption text-text-muted">
                {picked.mrn} · {picked.age} yrs · {picked.gender} · {picked.phone}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
              Change
            </Button>
          </div>
        ) : adding ? (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4.5">
              <Field label="Full Name" required>
                <TextInput
                  value={form.name}
                  onChange={(v) => setP({ name: v })}
                  placeholder="Patient name"
                />
              </Field>
              <Field label="Phone Number" required>
                <TextInput
                  value={form.phone}
                  onChange={(v) => setP({ phone: v })}
                  placeholder="10-digit mobile"
                />
              </Field>
              <Field label="Age">
                <TextInput value={form.age} onChange={(v) => setP({ age: v })} placeholder="Age" />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} options={GENDERS} onChange={setGender} />
              </Field>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="arrow-left"
              className="mt-3.5"
              onClick={() => setAdding(false)}
            >
              Back to search
            </Button>
          </>
        ) : (
          <>
            <label className="font-ui text-label text-text-strong">Patient</label>
            <div className="relative mt-2">
              <TextInput
                value={q}
                onChange={setQ}
                placeholder="Search by name, phone number or MRN"
                icon="search"
              />
              {matches.length > 0 && (
                <div className="border-border shadow-pop absolute top-14.5 right-0 left-0 z-20 overflow-hidden rounded-md border bg-white">
                  {matches.map((p) => (
                    <button
                      key={p.mrn}
                      type="button"
                      onClick={() => {
                        setPicked(p);
                        setForm({
                          name: p.name,
                          phone: p.phone,
                          age: String(p.age),
                          gender: p.gender,
                          mrn: p.mrn,
                        });
                        setQ('');
                      }}
                      className="hover:bg-grey-200 flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.75 text-left"
                    >
                      <Avatar name={p.name} size={30} />
                      <div className="flex-1">
                        <div className="text-body text-text-strong font-medium">{p.name}</div>
                        <div className="text-caption text-text-muted">
                          {p.mrn} · {p.phone}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              icon="plus"
              className="mt-3.5"
              onClick={() => setAdding(true)}
            >
              Add new patient
            </Button>
          </>
        )}
      </Card>
      <Card pad={24}>
        <div className="border-border-soft mb-4.5 border-b pb-3">
          <h3 className="text-h3 text-text-navy m-0">Appointment Information</h3>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          <Field label="Appointment type">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={apptType} options={['Walk-in', 'Online']} onChange={setApptType} />
              </div>
              <InfoDot text={APPT_TYPE_HINT} />
            </div>
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={iso}
              min={relToISO('Today')}
              onChange={(e) => setIso(e.target.value)}
              className={dateInputClass}
            />
          </Field>
          <Field label="Appointment time">
            <Select value={time} options={TIME_SLOTS} onChange={setTime} />
          </Field>
        </div>
        <div className="mt-5.5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="font-ui text-label text-text-strong">Consultations</span>
            <InfoDot text={CONSULT_HINT} />
          </div>
          <div className="flex flex-col gap-3">
            {consults.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                <Select
                  value={c.dept}
                  placeholder="Select Department"
                  options={DEPARTMENTS}
                  onChange={(v) => setConsultDept(c.id, v)}
                />
                <Select
                  value={c.doctor}
                  placeholder={c.dept ? 'Select Doctor' : 'Select department first'}
                  options={doctorsFor(c.dept)}
                  onChange={(v) => setConsultDoctor(c.id, v)}
                />
                {consults.length > 1 ? (
                  <IconBtn
                    name="trash-2"
                    box={54}
                    color="var(--color-d-500)"
                    onClick={() => removeConsult(c.id)}
                    title="Remove consultation"
                  />
                ) : (
                  <span className="w-13.5"></span>
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" icon="plus" className="mt-2.5" onClick={addConsult}>
            Add another consultation
          </Button>
        </div>
        <div className="mt-4.5">
          <Field label="Note (Optional)">
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add any relevant notes..."
              className="rounded-input border-border text-body-lg text-text-strong h-23 w-full resize-none border p-3.5"
            ></textarea>
          </Field>
        </div>
        {ready.length > 0 && (
          <div className="text-body text-text-body mt-4 flex items-center gap-2">
            <Icon name="indian-rupee" size={16} className="text-text-muted" />{' '}
            {ready.length > 1 ? `Total for ${ready.length} consultations:` : 'Consultation fee:'}{' '}
            <b className="tabular-nums">{money(total)}</b>
            {source === 'Online' && <Badge status="Paid">Prepaid online</Badge>}
          </div>
        )}
        {ready.map((c) => (
          <DoctorCapacityHint key={c.id} doctor={c.doctor} />
        ))}
      </Card>
      <div className="flex justify-end gap-3.5">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button icon={source === 'Walk-in' ? 'indian-rupee' : 'check'} onClick={submit}>
          {source === 'Walk-in'
            ? 'Save & Record Payment'
            : ready.length > 1
              ? 'Create Appointments'
              : 'Create Appointment'}
        </Button>
      </div>
      <MultiPaymentModal
        open={!!multiPay}
        patient={multiPay?.patient}
        appts={multiPay?.appts ?? null}
        onClose={() => {
          setMultiPay(null);
          onDone();
        }}
        onPaid={(updated) => {
          setMultiPay(null);
          setMultiReceipt({ patient: patientName, appts: updated });
        }}
      />
      <MultiReceiptModal
        open={!!multiReceipt}
        patient={multiReceipt?.patient}
        appts={multiReceipt?.appts ?? null}
        onClose={() => {
          setMultiReceipt(null);
          onDone();
        }}
      />
    </div>
  );
}
