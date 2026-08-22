/**
 * RBAC seed data, transcribed from the design prototype (`data.jsx`
 * `seedRoles()` / `seedUsers()`, `Rbac.jsx` `ROLE_COLORS`). The permission
 * grids the prototype built with blankPerms/fullPerms/permsFor/RW/VIEW are
 * materialized in full — every module x view/add/edit/del boolean. Role
 * colors are the concrete hex values of the design's CSS var tokens
 * because they feed data-driven inline styles.
 */

import type { HospitalUser, ModulePerms, PermsGrid, Role } from './rbac.types';

/**
 * Palette cycled for newly created roles (design `ROLE_COLORS`, CSS vars
 * replaced with their concrete hex values): blue, g-600, p-500, y-600,
 * blue-strong, orange.
 */
export const ROLE_COLORS: readonly string[] = [
  '#2563eb',
  '#16a34a',
  '#0e2a4a',
  '#d98512',
  '#2055ca',
  '#ea7c2b',
];

const noPerms = (): ModulePerms => ({ view: false, add: false, edit: false, del: false });

const allPerms = (): ModulePerms => ({ view: true, add: true, edit: true, del: true });

/** Design `blankPerms()` — every module fully denied (new-role editor baseline). */
export function blankPerms(): PermsGrid {
  return {
    Dashboard: noPerms(),
    Appointments: noPerms(),
    Patients: noPerms(),
    'Token Management': noPerms(),
    Payments: noPerms(),
    'Billing & Settlements': noPerms(),
    'Doctors & Departments': noPerms(),
    Reports: noPerms(),
    'Hospital Settings': noPerms(),
    'Users & Roles': noPerms(),
  };
}

/** Design `fullPerms()` — every module fully allowed (the Administrator grid). */
export function fullPerms(): PermsGrid {
  return {
    Dashboard: allPerms(),
    Appointments: allPerms(),
    Patients: allPerms(),
    'Token Management': allPerms(),
    Payments: allPerms(),
    'Billing & Settlements': allPerms(),
    'Doctors & Departments': allPerms(),
    Reports: allPerms(),
    'Hospital Settings': allPerms(),
    'Users & Roles': allPerms(),
  };
}

