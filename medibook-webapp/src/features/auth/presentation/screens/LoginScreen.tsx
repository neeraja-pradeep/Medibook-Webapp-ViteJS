import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

import { hospitalDashboardPath, opsPath } from '@/app/router/paths';

import { useAuthStore } from '@/features/auth/application/store/auth.store';

/**
 * Placeholder — the auth feature agent ports the real screen next (spec §6).
 * The two buttons are wired to the real auth store so both shells are
 * manually verifiable: hospital login lands on the admin role.
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex w-83 flex-col gap-3">
        <div className="text-h3 text-text-strong">{'Login — being ported'}</div>
        <Button
          onClick={() => {
            login('hospital');
            navigate(hospitalDashboardPath('admin'));
          }}
        >
          Hospital login
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            login('ops');
            navigate(opsPath('dashboard'));
          }}
        >
          Ops login
        </Button>
      </Card>
    </div>
  );
}
