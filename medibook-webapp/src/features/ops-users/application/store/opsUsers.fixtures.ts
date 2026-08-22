/**
 * Seed data for internal Medibook users & roles — transcribed verbatim from
 * the design prototype's `OpsDB.users`, `OPS_USER`, `OPS_ROLE_INFO` and the
 * OpsUsers permission matrix (Ops.jsx). Avatar paths point at `public/assets`.
 */
import type {
  OpsCurrentUser,
  OpsPermissionRow,
  OpsRole,
  OpsRoleInfo,
  OpsUser,
} from '@/features/ops-users/application/store/opsUsers.types';

export const OPS_USERS: readonly OpsUser[] = [
  {
    id: 1,
    name: 'Riya Sharma',
    email: 'riya.sharma@medibook.in',
    role: 'Super Admin',
    twofa: 'Enabled',
    lastActive: 'Just now',
    status: 'Active',
    av: null,
  },
  {
    id: 2,
    name: 'Anil Kapoor',
    email: 'anil.kapoor@medibook.in',
    role: 'Super Admin',
    twofa: 'Enabled',
    lastActive: '2 hrs ago',
    status: 'Active',
    av: '/assets/avatar-2.jpg',
  },
  {
    id: 3,
    name: 'Meera Pillai',
    email: 'meera.pillai@medibook.in',
    role: 'Finance Admin',
    twofa: 'Enabled',
    lastActive: '1 day ago',
    status: 'Active',
    av: '/assets/avatar-3.jpg',
  },
  {
    id: 4,
    name: 'Nisha Verma',
    email: 'nisha.verma@medibook.in',
    role: 'Finance Admin',
    twofa: 'Pending',
    lastActive: '3 days ago',
    status: 'Pending',
    av: '/assets/avatar-4.jpg',
  },
  {
    id: 5,
    name: 'Dev Trivedi',
    email: 'dev.trivedi@medibook.in',
    role: 'Support',
    twofa: 'Enabled',
    lastActive: '5 hrs ago',
    status: 'Active',
    av: null,
  },
  {
    id: 6,
    name: 'Kavya Reddy',
    email: 'kavya.reddy@medibook.in',
    role: 'Support',
    twofa: 'Pending',
    lastActive: '1 week ago',
    status: 'Suspended',
    av: null,
  },
  {
    id: 7,
    name: 'Sameer Joshi',
    email: 'sameer.joshi@medibook.in',
    role: 'Auditor',
    twofa: 'Enabled',
    lastActive: '2 days ago',
    status: 'Active',
    av: null,
  },
];

/** The signed-in operations user (design `OPS_USER`). */
export const OPS_USER: OpsCurrentUser = {
  name: 'Riya Sharma',
  role: 'Super Admin',
  av: null,
};

/**
 * Role annotations — shown wherever a role is picked, so access is explicit
 * before assigning (design `OPS_ROLE_INFO`).
 */
export const OPS_ROLE_INFO: Readonly<Record<OpsRole, OpsRoleInfo>> = {
  'Super Admin': {
    desc: 'Full platform control.',
    can: [
      'Hospitals, KYC & suspension',
      'Plans, billing, settlements & payout runs',
      'Patient accounts including detail views',
      'Notifications, logs, users & platform settings',
    ],
    cant: [],
  },
  'Finance Admin': {
    desc: 'Money operations only.',
    can: ['Subscription billing & invoices', 'Settlement releases & payout runs'],
    cant: ['Hospital management & KYC', 'Patient accounts', 'Platform settings'],
  },
  Support: {
    desc: 'Front line for hospital assistance.',
    can: [
      'Hospitals & their requests (view)',
      'Patient account list — not detail',
      'App banners & push notifications',
    ],
    cant: ['Billing & settlements', 'Platform settings'],
  },
  Auditor: {
    desc: 'Read-only compliance access.',
    can: ['Compliance logs & audit trail'],
    cant: ['Everything else — no write access anywhere'],
  },
};

/**
 * Role-permission matrix rows (design OpsUsers `perms`):
 * `[permission, Super Admin, Finance Admin, Support, Auditor]`.
 */
export const OPS_ROLE_PERMS: readonly OpsPermissionRow[] = [
  ['Manage hospitals & verification', 1, 0, 0, 0],
  ['Billing & settlements', 1, 1, 0, 0],
  ['App banners & push notifications', 1, 0, 1, 0],
  ['View patient accounts (list)', 1, 0, 1, 0],
  ['View patient account detail', 1, 0, 0, 0],
  ['View compliance logs', 1, 0, 0, 1],
  ['Manage settings', 1, 0, 0, 0],
];
