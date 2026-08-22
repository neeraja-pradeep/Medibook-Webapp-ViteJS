import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { TableShell, tdClass } from '@/shared/ui/TableShell';

import { hospitalPath, isHospitalRole } from '@/app/router/paths';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import { usePatientsStore } from '@/features/patients/application/store/patients.store';

import { PatientModal } from '../components/PatientModal';

/**
 * Patient Detail (no medical data) — identity, contact, booking history and a
 * billing summary. Ported 1:1 from the design prototype's `PatientDetail`;
 * the selected MRN comes from the URL (`:mrn`), falling back to the first
 * record exactly like the prototype.
 */
export function PatientDetailScreen() {
  const navigate = useNavigate();
  const { role, mrn } = useParams();
  const hospitalRole = isHospitalRole(role) ? role : 'receptionist';

  const patients = usePatientsStore((s) => s.patients);
  const appts = useAppointmentsStore((s) => s.appts);
  const startBooking = useAppointmentsStore((s) => s.startBooking);

  const [edit, setEdit] = useState(false);

  const target = mrn ?? patients[0]?.mrn ?? appts[0]?.mrn;
  const rec = patients.find((x) => x.mrn === target);
  const list = appts.filter((a) => a.mrn === target);
  const base = rec ?? list[0] ?? appts[0];

  if (!base) {
    return (
      <div className="text-text-faint text-body-lg p-12 text-center">No patient selected.</div>
    );
  }

  const email = rec?.email ?? '';
  const address = rec?.address ?? '';
  const totalPaid = list.filter((a) => a.payment === 'Paid').reduce((s, a) => s + a.amount, 0);
  const pending = list.filter((a) => a.payment === 'Pending').reduce((s, a) => s + a.amount, 0);

  const infoRow = (k: string, v: ReactNode) => (
    <div className="border-border-soft flex justify-between border-b py-2.75">
      <span className="text-body text-text-muted">{k}</span>
      <span className="text-body text-text-strong text-right font-medium">{v}</span>
    </div>
  );

  const book = () => {
    startBooking(base.mrn);
    navigate(hospitalPath(hospitalRole, 'create'));
  };

  return (
    <div className="flex flex-col gap-5">
      <Card pad={22} className="flex items-center gap-5">
        <Avatar name={base.name} size={64} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-h1 text-text-strong">{base.name}</span>
            <Badge status={base.status || 'Active'} />
          </div>
          <div className="text-body text-text-muted mt-1.25 flex flex-wrap gap-4">
            <span>MR: {base.mrn}</span>
            <span>·</span>
            <span>
              {base.age || '—'} yrs · {base.gender || '—'}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.25">
              <Icon name="phone" size={14} /> {base.phone || '—'}
            </span>
          </div>
        </div>
        <Button variant="secondary" icon="pencil" onClick={() => setEdit(true)}>
          Edit
        </Button>
        <Button icon="calendar-plus" onClick={book}>
          New Appointment
        </Button>
      </Card>
      <div className="flex gap-5">
        <div className="flex flex-[2] flex-col gap-5">
          <Card>
            <SectionTitle size={16} className="mb-3.5">
              Booking History
            </SectionTitle>
            {list.length === 0 ? (
              <div className="text-text-faint text-body py-7 text-center">
                No appointments yet for this patient.
              </div>
            ) : (
              <TableShell
                columns={['Date', 'Doctor / Dept', 'Source', 'Payment', 'Token', 'Status']}
              >
                {list.map((a) => (
                  <tr key={a.id}>
                    <td className={tdClass}>
                      {a.date}
                      <div className="text-caption text-text-muted">{a.time}</div>
                    </td>
                    <td className={tdClass}>
                      {a.doctor}
                      <div className="text-caption text-text-muted">{a.dept}</div>
                    </td>
                    <td className={tdClass}>
                      <Badge status={a.source} />
                    </td>
                    <td className={tdClass}>
                      <Badge status={a.payment} />
                    </td>
                    <td className={tdClass}>{a.token || '—'}</td>
                    <td className={tdClass}>
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))}
              </TableShell>
            )}
          </Card>
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <Card>
            <SectionTitle size={16} className="mb-2">
              Contact Details
            </SectionTitle>
            {infoRow('Phone', base.phone || '—')}
            {infoRow('Email', email || '—')}
            {infoRow('Gender', base.gender || '—')}
            {infoRow('Age', (base.age || '—') + ' yrs')}
            <div className="flex justify-between gap-4 py-2.75">
              <span className="text-body text-text-muted">Address</span>
              <span className="text-body text-text-strong max-w-45 text-right font-medium">
                {address || '—'}
              </span>
            </div>
          </Card>
          <Card>
            <SectionTitle size={16} className="mb-2">
              Billing Summary
            </SectionTitle>
            {infoRow('Total Visits', list.length)}
            {infoRow('Total Paid', <span className="tabular-nums">{money(totalPaid)}</span>)}
            {infoRow(
              'Outstanding',
              <span className={cn('tabular-nums', pending ? 'text-d-500' : 'text-text-strong')}>
                {money(pending)}
              </span>,
            )}
          </Card>
        </div>
      </div>
      <PatientModal open={edit} patient={rec ?? base} onClose={() => setEdit(false)} />
    </div>
  );
}
