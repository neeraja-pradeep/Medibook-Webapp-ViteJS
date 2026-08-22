import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { hospitalPath, isHospitalRole } from '@/app/router/paths';
import { mkWeek } from '@/features/doctors/application/store/catalog.fixtures';
import { useCatalogStore } from '@/features/doctors/application/store/catalog.store';
import type {
  CatalogDoctorStatus,
  DoctorLeave,
  DoctorReview,
  WeekDay,
} from '@/features/doctors/application/store/catalog.types';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { InfoDot } from '@/shared/ui/InfoDot';
import { SegTabs } from '@/shared/ui/SegTabs';
import { Select } from '@/shared/ui/Select';
import { Tabs } from '@/shared/ui/Tabs';
import { TextInput } from '@/shared/ui/TextInput';
import { Toggle } from '@/shared/ui/Toggle';
import { toast } from '@/shared/ui/toast/toast.store';

import { PhotoButton } from '../components/PhotoButton';
import { Stars } from '../components/Stars';
import { WeeklyHours } from '../components/WeeklyHours';

/** Doctor statuses offered in the profile controls (design order). */
const STATUS_OPTIONS = ['Active', 'On Leave', 'Inactive'] as const;

/** Editable draft — `fee` is a free-text string until parsed on save (design `blankDoctor`). */
interface DoctorForm {
  id?: string;
  name: string;
  depts: string[];
  spec: string;
  room: string;
  phone: string;
  email: string;
  qual: string;
  exp: string;
  reg: string;
  fee: number | string;
  rating: number;
  reviews: number;
  status: CatalogDoctorStatus;
  photo: string | null;
  about: string;
  week: readonly WeekDay[];
  leave: readonly DoctorLeave[];
  list: readonly DoctorReview[];
}

function blankDoctor(): DoctorForm {
  return {
    name: '',
    depts: [],
    spec: '',
    room: '',
    phone: '',
    email: '',
    qual: '',
    exp: '',
    reg: '',
    fee: '',
    rating: 0,
    reviews: 0,
    status: 'Active',
    photo: null,
    about: '',
    week: mkWeek([0, 1, 2, 3, 4], '9:00 am', '5:00 pm'),
    leave: [],
    list: [],
  };
}

