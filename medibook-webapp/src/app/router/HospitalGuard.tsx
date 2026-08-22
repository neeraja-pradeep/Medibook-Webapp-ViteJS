import { Navigate, useParams } from 'react-router-dom';

import { HospitalShell } from '@/app/layouts/HospitalShell';
import {
  AUTH_LOGIN_PATH,
  hospitalDashboardPath,
  isHospitalRole,
  opsPath,
  ROOT_PATH,
} from '@/app/router/paths';

import { useAuthStore } from '@/features/auth/application/store/auth.store';

/**
 * Guard for the `/:role/*` layout: invalid role param → `/`; unauthed →
 * login; ops → ops dashboard; role mismatch → the signed-in role's
 * dashboard. Otherwise renders the hospital shell.
 */
export function HospitalGuard() {
  const { role: roleParam } = useParams();
  const authed = useAuthStore((s) => s.authed);
  const authRole = useAuthStore((s) => s.role);

  if (!isHospitalRole(roleParam)) return <Navigate to={ROOT_PATH} replace />;
  if (!authed) return <Navigate to={AUTH_LOGIN_PATH} replace />;
  if (authRole === 'ops') return <Navigate to={opsPath('dashboard')} replace />;
  if (authRole !== roleParam) return <Navigate to={hospitalDashboardPath(authRole)} replace />;
  return <HospitalShell role={roleParam} />;
}
