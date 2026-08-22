import { Navigate, Outlet, useParams } from 'react-router-dom';

import { hospitalDashboardPath, isHospitalRole } from '@/app/router/paths';

/**
 * Wrapper for admin-only hospital views (`settlements`, `doctors`, `users`,
 * `reports`, `settings`): a receptionist is bounced to their dashboard
 * (spec §6 role gates).
 */
export function RequireAdmin() {
  const { role: roleParam } = useParams();
  if (roleParam !== 'admin') {
    const role = isHospitalRole(roleParam) ? roleParam : 'receptionist';
    return <Navigate to={hospitalDashboardPath(role)} replace />;
  }
  return <Outlet />;
}
