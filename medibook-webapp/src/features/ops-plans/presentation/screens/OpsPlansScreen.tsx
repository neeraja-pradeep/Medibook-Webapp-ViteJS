import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { OpsConfirm, type OpsTint } from '@/shared/ui/OpsConfirm';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { toast } from '@/shared/ui/toast/toast.store';

import { opsHospitalDetailPath, opsPath } from '@/app/router/paths';

import {
  hospName,
  opsHospById,
  useHospitalsStore,
} from '@/features/ops-hospitals/application/store/hospitals.store';
import { usePlansStore } from '@/features/ops-plans/application/store/plans.store';
import type { Plan, PlanChange } from '@/features/ops-plans/application/store/plans.types';
import { PlanModal } from '@/features/ops-plans/presentation/components/PlanModal';

/**
 * Feature-local port of the design's `opsTintOf` (Ops.jsx) — cycles ops accent
 * tints by record id. Not in shared/ui yet; flagged for extraction when the
 * first shared consumer lands.
 */
const OPS_TINT_CYCLE = ['primary', 'info', 'success', 'warning', 'neutral'] as const;
const opsTintOf = (i: number): OpsTint => OPS_TINT_CYCLE[i % OPS_TINT_CYCLE.length];

/** Feature lines shown on a plan card (design `planFeatures`). */
const planFeatures = (p: Plan): string[] =>
  [p.quota.toLocaleString('en-IN') + ' bookings / month', p.staff, p.support, p.extra].filter(
    Boolean,
  );

/**
 * Subscription Plans (design `Ops.jsx` `OpsPlans`): the header strip + Create
 * Plan, the plan-card grid (Most Popular ring/badge, hospital-specific badge,
 * feature list, View Hospitals, edit, guarded delete) and the Recent Plan
 * Changes queue with Approve / Decline.
 */
export function OpsPlansScreen() {
  const navigate = useNavigate();
  const plans = usePlansStore((s) => s.plans);
  const planChanges = usePlansStore((s) => s.planChanges);
  const applyPlanChange = usePlansStore((s) => s.applyPlanChange);
  const deletePlan = usePlansStore((s) => s.deletePlan);
  const hospitals = useHospitalsStore((s) => s.hospitals);

  const [modal, setModal] = useState<Plan | 'new' | null>(null);
  const [delPlan, setDelPlan] = useState<Plan | null>(null);
  const [busy, run] = useOpsAct();

  const countFor = (name: string) => hospitals.filter((h) => h.plan === name).length;

  const goHosp = (hid: number) => {
    if (hid && opsHospById(hid)) navigate(opsHospitalDetailPath(hid));
  };

  const applyChange = (c: PlanChange, ok: boolean) =>
    run(
      `pc${c.id}`,
      ok
        ? `Plan change applied — ${hospName(c)} moved to ${c.change.split(' → ')[1]}.`
        : `Plan change declined for ${hospName(c)}.`,
      () => {
        applyPlanChange(c, ok);
      },
    );

  return (
    <div className="flex flex-col gap-5">
      <Card pad={14} className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-body text-text-muted">
          {plans.length} plan tiers · standard plans are public; hospital-specific plans are
          negotiated per tenant
        </span>
        <Button icon="plus" onClick={() => setModal('new')}>
          Create Plan
        </Button>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {plans.map((p) => {
          const ct = countFor(p.name);
          return (
            <div
              key={p.id}
              className={cn(
                'shadow-card flex flex-col gap-3.5 rounded-xl bg-white p-5',
                p.popular ? 'border-p-500 border-[1.5px]' : 'border-border border',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <SectionTitle size={16}>{p.name}</SectionTitle>
                {p.popular && (
                  <span className="text-tiny bg-p-500 flex-none rounded-full px-2.5 py-1 font-semibold tracking-[0.04em] text-white uppercase">
                    Most Popular
                  </span>
                )}
                {p.custom && (
                  <span className="text-tiny text-text-muted bg-grey-300 flex-none rounded-full px-2.5 py-1 font-semibold tracking-[0.04em] uppercase">
                    Hospital-specific
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-stat text-text-navy tabular-nums">{money(p.price)}</span>
                <span className="text-body text-text-muted">/ month</span>
              </div>
              <span className="text-caption text-text-faint">
                {ct === 0
                  ? 'No hospitals on this plan yet'
                  : `${ct} hospital${ct === 1 ? '' : 's'} on this plan`}
              </span>
              <div className="bg-border-soft h-px" />
              <div className="flex flex-col gap-2.5">
                {planFeatures(p).map((ft) => (
                  <div key={ft} className="flex items-center gap-2">
                    <Icon name="circle-check" size={16} className="text-g-600 flex-none" />
                    <span className="text-body text-text-body">{ft}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() =>
                    navigate(`${opsPath('hospitals')}?plan=${encodeURIComponent(p.name)}`)
                  }
                >
                  View Hospitals
                </Button>
                <IconBtn
                  name="pencil"
                  box={40}
                  size={16}
                  title="Edit plan"
                  onClick={() => setModal(p)}
                />
                <IconBtn
                  name="trash-2"
                  box={40}
                  size={16}
                  color="var(--color-d-500)"
                  title={ct > 0 ? 'Hospitals are on this plan' : 'Delete plan'}
                  onClick={() => {
                    if (ct > 0) {
                      toast(
                        `${ct} hospital${ct === 1 ? ' is' : 's are'} on this plan — move them to another plan first.`,
                        'error',
                      );
                    } else {
                      setDelPlan(p);
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Recent Plan Changes</SectionTitle>
          <span className="text-caption text-text-faint">Last 30 days</span>
        </div>
        <TableShell columns={['Hospital', 'Plan Change', 'Requested', 'Status', 'Action']}>
          {planChanges.map((c) => (
            <tr key={c.id}>
              <td
                onClick={() => goHosp(c.hid)}
                title="Open hospital profile"
                className={cn(tdClass, 'cursor-pointer')}
              >
                <OpsEntity
                  icon="building-2"
                  tint={opsTintOf(c.id)}
                  title={hospName(c)}
                  sub={c.email}
                />
              </td>
              <td className={tdClass}>{c.change}</td>
              <td className={tdClass}>{c.requested}</td>
              <td className={tdClass}>
                <Badge status={c.status} />
              </td>
              <td className={tdClass}>
                {c.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => applyChange(c, true)}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ color: 'var(--color-d-500)' }}
                      onClick={() => applyChange(c, false)}
                    >
                      Decline
                    </Button>
                  </div>
                ) : (
                  <span className="text-text-faint">—</span>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
      </Card>

      <PlanModal
        open={!!modal}
        plan={modal === 'new' ? null : modal}
        onClose={() => setModal(null)}
        onDone={() => setModal(null)}
      />
      <OpsConfirm
        open={!!delPlan}
        onClose={() => setDelPlan(null)}
        icon="trash-2"
        tone="danger"
        title="Delete this plan?"
        body={
          delPlan
            ? `"${delPlan.name}" is removed from the catalog. No hospitals are on it, so nothing else changes.`
            : ''
        }
        confirmLabel={busy.delplan ? 'Deleting…' : 'Delete Plan'}
        confirmVariant="danger"
        busy={busy.delplan}
        onConfirm={() => {
          if (!delPlan) return;
          const id = delPlan.id;
          run('delplan', 'Plan deleted.', () => {
            deletePlan(id);
            setDelPlan(null);
          });
        }}
      />
    </div>
  );
}
