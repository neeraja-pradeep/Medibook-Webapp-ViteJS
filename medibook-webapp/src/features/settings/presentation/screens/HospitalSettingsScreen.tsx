import { type ChangeEvent, type MouseEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type HospitalStaticView, hospitalPath, isHospitalRole } from '@/app/router/paths';
import { useSettingsStore } from '@/features/settings/application/store/settings.store';
import type {
  HospitalNotify,
  HospitalRules,
  HospitalSettings,
} from '@/features/settings/application/store/settings.types';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import { InfoDot } from '@/shared/ui/InfoDot';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';
import { Toggle } from '@/shared/ui/Toggle';

import { RuleCard } from '../components/RuleCard';
import { RuleRow } from '../components/RuleRow';
import { SettingsHead } from '../components/SettingsHead';

type SettingsSection =
  'General' | 'Management' | 'System Rules' | 'Working Hours' | 'Notifications';

const SETTINGS_NAV: readonly { readonly id: SettingsSection; readonly icon: IconName }[] = [
  { id: 'General', icon: 'building-2' },
  { id: 'Management', icon: 'layout-grid' },
  { id: 'System Rules', icon: 'sliders-horizontal' },
  { id: 'Working Hours', icon: 'clock' },
  { id: 'Notifications', icon: 'bell' },
];

