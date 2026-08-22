import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { OpsField } from '@/shared/ui/OpsField';
import { SegTabs } from '@/shared/ui/SegTabs';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { Toggle } from '@/shared/ui/Toggle';

import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import type { Plan } from '@/features/ops-plans/application/store/plans.types';

/** Editable form shape — money fields stay strings until submit parses them. */
interface PlanForm {
  name: string;
  price: string;
  quota: string;
  staff: string;
  support: string;
  extra: string;
  custom: boolean;
  popular: boolean;
}

/** Inline validation messages keyed by the field they belong to. */
type PlanErrors = Partial<Record<keyof PlanForm, string>>;

/** Blank form (module-level so the reset effect stays dependency-stable). */
const BLANK: PlanForm = {
  name: '',
  price: '',
  quota: '',
  staff: 'Up to 25 staff accounts',
  support: 'Email support',
  extra: '',
  custom: false,
  popular: false,
};

const STAFF_OPTIONS = [
  'Up to 25 staff accounts',
  'Up to 120 staff accounts',
  'Unlimited staff accounts',
] as const;

const SUPPORT_OPTIONS = ['Email support', 'Priority support', 'Dedicated success manager'] as const;

interface PlanModalProps {
  open: boolean;
  /** The plan being edited, or `null` to create a new one. */
  plan: Plan | null;
  onClose: () => void;
  onDone: () => void;
}

/**
 * Create / edit a subscription plan (design `Ops.jsx` `PlanModal`): the
 * Standard | Hospital-specific segmented toggle, the custom-plan info strip,
 * the Most Popular switch, required-field + duplicate-name validation and the
 * fake-latency save.
 */
export function PlanModal({ open, plan, onClose, onDone }: PlanModalProps) {
  const plans = usePlansStore((s) => s.plans);
  const savePlan = usePlansStore((s) => s.savePlan);

  const [f, setF] = useState<PlanForm>(BLANK);
  const [err, setErr] = useState<PlanErrors>({});
  const [busy, run] = useOpsAct();
  const isNew = !plan;

  useEffect(() => {
    if (!open) return;
    setF(
      plan
        ? {
            name: plan.name,
            price: String(plan.price),
            quota: String(plan.quota),
            staff: plan.staff,
            support: plan.support,
            extra: plan.extra,
            custom: plan.custom,
            popular: plan.popular,
          }
        : BLANK,
    );
    setErr({});
  }, [open, plan]);

  const upd = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr((e) => ({ ...e, [k]: undefined }));
  };

  const submit = () => {
    const price = parseInt(f.price.replace(/[^0-9]/g, ''), 10);
    const quota = parseInt(f.quota.replace(/[^0-9]/g, ''), 10);
    const e: PlanErrors = {
      name: f.name.trim() ? undefined : 'Plan name is required.',
      price: price > 0 ? undefined : 'Enter a monthly price.',
      quota: quota > 0 ? undefined : 'Enter a monthly booking quota.',
    };
    if (
      !e.name &&
      plans.some(
        (p) =>
          p.name.trim().toLowerCase() === f.name.trim().toLowerCase() &&
          (isNew || p.id !== plan?.id),
      )
    ) {
      e.name = 'A plan with this name already exists.';
    }
    setErr(e);
    if (e.name || e.price || e.quota) return;
    run(
      'plan',
      isNew ? `Plan "${f.name.trim()}" created.` : `Plan "${f.name.trim()}" updated.`,
      () => {
        const base = {
          name: f.name.trim(),
          price,
          quota,
          staff: f.staff,
          support: f.support,
          extra: f.extra,
          popular: f.popular,
          custom: f.custom,
        };
        savePlan(plan ? { id: plan.id, ...base } : base);
        onDone();
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={plan ? `Edit ${plan.name}` : 'Create Plan'}
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={busy.plan ? undefined : submit}
            className={cn(busy.plan && 'cursor-not-allowed opacity-50')}
          >
            {busy.plan ? 'Saving…' : isNew ? 'Create Plan' : 'Save Plan'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SegTabs
            tabs={['Standard', 'Hospital-specific']}
            value={f.custom ? 'Hospital-specific' : 'Standard'}
            onChange={(v) => upd('custom', v === 'Hospital-specific')}
          />
          <label className="flex cursor-pointer items-center gap-2.5">
            <Toggle value={f.popular} onChange={(v) => upd('popular', v)} />
            <span className="text-body text-text-body">Mark as Most Popular</span>
          </label>
        </div>
        {f.custom && (
          <div className="text-caption text-text-muted bg-blue-soft-bg flex items-start gap-2 rounded-sm px-3 py-2.5">
            <Icon name="info" size={14} className="mt-px flex-none" /> Hospital-specific plans are
            negotiated per tenant — put the hospital in the name (e.g. &quot;Custom — Apollo
            Hospital&quot;) so it&apos;s recognisable everywhere plans appear.
          </div>
        )}
        <OpsField label="Plan Name" required error={err.name}>
          <TextInput
            value={f.name}
            onChange={(v) => upd('name', v)}
            placeholder={f.custom ? 'e.g. Custom — Apollo Hospital' : 'e.g. Growth'}
            height={48}
          />
        </OpsField>
        <div className="grid grid-cols-2 gap-4">
          <OpsField label="Monthly Price (₹)" required error={err.price}>
            <TextInput
              value={f.price}
              onChange={(v) => upd('price', v)}
              placeholder="e.g. 24999"
              height={48}
            />
          </OpsField>
          <OpsField label="Bookings / Month" required error={err.quota}>
            <TextInput
              value={f.quota}
              onChange={(v) => upd('quota', v)}
              placeholder="e.g. 5000"
              height={48}
            />
          </OpsField>
          <OpsField label="Staff Accounts">
            <Select
              value={f.staff}
              options={STAFF_OPTIONS}
              onChange={(v) => upd('staff', v)}
              height={48}
            />
          </OpsField>
          <OpsField label="Support Level">
            <Select
              value={f.support}
              options={SUPPORT_OPTIONS}
              onChange={(v) => upd('support', v)}
              height={48}
            />
          </OpsField>
        </div>
        <OpsField label="Extra Feature Line (optional)">
          <TextInput
            value={f.extra}
            onChange={(v) => upd('extra', v)}
            placeholder="e.g. Advanced analytics"
            height={48}
          />
        </OpsField>
      </div>
    </Modal>
  );
}
