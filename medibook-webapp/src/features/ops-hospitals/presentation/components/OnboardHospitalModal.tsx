import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { OpsField } from '@/shared/ui/OpsField';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';

import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import { useHospitalsStore } from '@/features/ops-hospitals/application/store/hospitals.store';

/**
 * Onboard Hospital modal (design `OnboardHospitalModal`, Ops.jsx). Creates a
 * Pending-verification instance with all-Missing KYC via the hospitals store;
 * the success toast + fake latency come from `useOpsAct`, as in the prototype.
 */

/** Ops inline validators (design `vReqOps` / `vEmailOps`, Ops.jsx). Feature-local — not yet in shared. */
const vEmailOps = (v: string): string | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ? null : 'Enter a valid email address.';
const vReqOps = (v: string, msg: string): string | null => (v && String(v).trim() ? null : msg);

interface OnboardForm {
  name: string;
  email: string;
  city: string;
  plan: string;
}

interface OnboardErrors {
  name?: string | null;
  email?: string | null;
  city?: string | null;
}

const BLANK: OnboardForm = { name: '', email: '', city: '', plan: 'Starter' };

interface OnboardHospitalModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

export function OnboardHospitalModal({ open, onClose, onDone }: OnboardHospitalModalProps) {
  const [f, setF] = useState<OnboardForm>(BLANK);
  const [err, setErr] = useState<OnboardErrors>({});
  const [busy, run] = useOpsAct();
  const plans = usePlansStore((s) => s.plans);
  const onboardHospital = useHospitalsStore((s) => s.onboardHospital);

  useEffect(() => {
    if (open) {
      setF(BLANK);
      setErr({});
    }
  }, [open]);

  const submit = () => {
    const e: OnboardErrors = {
      name: vReqOps(f.name, 'Hospital name is required.'),
      email: vEmailOps(f.email),
      city: vReqOps(f.city, 'City is required.'),
    };
    setErr(e);
    if (e.name || e.email || e.city) return;
    run('ob', `${f.name} onboarded. KYC verification pending.`, () => {
      onboardHospital(f);
      onDone();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Onboard Hospital"
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={busy.ob ? undefined : submit}
            className={cn(busy.ob && 'cursor-not-allowed opacity-50')}
          >
            {busy.ob ? 'Onboarding…' : 'Onboard Hospital'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <OpsField label="Hospital Name" required error={err.name}>
          <TextInput
            value={f.name}
            onChange={(v) => {
              setF({ ...f, name: v });
              setErr({ ...err, name: null });
            }}
            placeholder="e.g. Sunrise Multispeciality"
            height={48}
          />
        </OpsField>
        <OpsField label="Admin Email" required error={err.email}>
          <TextInput
            value={f.email}
            onChange={(v) => {
              setF({ ...f, email: v });
              setErr({ ...err, email: null });
            }}
            placeholder="admin@hospital.in"
            height={48}
          />
        </OpsField>
        <div className="grid grid-cols-2 gap-4">
          <OpsField label="City" required error={err.city}>
            <TextInput
              value={f.city}
              onChange={(v) => {
                setF({ ...f, city: v });
                setErr({ ...err, city: null });
              }}
              placeholder="e.g. Pune"
              height={48}
            />
          </OpsField>
          <OpsField label="Subscription Plan">
            <Select
              value={f.plan}
              options={plans.map((p) => p.name)}
              onChange={(v) => setF({ ...f, plan: v })}
              height={48}
            />
          </OpsField>
        </div>
        <div className="text-caption text-text-muted bg-blue-soft-bg flex items-start gap-2 rounded-sm px-3 py-2.5">
          <Icon name="info" size={14} className="mt-px flex-none" /> The hospital lands in Pending
          verification. KYC documents (registration, GST, licence, bank proof) are requested from
          the admin email and must all be submitted before approval.
        </div>
      </div>
    </Modal>
  );
}
