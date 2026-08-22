import { Navigate } from 'react-router-dom';

import { OpsShell } from '@/app/layouts/OpsShell';
import { AUTH_LOGIN_PATH, hospitalDashboardPath } from '@/app/router/paths';

import { useAuthStore } from '@/features/auth/application/store/auth.store';

/**
 * Guard for the `/ops/*` layout: unauthed → login; non-ops roles → their
 * hospital dashboard. Otherwise renders the ops shell.
 */
export function OpsGuard() {
  const authed = useAuthStore((s) => s.authed);
  const role = useAuthStore((s) => s.role);
  if (!authed) return <Navigate to={AUTH_LOGIN_PATH} replace />;
  if (role !== 'ops') return <Navigate to={hospitalDashboardPath(role)} replace />;
  return <OpsShell />;
}