/** Doctor profile detail / editor (design `DoctorDetailPage`; `:id === 'new'` is blank). */
export function DoctorDetailPageScreen() {
  const { id: selId, role: roleParam } = useParams();
  const navigate = useNavigate();
  const role = isHospitalRole(roleParam) ? roleParam : 'admin';
  const isNew = !selId || selId === 'new';
  const depts = useCatalogStore((s) => s.depts);
  const docs = useCatalogStore((s) => s.docs);
  const catSaveDoctor = useCatalogStore((s) => s.catSaveDoctor);
  const catDeleteDoctor = useCatalogStore((s) => s.catDeleteDoctor);
  const [tab, setTab] = useState('Profile');
  const [d, setD] = useState<DoctorForm>(blankDoctor());
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setTab('Profile');
    const ex = !isNew ? docs.find((x) => x.id === selId) : undefined;
    setD(
      ex
        ? {
            id: ex.id,
            name: ex.name,
            depts: [...ex.depts],
            spec: ex.spec,
            room: ex.room,
            phone: ex.phone ?? '',
            email: ex.email ?? '',
            qual: ex.qual ?? '',
            exp: ex.exp ?? '',
            reg: ex.reg ?? '',
            fee: ex.fee,
            rating: ex.rating,
            reviews: ex.reviews,
            status: ex.status,
            photo: ex.photo ?? null,
            about: ex.about ?? '',
            week: ex.week,
            leave: ex.leave,
            list: ex.list,
          }
        : blankDoctor(),
    );
  }, [selId, docs, isNew]);

  const set = <K extends keyof DoctorForm>(k: K, v: DoctorForm[K]) =>
    setD((x) => ({ ...x, [k]: v }));
  const toggleDept = (name: string) =>
    setD((x) => ({
      ...x,
      depts: x.depts.includes(name) ? x.depts.filter((n) => n !== name) : [...x.depts, name],
    }));
  const back = () => navigate(hospitalPath(role, 'doctors'));
  const save = () => {
    if (!d.name) {
      toast('Doctor name is required', 'error');
      return;
    }
    if (!d.depts.length) {
      toast('Assign at least one department', 'error');
      return;
    }
    catSaveDoctor({ ...d, id: d.id, fee: parseInt(String(d.fee).replace(/[^0-9]/g, ''), 10) || 0 });
    toast(isNew ? 'Doctor added' : 'Doctor profile saved', 'success');
    back();
  };
  const del = () => {
    if (d.id) catDeleteDoctor(d.id);
    toast('Doctor profile deleted', 'info');
    setConfirm(false);
    back();
  };

  const deptNames = depts.map((x) => x.name);
  const statusCaption =
    d.status === 'Inactive'
      ? 'Disabled — hidden from the patient app'
      : d.status === 'On Leave'
        ? 'Visible, booking paused'
        : 'Live & bookable in the app';

  return (
    <div className="flex max-w-260 flex-col gap-5">
      <Card pad={22} className="flex flex-wrap items-center gap-4.5">
        <Avatar name={d.name || '?'} src={d.photo ?? undefined} size={64} />
        <div className="min-w-55 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-h1 text-text-strong">
              {d.name || (isNew ? 'New Doctor Profile' : 'Doctor')}
            </span>
            <Badge status={d.status} />
          </div>
          <div className="text-body text-text-muted mt-1.25 flex flex-wrap items-center gap-3">
            {d.spec && <span>{d.spec}</span>}
            {d.depts.length > 0 && (
              <span>
                {d.spec ? '· ' : ''}
                {d.depts.join(', ')}
              </span>
            )}
            {!isNew && (
              <span>
                ·{' '}
                <span className="inline-flex items-center gap-1">
                  <Icon
                    name="star"
                    size={14}
                    className="text-y-500"
                    style={{ fill: 'var(--color-y-500)' }}
                  />{' '}
                  {d.rating} ({d.reviews})
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-caption text-text-muted">Profile status</span>
          <SegTabs
            tabs={STATUS_OPTIONS}
            value={d.status}
            onChange={(v) => set('status', v as CatalogDoctorStatus)}
          />
          <span className="text-caption text-text-faint">{statusCaption}</span>
        </div>
      </Card>

      <Card pad={0} className="overflow-hidden">
        <div className="px-5.5 pt-4">
          <Tabs
            tabs={isNew ? ['Profile', 'Availability'] : ['Profile', 'Availability', 'Reviews']}
            value={tab}
            onChange={setTab}
          />
        </div>
        <div className="p-5.5">
          {tab === 'Profile' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar name={d.name || '?'} src={d.photo ?? undefined} size={56} />
                <PhotoButton
                  onPick={(url) => set('photo', url)}
                  label={d.photo ? 'Change Photo' : 'Upload Photo'}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4.5 gap-y-4">
                <Field label="Full Name" required>
                  <TextInput
                    value={d.name}
                    placeholder="e.g. Dr. Asha Verma"
                    onChange={(v) => set('name', v)}
                  />
                </Field>
                <Field label="Specialization">
                  <TextInput
                    value={d.spec}
                    placeholder="e.g. Cardiologist"
                    onChange={(v) => set('spec', v)}
                  />
                </Field>
                <Field label="Room Number">
                  <TextInput
                    value={d.room}
                    placeholder="e.g. 101"
                    onChange={(v) => set('room', v)}
                  />
                </Field>
                <Field label="Phone Number">
                  <TextInput
                    value={d.phone}
                    placeholder="Mobile"
                    onChange={(v) => set('phone', v)}
                  />
                </Field>
                <Field label="Email">
                  <TextInput
                    value={d.email}
                    placeholder="name@hospital.med"
                    onChange={(v) => set('email', v)}
                  />
                </Field>
                <Field label="Qualification">
                  <TextInput
                    value={d.qual}
                    placeholder="MBBS, MD"
                    onChange={(v) => set('qual', v)}
                  />
                </Field>
                <Field label="Experience (years)">
                  <TextInput value={d.exp} placeholder="e.g. 12" onChange={(v) => set('exp', v)} />
                </Field>
                <Field label="Registration No.">
                  <TextInput value={d.reg} placeholder="KMC/…" onChange={(v) => set('reg', v)} />
                </Field>
                <Field label="Status">
                  <Select
                    value={d.status}
                    options={STATUS_OPTIONS}
                    onChange={(v) => set('status', v as CatalogDoctorStatus)}
                  />
                </Field>
                <Field label="Consultation Fee">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <TextInput
                        value={d.fee ? '₹ ' + d.fee : ''}
                        placeholder="₹ 0"
                        onChange={(v) => set('fee', v)}
                      />
                    </div>
                    <InfoDot text="Overrides the department's base fee. This is what patients pay & see in the app." />
                  </div>
                </Field>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-label font-ui text-text-strong">Departments</span>
                  <span className="text-d-500">*</span>
                  <InfoDot text="A doctor can belong to more than one department." />
                </div>
                <div className="flex flex-wrap gap-2">
                  {deptNames.map((name) => {
                    const on = d.depts.includes(name);
                    return (
                      <span
                        key={name}
                        onClick={() => toggleDept(name)}
                        className={
                          on
                            ? 'text-body border-blue bg-blue-soft-bg text-blue inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.75'
                            : 'text-body border-border text-text-body inline-flex cursor-pointer items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.75'
                        }
                      >
                        {on && <Icon name="check" size={14} />}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
              <Field label="About">
                <textarea
                  value={d.about}
                  placeholder="Short bio shown in the patient app"
                  onChange={(e) => set('about', e.target.value)}
                  className="border-border text-body-lg text-text-strong rounded-input box-border h-18 w-full resize-none border p-3"
                />
              </Field>
            </div>
          )}

          {tab === 'Availability' && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-body text-text-strong mb-2.5 font-medium">
                  Consultation Settings
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="border-border-soft flex items-center justify-between border-b py-2.5">
                    <span className="text-body text-text-body">Consultation duration</span>
                    <div className="w-30">
                      <Select
                        value="15 mins"
                        options={['10 mins', '15 mins', '20 mins', '30 mins']}
                        height={38}
                      />
                    </div>
                  </div>
                  <div className="border-border-soft flex items-center justify-between border-b py-2.5">
                    <span className="text-body text-text-body">Max appointments per slot</span>
                    <div className="w-30">
                      <Select
                        value="15 slots"
                        options={['5 slots', '10 slots', '15 slots']}
                        height={38}
                      />
                    </div>
                  </div>
                  <div className="border-border-soft flex items-center justify-between border-b py-2.5">
                    <span className="text-body text-text-body">Online appointment booking</span>
                    <Toggle value={true} onChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-body text-text-body">
                      Buffer time between appointments
                    </span>
                    <div className="w-30">
                      <Select
                        value="15 mins"
                        options={['0 mins', '5 mins', '10 mins', '15 mins']}
                        height={38}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <WeeklyHours
                week={d.week}
                info="The Medibook app only offers booking slots during these hours. Outside them, patients can't book."
              />
              <div>
                <div className="mb-2.5 flex items-center">
                  <span className="text-body text-text-strong font-medium">Shifts</span>
                  <span className="flex-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="plus"
                    onClick={() => toast('Add shift — demo', 'info')}
                  >
                    Add Shift
                  </Button>
                </div>
                <div className="border-border-soft flex items-center gap-3 border-b py-2.5">
                  <span className="text-body text-text-strong w-15">Shift 1</span>
                  <span className="text-caption text-text-muted">Start</span>
                  <div className="w-23">
                    <Select
                      value="9:30 AM"
                      options={['9:00 AM', '9:30 AM', '2:00 PM']}
                      height={38}
                    />
                  </div>
                  <span className="text-caption text-text-muted">End</span>
                  <div className="w-23">
                    <Select
                      value="1:00 PM"
                      options={['1:00 PM', '5:00 PM', '6:00 PM']}
                      height={38}
                    />
                  </div>
                  <span className="flex-1" />
                  <IconBtn
                    name="trash-2"
                    box={32}
                    size={15}
                    color="var(--color-d-500)"
                    onClick={() => toast('Shift removed', 'info')}
                  />
                </div>
                <div className="flex items-center gap-3 py-2.5">
                  <span className="text-body text-text-strong w-15">Shift 2</span>
                  <span className="text-caption text-text-muted">Start</span>
                  <div className="w-23">
                    <Select
                      value="2:00 PM"
                      options={['9:00 AM', '9:30 AM', '2:00 PM']}
                      height={38}
                    />
                  </div>
                  <span className="text-caption text-text-muted">End</span>
                  <div className="w-23">
                    <Select
                      value="5:00 PM"
                      options={['1:00 PM', '5:00 PM', '6:00 PM']}
                      height={38}
                    />
                  </div>
                  <span className="flex-1" />
                  <IconBtn
                    name="trash-2"
                    box={32}
                    size={15}
                    color="var(--color-d-500)"
                    onClick={() => toast('Shift removed', 'info')}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="text-body text-text-strong font-medium">
                    Leave / Unavailability
                  </span>
                  <InfoDot text="Block dates the doctor is unavailable. Booking is disabled in the app for these dates." />
                  <span className="flex-1" />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="plus"
                    onClick={() => toast('Add leave — demo', 'info')}
                  >
                    Add Leave
                  </Button>
                </div>
                {d.leave.length === 0 ? (
                  <div className="border-border text-body text-text-faint rounded-md border border-dashed py-5 text-center">
                    No upcoming leave
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {d.leave.map((l, i) => (
                      <div
                        key={i}
                        className="border-border-soft flex items-center gap-3 rounded-md border px-3.5 py-3"
                      >
                        <div className="bg-y-100 text-y-700 flex size-8.5 flex-none items-center justify-center rounded-md">
                          <Icon name="plane" size={17} />
                        </div>
                        <div className="flex-1">
                          <div className="text-body text-text-strong font-medium">
                            {l.from === l.to ? l.from : `${l.from} – ${l.to}`}
                          </div>
                          <div className="text-caption text-text-muted">{l.reason}</div>
                        </div>
                        <IconBtn
                          name="trash-2"
                          box={32}
                          size={15}
                          color="var(--color-d-500)"
                          onClick={() => toast('Leave removed', 'info')}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'Reviews' && !isNew && (
            <div>
              <div className="mb-3.5 flex items-center gap-2">
                <span className="text-caption text-text-muted">
                  Reviews come from patients in the Medibook app and are read-only.
                </span>
                <InfoDot text="You can't edit or delete patient reviews. Report abuse to Medibook support." />
              </div>
              <Card pad={16} className="mb-3.5 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-text-strong text-[30px] font-bold">{d.rating}</div>
                  <Stars r={d.rating} />
                </div>
                <div className="text-body text-text-muted">
                  Based on {d.reviews} patient reviews
                </div>
              </Card>
              <div className="flex flex-col gap-2.5">
                {d.list.map((rv, i) => (
                  <div key={i} className="border-border-soft rounded-md border p-3.5">
                    <div className="mb-1.5 flex items-center gap-2.5">
                      <Avatar name={rv.a} size={28} />
                      <span className="text-body text-text-strong font-medium">{rv.a}</span>
                      <span className="flex-1" />
                      <Stars r={rv.r} size={13} />
                    </div>
                    <div className="text-body text-text-body leading-[1.55]">{rv.t}</div>
                    <div className="text-caption text-text-faint mt-1.5">{rv.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        {!isNew && (
          <Button
            variant="ghost"
            icon="trash-2"
            style={{ color: 'var(--color-d-500)' }}
            onClick={() => setConfirm(true)}
          >
            Delete Profile
          </Button>
        )}
        <span className="flex-1" />
        <Button variant="secondary" onClick={back}>
          Cancel
        </Button>
        <Button icon="check" onClick={save}>
          {isNew ? 'Add Doctor' : 'Save Changes'}
        </Button>
      </div>

      <ConfirmModal
        open={confirm}
        danger
        confirmLabel="Delete"
        title="Delete Doctor Profile"
        body={`Delete ${d.name || 'this doctor'}'s profile? This removes them from the patient app and can't be undone.`}
        onClose={() => setConfirm(false)}
        onConfirm={del}
      />
    </div>
  );
}
