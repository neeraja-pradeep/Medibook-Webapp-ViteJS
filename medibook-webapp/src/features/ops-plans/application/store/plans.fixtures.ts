/**
 * Seed data for subscription plans — transcribed verbatim from the design
 * prototype's `OpsDB.plans` / `OpsDB.planChanges` (Ops.jsx). `hid` values are
 * materialized from the prototype's `OPS_NAME_TO_ID` back-fill.
 */
import type { Plan, PlanChange } from '@/features/ops-plans/application/store/plans.types';

export const OPS_PLANS: readonly Plan[] = [
  {
    id: 1,
    name: 'Starter',
    price: 9999,
    quota: 1500,
    staff: 'Up to 25 staff accounts',
    support: 'Email support',
    extra: 'Standard reports',
    popular: false,
    custom: false,
  },
  {
    id: 2,
    name: 'Growth',
    price: 24999,
    quota: 5000,
    staff: 'Up to 120 staff accounts',
    support: 'Priority support',
    extra: 'Advanced analytics',
    popular: true,
    custom: false,
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 49999,
    quota: 8000,
    staff: 'Unlimited staff accounts',
    support: 'Dedicated success manager',
    extra: 'Custom integrations',
    popular: false,
    custom: false,
  },
  {
    id: 4,
    name: 'Custom — Trinity Care',
    price: 59999,
    quota: 10000,
    staff: 'Unlimited staff accounts',
    support: 'Dedicated success manager',
    extra: 'Negotiated SLA & integrations',
    popular: false,
    custom: true,
  },
];

export const OPS_PLAN_CHANGES: readonly PlanChange[] = [
  {
    id: 1,
    hid: 7,
    hospital: 'Vasudha Medical Centre',
    email: 'care@vasudhamed.in',
    change: 'Starter → Growth',
    requested: 'June 12, 2026',
    status: 'Completed',
  },
  {
    id: 2,
    hid: 12,
    hospital: 'Charak Institute of Medicine',
    email: 'admin@charakim.in',
    change: 'Growth → Enterprise',
    requested: 'June 10, 2026',
    status: 'Pending',
  },
  {
    id: 3,
    hid: 10,
    hospital: 'Padma Eye Foundation',
    email: 'appointments@padmaeye.in',
    change: 'Growth → Starter',
    requested: 'June 06, 2026',
    status: 'Completed',
  },
  {
    id: 4,
    hid: 9,
    hospital: 'Girnar Multispeciality',
    email: 'admin@girnarmsp.in',
    change: 'Starter → Growth',
    requested: 'June 02, 2026',
    status: 'Cancelled',
  },
];
