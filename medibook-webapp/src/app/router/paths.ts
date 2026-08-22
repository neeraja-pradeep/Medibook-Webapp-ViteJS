/**
 * Route constants + view-id ↔ URL translation for both shells.
 *
 * The design prototype routed on hash "view ids" (`#<role>/<view>`,
 * `Medibook mbAdmin.html` `parseHash`). The port keeps those view ids —
 * titles, nav-active state, the history-aware back stack and allowed-view
 * checks all speak view ids — and this module is the single place they are
 * mapped to real URLs. No magic path strings anywhere else.
 */

/* ---------------------------------------------------------------- roles */

/** The two hospital roles the URL's `:role` segment may carry (design `ROLES`). */
export const HOSPITAL_ROLES = ['receptionist', 'admin'] as const;

export type HospitalRole = (typeof HOSPITAL_ROLES)[number];

export function isHospitalRole(value: string | null | undefined): value is HospitalRole {
  return value === 'receptionist' || value === 'admin';
}

/* ------------------------------------------------------ absolute anchors */

export const ROOT_PATH = '/';
export const AUTH_LOGIN_PATH = '/auth/login';
export const AUTH_FORGOT_PATH = '/auth/forgot';
export const OPS_BASE_PATH = '/ops';

/* ------------------------------------------------------- hospital views */

/** Hospital view ids, exactly as the design prototype named them. */
export type HospitalView =
  | 'dashboard'
  | 'appointments'
  | 'create'
  | 'patients'
  | 'patient-detail'
  | 'token'
  | 'payments'
  | 'settlements'
  | 'doctors'
  | 'doctor-detail'
  | 'users'
  | 'reports'
  | 'settings'
  | 'help';

/** Detail views whose URL carries a param (`OpsSel`/`Store` selection → URL). */
export type HospitalDetailView = 'patient-detail' | 'doctor-detail';

/** Views navigable without a param (nav items, notification targets, "create"). */
export type HospitalStaticView = Exclude<HospitalView, HospitalDetailView>;

/** URL segment under `/:role` for every hospital view (detail views carry a param). */
export const HOSPITAL_VIEW_SEGMENT: Readonly<Record<HospitalView, string>> = {
  dashboard: 'dashboard',
  appointments: 'appointments',
  create: 'appointments/new',
  patients: 'patients',
  'patient-detail': 'patients/:mrn',
  token: 'token',
  payments: 'payments',
  settlements: 'settlements',
  doctors: 'doctors',
  'doctor-detail': 'doctors/:id',
  users: 'users',
  reports: 'reports',
  settings: 'settings',
  help: 'help',
};

/** Absolute path for a param-free hospital view. */
export function hospitalPath(role: HospitalRole, view: HospitalStaticView): string {
  return `/${role}/${HOSPITAL_VIEW_SEGMENT[view]}`;
}

export function hospitalDashboardPath(role: HospitalRole): string {
  return hospitalPath(role, 'dashboard');
}

/** List views resolvable 1:1 from their first URL segment. */
const HOSPITAL_SEGMENT_VIEWS: readonly HospitalView[] = [
  'dashboard',
  'appointments',
  'patients',
  'token',
  'payments',
  'settlements',
  'doctors',
  'users',
  'reports',
  'settings',
  'help',
];

/** Current hospital view id from a `/:role/...` pathname (design `parseHash`). */
export function hospitalViewFromPath(pathname: string): HospitalView {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[1];
  const second = segments[2];
  if (first === 'appointments' && second === 'new') return 'create';
  if (first === 'patients' && second) return 'patient-detail';
  if (first === 'doctors' && second) return 'doctor-detail';
  return HOSPITAL_SEGMENT_VIEWS.find((v) => v === first) ?? 'dashboard';
}

/* ------------------------------------------------------------ ops views */

/** Ops view ids, exactly as the design prototype named them (`OPS_VIEWS_SET`). */
export type OpsView =
  | 'dashboard'
  | 'hospitals'
  | 'hospital-detail'
  | 'plans'
  | 'billing'
  | 'invoice-detail'
  | 'payment-detail'
  | 'settlements'
  | 'analytics'
  | 'reports'
  | 'logs'
  | 'users'
  | 'platform-users'
  | 'platform-user-detail'
  | 'notifications'
  | 'settings';

/** Ops detail views whose URL carries a param (`OpsSel` selection → URL). */
export type OpsDetailView =
  'hospital-detail' | 'invoice-detail' | 'payment-detail' | 'platform-user-detail';

/** Ops views navigable without a param (nav items, notification targets). */
export type OpsStaticView = Exclude<OpsView, OpsDetailView>;

/** URL segment under `/ops` for every ops view (detail views carry a param). */
export const OPS_VIEW_SEGMENT: Readonly<Record<OpsView, string>> = {
  dashboard: 'dashboard',
  hospitals: 'hospitals',
  'hospital-detail': 'hospitals/:id',
  plans: 'plans',
  billing: 'billing',
  'invoice-detail': 'billing/invoices/:id',
  'payment-detail': 'billing/payments/:id',
  settlements: 'settlements',
  analytics: 'analytics',
  reports: 'reports',
  logs: 'logs',
  users: 'users',
  'platform-users': 'platform-users',
  'platform-user-detail': 'platform-users/:id',
  notifications: 'notifications',
  settings: 'settings',
};

/** Absolute path for a param-free ops view. */
export function opsPath(view: OpsStaticView): string {
  return `${OPS_BASE_PATH}/${OPS_VIEW_SEGMENT[view]}`;
}

/** Absolute path for one hospital's ops profile (bell/alert `hospital:<id>` targets). */
export function opsHospitalDetailPath(id: number): string {
  return `${OPS_BASE_PATH}/${OPS_VIEW_SEGMENT.hospitals}/${id}`;
}

/** Ops list views resolvable 1:1 from their first URL segment. */
const OPS_SEGMENT_VIEWS: readonly OpsView[] = [
  'dashboard',
  'hospitals',
  'plans',
  'billing',
  'settlements',
  'analytics',
  'reports',
  'logs',
  'users',
  'platform-users',
  'notifications',
  'settings',
];

/** Current ops view id from an `/ops/...` pathname. */
export function opsViewFromPath(pathname: string): OpsView {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[1];
  const second = segments[2];
  const third = segments[3];
  if (first === 'hospitals' && second) return 'hospital-detail';
  if (first === 'billing' && second === 'invoices' && third) return 'invoice-detail';
  if (first === 'billing' && second === 'payments' && third) return 'payment-detail';
  if (first === 'platform-users' && second) return 'platform-user-detail';
  return OPS_SEGMENT_VIEWS.find((v) => v === first) ?? 'dashboard';
}