export const SEED_ROLES: readonly Role[] = [
  {
    id: 'r-admin',
    name: 'Administrator',
    color: '#d98512',
    desc: 'Full access to every module, settings and finance.',
    system: true,
    perms: {
      Dashboard: { view: true, add: true, edit: true, del: true },
      Appointments: { view: true, add: true, edit: true, del: true },
      Patients: { view: true, add: true, edit: true, del: true },
      'Token Management': { view: true, add: true, edit: true, del: true },
      Payments: { view: true, add: true, edit: true, del: true },
      'Billing & Settlements': { view: true, add: true, edit: true, del: true },
      'Doctors & Departments': { view: true, add: true, edit: true, del: true },
      Reports: { view: true, add: true, edit: true, del: true },
      'Hospital Settings': { view: true, add: true, edit: true, del: true },
      'Users & Roles': { view: true, add: true, edit: true, del: true },
    },
  },
  {
    id: 'r-reception',
    name: 'Reception / Billing',
    color: '#2563eb',
    desc: 'Front desk — books walk-ins, records payments, issues tokens.',
    perms: {
      Dashboard: { view: true, add: false, edit: false, del: false },
      Appointments: { view: true, add: true, edit: true, del: false },
      Patients: { view: true, add: true, edit: true, del: false },
      'Token Management': { view: true, add: false, edit: false, del: false },
      Payments: { view: true, add: true, edit: true, del: false },
      'Billing & Settlements': { view: false, add: false, edit: false, del: false },
      'Doctors & Departments': { view: false, add: false, edit: false, del: false },
      Reports: { view: false, add: false, edit: false, del: false },
      'Hospital Settings': { view: false, add: false, edit: false, del: false },
      'Users & Roles': { view: false, add: false, edit: false, del: false },
    },
  },
  {
    id: 'r-deptdesk',
    name: 'Department Front Desk',
    color: '#16a34a',
    desc: "Manages a department's live token queue and its appointments.",
    perms: {
      Dashboard: { view: true, add: false, edit: false, del: false },
      Appointments: { view: true, add: false, edit: true, del: false },
      Patients: { view: true, add: false, edit: false, del: false },
      'Token Management': { view: true, add: true, edit: true, del: false },
      Payments: { view: false, add: false, edit: false, del: false },
      'Billing & Settlements': { view: false, add: false, edit: false, del: false },
      'Doctors & Departments': { view: false, add: false, edit: false, del: false },
      Reports: { view: false, add: false, edit: false, del: false },
      'Hospital Settings': { view: false, add: false, edit: false, del: false },
      'Users & Roles': { view: false, add: false, edit: false, del: false },
    },
  },
  {
    id: 'r-accountant',
    name: 'Accountant',
    color: '#0e2a4a',
    desc: 'Payments, settlements and financial reports.',
    perms: {
      Dashboard: { view: true, add: false, edit: false, del: false },
      Appointments: { view: false, add: false, edit: false, del: false },
      Patients: { view: false, add: false, edit: false, del: false },
      'Token Management': { view: false, add: false, edit: false, del: false },
      Payments: { view: true, add: true, edit: true, del: false },
      'Billing & Settlements': { view: true, add: true, edit: true, del: false },
      'Doctors & Departments': { view: false, add: false, edit: false, del: false },
      Reports: { view: true, add: false, edit: false, del: false },
      'Hospital Settings': { view: false, add: false, edit: false, del: false },
      'Users & Roles': { view: false, add: false, edit: false, del: false },
    },
  },
];

export const SEED_USERS: readonly HospitalUser[] = [
  {
    id: 'u1',
    name: 'Dr. S. Nair',
    email: 's.nair@apollo.med',
    phone: '98765 00001',
    username: 'snair',
    roleId: 'r-admin',
    status: 'Active',
    last: 'Just now',
    invite: 'Accepted',
  },
  {
    id: 'u2',
    name: 'Riya Menon',
    email: 'riya.menon@apollo.med',
    phone: '98765 00010',
    username: 'riya.menon',
    roleId: 'r-reception',
    status: 'Active',
    last: '5 min ago',
    invite: 'Accepted',
  },
  {
    id: 'u3',
    name: 'Karthik Rao',
    email: 'karthik.r@apollo.med',
    phone: '98765 00011',
    username: 'karthik.rao',
    roleId: 'r-reception',
    status: 'Active',
    last: '2 hrs ago',
    invite: 'Accepted',
  },
  {
    id: 'u4',
    name: 'Sunita Joseph',
    email: 'sunita.j@apollo.med',
    phone: '98765 00020',
    username: 'sunita.j',
    roleId: 'r-deptdesk',
    status: 'Active',
    last: '12 min ago',
    invite: 'Accepted',
  },
  {
    id: 'u5',
    name: 'Mahesh Pillai',
    email: 'mahesh.p@apollo.med',
    phone: '98765 00021',
    username: 'mahesh.p',
    roleId: 'r-deptdesk',
    status: 'Active',
    last: '1 hr ago',
    invite: 'Pending',
  },
  {
    id: 'u6',
    name: 'Anand Pillai',
    email: 'anand.p@apollo.med',
    phone: '98765 00030',
    username: 'anand.p',
    roleId: 'r-accountant',
    status: 'Active',
    last: 'Yesterday',
    invite: 'Accepted',
  },
  {
    id: 'u7',
    name: 'Fatima Sheikh',
    email: 'fatima.s@apollo.med',
    phone: '98765 00022',
    username: 'fatima.s',
    roleId: 'r-deptdesk',
    status: 'Inactive',
    last: '3 days ago',
    invite: 'Accepted',
  },
];
