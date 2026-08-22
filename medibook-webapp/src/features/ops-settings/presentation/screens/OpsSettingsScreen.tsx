import { useState } from 'react';

import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { OpsField } from '@/shared/ui/OpsField';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';
import { Toggle } from '@/shared/ui/Toggle';

import { useOpsSettingsStore } from '@/features/ops-settings/application/store/opsSettings.store';
import type {
  OpsSettings,
  PayoutSchedule,
  SessionTimeout,
} from '@/features/ops-settings/application/store/opsSettings.types';

/** Boolean-valued notification keys of the settings record. */
type NotifKey = 'notifSettle' | 'notifCompliance' | 'notifDigest';

/** Per-field inline validation messages. */
type FieldErrors = Partial<Record<keyof OpsSettings, string | null>>;

const NOTIF_TOGGLES: readonly { key: NotifKey; title: string; desc: string }[] = [
  {
    key: 'notifSettle',
    title: 'Settlement alerts',
    desc: 'Notify when a payout fails or is on hold.',
  },
  {
    key: 'notifCompliance',
    title: 'Compliance alerts',
    desc: 'Notify on critical audit events in real time.',
  },
  { key: 'notifDigest', title: 'Weekly digest', desc: 'Platform summary every Monday at 09:00.' },
];

const vEmailOps = (v: string): string | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ? null : 'Enter a valid email address.';

const vCommission = (v: string): string | null => {
  const n = Number(v);
  return v !== '' && !Number.isNaN(n) && n >= 0 && n <= 100
    ? null
    : 'Enter a value between 0 and 100.';
};

const vGst = (v: string): string | null =>
  String(v || '').replace(/\s/g, '').length === 15 ? null : 'GST number must be 15 characters.';

/** Platform settings — Organisation, Payouts & Billing, Notifications, Security (Ops.jsx OpsSettings). */
export function OpsSettingsScreen() {
  const settings = useOpsSettingsStore((s) => s.settings);
  const save = useOpsSettingsStore((s) => s.save);
  const [f, setF] = useState<OpsSettings>({ ...settings });
  const [err, setErr] = useState<FieldErrors>({});
  const [busy, run] = useOpsAct();

  const keys = Object.keys(settings) as (keyof OpsSettings)[];
  const dirty = keys.some((k) => f[k] !== settings[k]);
  const disabled = !dirty || Boolean(busy.save);

  const upd = <K extends keyof OpsSettings>(k: K, v: OpsSettings[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr((p) => ({ ...p, [k]: null }));
  };

  const onSave = () => {
    const e: FieldErrors = {
      orgEmail: vEmailOps(f.orgEmail),
      commission: vCommission(f.commission),
      gst: vGst(f.gst),
    };
    setErr(e);
    if (e.orgEmail || e.commission || e.gst) return;
    run('save', 'Settings saved.', () => save(f));
  };

  const onDiscard = () => {
    setF({ ...settings });
    setErr({});
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle className="mb-4">Organisation</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <OpsField label="Platform Name">
            <TextInput value={f.orgName} onChange={(v) => upd('orgName', v)} height={48} />
          </OpsField>
          <OpsField label="Support Email" error={err.orgEmail}>
            <TextInput value={f.orgEmail} onChange={(v) => upd('orgEmail', v)} height={48} />
          </OpsField>
          <OpsField label="Helpline Number">
            <TextInput value={f.orgPhone} onChange={(v) => upd('orgPhone', v)} height={48} />
          </OpsField>
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4">Payouts &amp; Billing</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <OpsField label="Payout Schedule">
            <Select
              value={f.payoutSched}
              options={['Weekly', 'Fortnightly', 'Monthly']}
              onChange={(v) => upd('payoutSched', v as PayoutSchedule)}
              height={48}
            />
          </OpsField>
          <OpsField label="Platform Commission (%)" error={err.commission}>
            <TextInput value={f.commission} onChange={(v) => upd('commission', v)} height={48} />
          </OpsField>
          <OpsField label="GST Number" error={err.gst}>
            <TextInput value={f.gst} onChange={(v) => upd('gst', v)} height={48} />
          </OpsField>
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4.5">Notifications</SectionTitle>
        <div className="flex flex-col gap-4.5">
          {NOTIF_TOGGLES.map(({ key, title, desc }) => (
            <div key={key} className="flex items-start gap-3">
              <Toggle value={f[key]} onChange={(v) => upd(key, v)} />
              <div className="flex flex-col gap-0.5">
                <span className="text-body text-text-strong font-medium">{title}</span>
                <span className="text-caption text-text-muted">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4.5">Security</SectionTitle>
        <div className="flex flex-col gap-4.5">
          <div className="flex items-start gap-3">
            <Toggle value={f.twoFAReq} onChange={(v) => upd('twoFAReq', v)} />
            <div className="flex flex-col gap-0.5">
              <span className="text-body text-text-strong font-medium">
                Require 2FA for all admins
              </span>
              <span className="text-caption text-text-muted">
                Admins without 2FA are prompted at next sign-in.
              </span>
            </div>
          </div>
          <div className="w-60">
            <OpsField label="Session Timeout">
              <Select
                value={f.sessTimeout}
                options={['15 min', '30 min', '60 min']}
                onChange={(v) => upd('sessTimeout', v as SessionTimeout)}
                height={48}
              />
            </OpsField>
          </div>
          <div className="border-border-soft flex items-center gap-3 border-t pt-4">
            <span className="text-body text-text-strong font-medium">API Key</span>
            <span className="text-body text-text-muted tabular-nums">mb_live_9f42••••••••7d1c</span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="secondary"
              icon="refresh-cw"
              onClick={() => toast('API key rotated. Update your gateway config.', 'success')}
            >
              Rotate Key
            </Button>
          </div>
        </div>
      </Card>

      <div className="border-border shadow-pop sticky bottom-0 z-10 flex items-center gap-2.5 rounded-lg border bg-white px-5 py-3">
        {busy.save ? (
          <span className="text-caption text-text-muted">Saving…</span>
        ) : dirty ? (
          <>
            <span className="bg-y-600 size-2 rounded-full" />
            <span className="text-caption text-text-muted">Unsaved changes</span>
          </>
        ) : (
          <span className="text-caption text-text-faint">All changes saved</span>
        )}
        <div className="flex-1" />
        <Button
          variant="secondary"
          onClick={disabled ? undefined : onDiscard}
          className={cn(disabled && 'cursor-not-allowed opacity-50')}
        >
          Discard
        </Button>
        <Button
          onClick={disabled ? undefined : onSave}
          className={cn(disabled && 'cursor-not-allowed opacity-50')}
        >
          {busy.save ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
