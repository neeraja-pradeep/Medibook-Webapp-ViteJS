import { useParams } from 'react-router-dom';

import { AdminDashboardScreen } from '@/features/dashboard/presentation/screens/AdminDashboardScreen';
import { ReceptionistDashboardScreen } from '@/features/dashboard/presentation/screens/ReceptionistDashboardScreen';

/**
 * `/:role/dashboard` renders the role's dashboard (the design's `Screen`
 * switch: receptionist → Front Desk, admin → Hospital Dashboard).
 */
export function DashboardSwitch() {
  const { role } = useParams();
  return role === 'admin' ? <AdminDashboardScreen /> : <ReceptionistDashboardScreen />;
}