const MANAGE_LINKS: readonly [string, string, HospitalStaticView, IconName][] = [
  ['Manage Doctors', 'Add doctors, schedules, availability', 'doctors', 'stethoscope'],
  ['Manage Departments', 'Create departments and assign doctors', 'doctors', 'layout-grid'],
  ['User Management', 'Manage admin, receptionist, accountant access', 'users', 'users'],
  ['Role Management', 'Configure roles and module permissions', 'users', 'shield-check'],
  ['Subscription & Plan', 'Manage subscription plan and payments', 'settlements', 'credit-card'],
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PATIENT_COMMS: readonly [keyof HospitalNotify, string, string][] = [
  ['confirm', 'Appointment Confirmation', 'Notify the patient when a booking is confirmed'],
  ['reminder', 'Visit Reminder', 'Remind patients before their appointment'],
];

const ADMIN_ALERTS: readonly [keyof HospitalNotify, string, string][] = [
  ['settleReceived', 'Settlement Received', 'When a Medibook transfer reaches your account'],
  ['settleOverdue', 'Settlement Overdue', 'When an expected settlement is late'],
  ['quotaLow', 'Plan Quota Low', 'When online-appointment credits are running out'],
];

export function HospitalSettingsScreen() {
  const navigate = useNavigate();
  const { role: roleParam } = useParams();
  const role = isHospitalRole(roleParam) ? roleParam : 'admin';

  const saved = useSettingsStore((s) => s.settings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);

  const [sec, setSec] = useState<SettingsSection>('General');
  const [draft, setDraft] = useState<HospitalSettings>(saved);
  const [gallery, setGallery] = useState<readonly (string | null)[]>([null, null]);

  const set = <K extends keyof HospitalSettings>(k: K, v: HospitalSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const setRule = <K extends keyof HospitalRules>(k: K, v: HospitalRules[K]) =>
    setDraft((d) => ({ ...d, rules: { ...d.rules, [k]: v } }));
  const setNote = <K extends keyof HospitalNotify>(k: K, v: HospitalNotify[K]) =>
    setDraft((d) => ({ ...d, notify: { ...d.notify, [k]: v } }));
  const setBank = (k: keyof HospitalSettings['bank'], v: string) =>
    setDraft((d) => ({ ...d, bank: { ...d.bank, [k]: v } }));

  const save = () => saveSettings(draft);
  const onNavigate = (view: HospitalStaticView) => navigate(hospitalPath(role, view));

  const pick = (cb: (url: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === 'string') cb(r.result);
    };
    r.readAsDataURL(f);
  };

  const sel = (value: string, options: readonly string[], onChange: (v: string) => void) => (
    <div className="w-32.5">
      <Select value={value} options={options} onChange={onChange} height={40} />
    </div>
  );

  return (
    <div className="flex items-start gap-5">
      <Card pad={10} className="w-60 flex-none">
        {SETTINGS_NAV.map((s) => {
          const active = sec === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSec(s.id)}
              className={cn(
                'text-body flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-3 transition-colors duration-150',
                active
                  ? 'bg-blue-soft-bg text-text-navy font-semibold'
                  : 'text-text-muted hover:bg-grey-200 font-medium',
              )}
            >
              <Icon name={s.icon} size={19} /> {s.id}
            </div>
          );
        })}
      </Card>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {sec === 'General' && (
          <>
            <Card pad={28}>
              <SettingsHead info="Your logo, name and details appear on the hospital's profile in the Medibook patient app.">
                Hospital Profile
              </SettingsHead>
              <div className="mb-6.5 flex items-center gap-4.5">
                <div className="bg-blue-soft-bg flex size-18 flex-none items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={draft.logo || '/assets/apollo-logo.png'}
                    className={cn('object-cover', draft.logo ? 'h-full w-full' : 'size-12')}
                    alt=""
                  />
                </div>
                <div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={pick((url) => set('logo', url))}
                    />
                    <span className="text-body border-text-navy text-text-navy inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3.5 py-2 font-medium">
                      <Icon name="upload" size={16} /> Change Logo
                    </span>
                  </label>
                  <div className="text-caption text-text-muted mt-2">PNG or JPG, up to 1MB</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5.5">
                <Field label="Hospital Name">
                  <TextInput value={draft.name} onChange={(v) => set('name', v)} />
                </Field>
                <Field label="Registration No.">
                  <TextInput value={draft.regNo} onChange={(v) => set('regNo', v)} />
                </Field>
                <Field label="GSTIN">
                  <TextInput value={draft.gstin || ''} onChange={(v) => set('gstin', v)} />
                </Field>
                <Field label="Phone">
                  <TextInput value={draft.phone} onChange={(v) => set('phone', v)} />
                </Field>
                <Field label="Email">
                  <TextInput value={draft.email} onChange={(v) => set('email', v)} />
                </Field>
                <Field label="About" className="col-span-full">
                  <textarea
                    value={draft.about}
                    onChange={(e) => set('about', e.target.value)}
                    className="rounded-input border-border text-body-lg text-text-strong box-border h-23 w-full resize-none border p-3.5"
                  ></textarea>
                </Field>
              </div>
            </Card>

            <Card pad={28}>
              <SettingsHead info="These photos show in your hospital's gallery when patients browse in the Medibook app.">
                Photo Gallery
              </SettingsHead>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1].map((i) => {
                  const src = gallery[i];
                  return (
                    <label key={i} className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={pick((url) =>
                          setGallery((g) => g.map((x, j) => (j === i ? url : x))),
                        )}
                      />
                      {src ? (
                        <img
                          src={src}
                          className="border-border h-32.5 w-full rounded-lg border object-cover"
                          alt=""
                        />
                      ) : (
                        <ImageUpload
                          label={i === 0 ? 'Cover photo' : 'Reception'}
                          hint={i === 0 ? '1280×720' : undefined}
                          h={130}
                        />
                      )}
                    </label>
                  );
                })}
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={pick(() => toast('Photo added', 'success'))}
                  />
                  <ImageUpload label="Add photo" h={130} icon="plus" />
                </label>
              </div>
            </Card>

            <Card pad={28}>
              <SettingsHead info="Patients see your location and get directions in the Medibook app. Click the map to drop the pin.">
                Location
              </SettingsHead>
              <div className="flex items-stretch gap-5">
                <div className="flex flex-1 flex-col gap-4">
                  <Field label="Address">
                    <TextInput value={draft.address} onChange={(v) => set('address', v)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Latitude">
                      <TextInput value={draft.lat} onChange={(v) => set('lat', v)} />
                    </Field>
                    <Field label="Longitude">
                      <TextInput value={draft.lng} onChange={(v) => set('lng', v)} />
                    </Field>
                  </div>
                  <div className="text-caption text-text-muted flex items-center gap-1.5">
                    <Icon name="map-pin" size={14} /> Click anywhere on the map to set the location
                    pin.
                  </div>
                </div>
                <div
                  onClick={(e: MouseEvent<HTMLDivElement>) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(
                      0,
                      Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100)),
                    );
                    const y = Math.max(
                      0,
                      Math.min(100, Math.round(((e.clientY - r.top) / r.height) * 100)),
                    );
                    setDraft((d) => ({
                      ...d,
                      pin: { x, y },
                      lat: (12.84 + (1 - y / 100) * 0.14).toFixed(4),
                      lng: (77.54 + (x / 100) * 0.14).toFixed(4),
                    }));
                  }}
                  className="border-border relative min-h-50 flex-1 cursor-crosshair overflow-hidden rounded-lg border"
                  style={{ background: 'linear-gradient(135deg, #dbe7f3 0%, #cdddec 100%)' }}
                >
                  <svg width="100%" height="100%" className="absolute inset-0 opacity-50">
                    <path
                      d="M0 60 L400 90 M0 130 L400 100 M120 0 L150 240 M260 0 L240 240"
                      stroke="#9fb6cd"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                  <div
                    className="text-d-500 absolute -translate-x-1/2 -translate-y-full"
                    style={{ top: `${draft.pin.y}%`, left: `${draft.pin.x}%` }}
                  >
                    <Icon name="map-pin" size={36} />
                  </div>
                  <span className="text-caption text-text-muted absolute right-3 bottom-2.5">
                    Click to drop pin
                  </span>
                </div>
              </div>
            </Card>

            <Card pad={28}>
              <SettingsHead info="Medibook releases online-booking settlements to this account. Operations sees these details (masked) on your hospital profile.">
                Bank & Payouts
              </SettingsHead>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5.5">
                <Field label="Account Holder Name">
                  <TextInput
                    value={draft.bank.accountName || ''}
                    onChange={(v) => setBank('accountName', v)}
                  />
                </Field>
                <Field label="Bank">
                  <TextInput value={draft.bank.bank || ''} onChange={(v) => setBank('bank', v)} />
                </Field>
                <Field label="Account Number">
                  <TextInput
                    value={draft.bank.account || ''}
                    onChange={(v) => setBank('account', v)}
                  />
                </Field>
                <Field label="IFSC Code">
                  <TextInput value={draft.bank.ifsc || ''} onChange={(v) => setBank('ifsc', v)} />
                </Field>
                <Field label="Settlement UPI ID (optional)">
                  <TextInput value={draft.bank.upi || ''} onChange={(v) => setBank('upi', v)} />
                </Field>
              </div>
              <div className="text-caption text-text-muted bg-y-100 mt-4.5 flex items-center gap-2 rounded-md px-3 py-2.5">
                <Icon name="lock" size={15} className="text-y-700 flex-none" /> Settlement payouts
                pause if these details are missing or invalid — keep them current.
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDraft(saved)}>
                Cancel
              </Button>
              <Button onClick={save}>Save Changes</Button>
            </div>
          </>
        )}

        {sec === 'Working Hours' && (
          <Card pad={28}>
            <SettingsHead info="Hospital-level hours. Department and doctor schedules override these — the app uses the most specific (Doctor → Department → Hospital).">
              Hospital Working Hours
            </SettingsHead>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-body text-text-muted">Default open</span>
              <div className="w-30">
                <Select
                  value={draft.hoursOpen}
                  options={['7:00 am', '8:00 am', '9:00 am']}
                  onChange={(v) => set('hoursOpen', v)}
                  height={40}
                />
              </div>
              <span className="text-body text-text-muted">to</span>
              <div className="w-30">
                <Select
                  value={draft.hoursClose}
                  options={['6:00 pm', '8:00 pm', '10:00 pm']}
                  onChange={(v) => set('hoursClose', v)}
                  height={40}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className="border-border-soft flex items-center gap-4 rounded-md border px-4 py-3"
                >
                  <span className="text-body text-text-strong w-27.5 font-medium">{d}</span>
                  <Toggle
                    value={draft.hoursDays[i]}
                    onChange={(v) =>
                      set(
                        'hoursDays',
                        draft.hoursDays.map((x, j) => (j === i ? v : x)),
                      )
                    }
                  />
                  <span className="flex-1"></span>
                  <span
                    className={cn(
                      'text-body',
                      draft.hoursDays[i] ? 'text-text-body' : 'text-text-faint',
                    )}
                  >
                    {draft.hoursDays[i] ? `${draft.hoursOpen} — ${draft.hoursClose}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5.5 flex justify-end">
              <Button onClick={save}>Save Hours</Button>
            </div>
          </Card>
        )}

        {sec === 'Management' && (
          <Card pad={8}>
            {MANAGE_LINKS.map(([t, d, view, ic], i) => (
              <div
                key={t}
                onClick={() => onNavigate(view)}
                className={cn(
                  'hover:bg-grey-200 flex cursor-pointer items-center gap-3.5 rounded-md px-4.5 py-4 transition-colors duration-150',
                  i < MANAGE_LINKS.length - 1 && 'border-border-soft border-b',
                )}
              >
                <div className="bg-blue-soft-bg text-blue flex size-10 flex-none items-center justify-center rounded-md">
                  <Icon name={ic} size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-body text-text-strong font-medium">{t}</div>
                  <div className="text-caption text-text-muted">{d}</div>
                </div>
                <Icon name="chevron-right" size={20} className="text-text-faint" />
              </div>
            ))}
          </Card>
        )}

        {sec === 'System Rules' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-muted">
                Hospital-wide defaults. A doctor's custom availability or fee settings override
                these.
              </span>
              <InfoDot text="These apply to every department and doctor unless a doctor has custom settings, which always take precedence." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RuleCard title="Appointment Rules" hint="Applies to all new appointments">
                <RuleRow label="Default consultation duration">
                  {sel(draft.rules.duration, ['10 mins', '15 mins', '20 mins', '30 mins'], (v) =>
                    setRule('duration', v),
                  )}
                </RuleRow>
                <RuleRow label="Online appointment booking">
                  <Toggle
                    value={draft.rules.onlineBooking}
                    onChange={(v) => setRule('onlineBooking', v)}
                  />
                </RuleRow>
                <RuleRow label="Max appointments per slot">
                  {sel(
                    draft.rules.maxPerSlot,
                    ['5 slots', '10 slots', '15 slots', '20 slots'],
                    (v) => setRule('maxPerSlot', v),
                  )}
                </RuleRow>
                <RuleRow label="Buffer time between appointments" last>
                  {sel(draft.rules.buffer, ['0 mins', '5 mins', '10 mins', '15 mins'], (v) =>
                    setRule('buffer', v),
                  )}
                </RuleRow>
              </RuleCard>
              <RuleCard title="Cancellation & No-show Rules">
                <RuleRow label="Allow patient cancellation">
                  <Toggle
                    value={draft.rules.allowCancel}
                    onChange={(v) => setRule('allowCancel', v)}
                  />
                </RuleRow>
                <RuleRow label="Cancellation allowed before">
                  {sel(
                    draft.rules.cancelBefore,
                    ['1 hour', '2 hours', '4 hours', '24 hours'],
                    (v) => setRule('cancelBefore', v),
                  )}
                </RuleRow>
                <RuleRow label="Auto mark No-show after" last>
                  {sel(draft.rules.autoNoShow, ['30 mins', '1 hour', '2 hours'], (v) =>
                    setRule('autoNoShow', v),
                  )}
                </RuleRow>
              </RuleCard>
              <RuleCard title="Token Queue Behaviour" hint="Applies to all departments">
                <RuleRow label="Token generation">
                  {sel(draft.rules.tokenGen, ['Auto', 'Manual'], (v) => setRule('tokenGen', v))}
                </RuleRow>
                <RuleRow label="Show token number to patient">
                  <Toggle value={draft.rules.showToken} onChange={(v) => setRule('showToken', v)} />
                </RuleRow>
                <RuleRow label="Allow hold token">
                  <Toggle value={draft.rules.allowHold} onChange={(v) => setRule('allowHold', v)} />
                </RuleRow>
                <RuleRow label="Hold timeout">
                  {sel(draft.rules.holdTimeout, ['15 mins', '30 mins', '45 mins'], (v) =>
                    setRule('holdTimeout', v),
                  )}
                </RuleRow>
                <RuleRow label="Grace period">
                  {sel(draft.rules.grace, ['15 mins', '30 mins', '45 mins'], (v) =>
                    setRule('grace', v),
                  )}
                </RuleRow>
                <RuleRow label="After grace" last>
                  {sel(draft.rules.afterGrace, ['Auto Mark No-show', 'Keep waiting'], (v) =>
                    setRule('afterGrace', v),
                  )}
                </RuleRow>
              </RuleCard>
              <RuleCard
                title="Consultation Fees"
                hint="Default OP fee for doctors without a custom fee"
              >
                <RuleRow label="OP Consultation Fee">
                  <div className="w-32.5">
                    <TextInput
                      value={'₹ ' + draft.rules.opFee}
                      onChange={(v) => setRule('opFee', v.replace(/[^0-9]/g, ''))}
                      height={40}
                    />
                  </div>
                </RuleRow>
                <RuleRow label="Validity (days)">
                  <div className="w-32.5">
                    <TextInput
                      value={draft.rules.feeValidity}
                      onChange={(v) => setRule('feeValidity', v)}
                      height={40}
                    />
                  </div>
                </RuleRow>
                <RuleRow label="Apply to all departments" last>
                  <Toggle
                    value={draft.rules.applyAllDepts}
                    onChange={(v) => setRule('applyAllDepts', v)}
                  />
                </RuleRow>
              </RuleCard>
            </div>
            <div className="flex justify-end">
              <Button onClick={save}>Save Rules</Button>
            </div>
          </>
        )}

        {sec === 'Notifications' && (
          <>
            <Card pad={28}>
              <SettingsHead info="Messages the hospital sends to patients via the Medibook app.">
                Patient Communications
              </SettingsHead>
              {PATIENT_COMMS.map(([k, t, s]) => (
                <div key={k} className="border-border-soft flex items-center gap-4 border-b py-4">
                  <div className="flex-1">
                    <div className="text-body text-text-strong font-medium">{t}</div>
                    <div className="text-caption text-text-muted">{s}</div>
                  </div>
                  <Toggle value={draft.notify[k]} onChange={(v) => setNote(k, v)} />
                </div>
              ))}
            </Card>
            <Card pad={28}>
              <SettingsHead info="Alerts for the hospital admin about billing & settlements.">
                Admin Alerts
              </SettingsHead>
              {ADMIN_ALERTS.map(([k, t, s]) => (
                <div key={k} className="border-border-soft flex items-center gap-4 border-b py-4">
                  <div className="flex-1">
                    <div className="text-body text-text-strong font-medium">{t}</div>
                    <div className="text-caption text-text-muted">{s}</div>
                  </div>
                  <Toggle value={draft.notify[k]} onChange={(v) => setNote(k, v)} />
                </div>
              ))}
            </Card>
            <div className="flex justify-end">
              <Button onClick={save}>Save Preferences</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
