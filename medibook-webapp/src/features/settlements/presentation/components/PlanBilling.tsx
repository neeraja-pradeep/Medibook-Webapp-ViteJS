import { useState } from 'react';

import { APOLLO_HID } from '@/core/config/demo';
import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { InfoDot } from '@/shared/ui/InfoDot';
import { Modal } from '@/shared/ui/Modal';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Select } from '@/shared/ui/Select';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { toast } from '@/shared/ui/toast/toast.store';

import { useHospitalsStore } from '@/features/ops-hospitals/application/store/hospitals.store';
import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import { useSettingsStore } from '@/features/settings/application/store/settings.store';
import { useSettlementsStore } from '@/features/settlements/application/store/settlements.store';

/** Hard-coded plan-invoice history (design literal rows). */
const INVOICES = [
  { id: 'INV-2026-0244', date: '01 Jun 2026', plan: 'Growth · Monthly', amount: 24999 },
  { id: 'INV-2026-0219', date: '01 May 2026', plan: 'Growth · Monthly', amount: 24999 },
  { id: 'INV-2026-0198', date: '01 Apr 2026', plan: 'Growth · Monthly', amount: 24999 },
] as const;

/**
 * Plan & Billing tab — the hospital's subscription hero card, quota bar,
 * plan invoices and request-plan-change flow. Mirrors the live ops plan
 * catalog + Apollo's registry record (one shared plan world).
 */
export function PlanBilling() {
  const hospitals = useHospitalsStore((s) => s.hospitals);
  const plans = usePlansStore((s) => s.plans);
  const gstin = useSettingsStore((s) => s.settings.gstin);
  const req = useSettlementsStore((s) => s.planChangeReq);
  const requestPlanChange = useSettlementsStore((s) => s.requestPlanChange);

  const apolloRec = hospitals.find((h) => h.id === APOLLO_HID);
  const planName = apolloRec ? apolloRec.plan : 'Growth';
  const planDef = plans.find((p) => p.name === planName);
  const price = planDef ? planDef.price : 24999;
  const quotaUsed = 3120;
  const quotaTotal = planDef ? planDef.quota : 5000;
  const pct = Math.round((quotaUsed / quotaTotal) * 100);
  const planOptions = plans.map((p) => p.name).filter((n) => n !== planName);

  const [reqOpen, setReqOpen] = useState(false);
  const [reqTo, setReqTo] = useState('');

  return (
    <div className="flex flex-col gap-5">
      <Card pad={0} className="overflow-hidden">
        <div className="bg-p-500 flex items-center justify-between p-6 text-white">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-h2 text-white">{planName} Plan</span>
              <span className="text-caption rounded-full bg-white/20 px-2.5 py-0.75">Active</span>
            </div>
            <div className="text-body mt-1 text-white/80">Billed monthly · managed by Medibook</div>
          </div>
          <div className="text-[26px] font-bold text-white tabular-nums">
            {money(price)}
            <span className="text-body font-normal text-white/70">/mo</span>
          </div>
        </div>
        <div className="flex gap-7 p-6">
          <div className="flex-1">
            <div className="mb-2.5 flex items-center gap-1.75">
              <span className="text-body text-text-strong font-medium">
                Online Bookings This Month
              </span>
              <InfoDot text="Each appointment booked through the Medibook patient app uses one booking from the monthly plan quota. Walk-ins booked at the desk do not count. The quota resets on the 1st." />
            </div>
            <div className="bg-grey-300 h-3 overflow-hidden rounded-full">
              <div
                className={cn('h-full rounded-full', pct > 85 ? 'bg-d-500' : 'bg-blue')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-body text-text-muted mt-2 flex justify-between">
              <span className="text-text-strong font-semibold tabular-nums">
                {quotaUsed.toLocaleString('en-IN')} used ({pct}%)
              </span>
              <span className="tabular-nums">of {quotaTotal.toLocaleString('en-IN')} / month</span>
            </div>
          </div>
          <div className="bg-border-soft w-px" />
          <div className="flex flex-1 flex-col justify-center gap-3.5">
            <div className="flex justify-between">
              <span className="text-body text-text-muted">Billing cycle</span>
              <span className="text-body text-text-strong font-medium">
                Monthly · invoiced on the 1st
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-text-muted">Next invoice</span>
              <span className="text-body text-text-strong font-medium">01 Jul 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body text-text-muted">Status</span>
              <Badge status="Active" />
            </div>
          </div>
        </div>
        <div className="text-caption text-text-muted flex items-center gap-2 px-6 pb-5">
          <Icon name="info" size={15} className="text-blue" /> Plan tiers and pricing are managed by
          Medibook operations.
          <span className="flex-1" />
          {req ? (
            <span className="text-caption text-y-700 bg-y-100 rounded-full px-3 py-1.5">
              Change to {req.to} requested · pending Medibook review
            </span>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              icon="send"
              onClick={() => {
                setReqTo('');
                setReqOpen(true);
              }}
            >
              Request Plan Change
            </Button>
          )}
        </div>
      </Card>

      <Card pad={24}>
        <SectionTitle size={16} className="mb-1">
          Plan Invoices
        </SectionTitle>
        <div className="text-caption text-text-muted mb-4">
          Billed to GSTIN {gstin || '—'} · Medibook GSTIN 27AABCM9407L1ZK · 18% GST included
        </div>
        <TableShell columns={['Invoice', 'Date', 'Plan', 'Amount', '']} rightCols={['Amount']}>
          {INVOICES.map((r) => (
            <tr key={r.id}>
              <td className={cn(tdClass, 'text-blue font-medium')}>{r.id}</td>
              <td className={tdClass}>{r.date}</td>
              <td className={tdClass}>{r.plan}</td>
              <td className={cn(tdClass, 'text-right font-semibold tabular-nums')}>
                {money(r.amount)}
              </td>
              <td className={tdClass}>
                <Badge status="Paid" />
              </td>
              <td className={tdClass}>
                <span className="text-caption text-blue inline-flex cursor-pointer items-center gap-1.25">
                  <Icon name="download" size={15} /> PDF
                </span>
              </td>
            </tr>
          ))}
        </TableShell>
      </Card>

      <Modal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        title="Request Plan Change"
        width={460}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReqOpen(false)}>
              Cancel
            </Button>
            <Button
              icon="send"
              onClick={() => {
                if (!reqTo) {
                  toast('Pick the plan you want', 'error');
                  return;
                }
                requestPlanChange(reqTo);
                setReqOpen(false);
              }}
            >
              Send Request
            </Button>
          </>
        }
      >
        <p className="text-body-lg text-text-body m-0 mb-3.5">
          Current plan: <b>{planName}</b>.{' '}
          {"Medibook operations reviews and applies plan changes — you'll see the result here."}
        </p>
        <Field label="Requested Plan">
          <Select
            value={reqTo}
            placeholder="Select a plan"
            options={planOptions}
            onChange={setReqTo}
          />
        </Field>
      </Modal>
    </div>
  );
}
