import { Navigate } from 'react-router-dom';

import { AUTH_LOGIN_PATH, hospitalDashboardPath, opsPath } from '@/app/router/paths';

import { useAuthStore } from '@/features/auth/application/store/auth.store';

/** `/` lands on the right home by auth state (spec §6 routing rules). */
export function RootRedirect() {
  const authed = useAuthStore((s) => s.authed);
  const role = useAuthStore((s) => s.role);
  if (!authed) return <Navigate to={AUTH_LOGIN_PATH} replace />;
  if (role === 'ops') return <Navigate to={opsPath('dashboard')} replace />;
  return <Navigate to={hospitalDashboardPath(role)} replace />;
}
