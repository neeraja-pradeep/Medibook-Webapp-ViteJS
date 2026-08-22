import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { OpsSkeleton } from '@/shared/ui/OpsSkeleton';

import {
  AUTH_LOGIN_PATH,
  opsHospitalDetailPath,
  opsPath,
  opsViewFromPath,
  type OpsStaticView,
  type OpsView,
} from '@/app/router/paths';

import { useAuthStore } from '@/features/auth/application/store/auth.store';

import { ErrorBoundary } from './ErrorBoundary';
import { OPS_DETAIL_PARENT } from './ops-nav';
import { OpsSidebar } from './OpsSidebar';
import { OpsTopbar } from './OpsTopbar';
import { ScreenError } from './ScreenError';
import { createViewHistory } from './view-history';

/** Skeleton duration on every view change (design behaviour). */
const SKELETON_MS = 450;

/**
 * Module-level visited-view stack (the prototype's `OpsShell` histRef);
 * recorded synchronously during render, cleared on logout.
 */
const history = createViewHistory<OpsView>();

/** Skeleton phase: which view is being revealed, and whether it is still loading. */
interface SkeletonPhase {
  readonly view: OpsView;
  readonly loading: boolean;
}

/** Ops console frame: sidebar + topbar + skeleton + error boundary (design `OpsShell`). */
export function OpsShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const view = opsViewFromPath(location.pathname);
  const navActive = OPS_DETAIL_PARENT[view] ?? view;

  // 450ms skeleton on every view change — the loading flag flips on during
  // render (React's derive-while-rendering pattern) and off via the timer.
  const [phase, setPhase] = useState<SkeletonPhase>({ view, loading: true });
  if (phase.view !== view) setPhase({ view, loading: true });
  useEffect(() => {
    const t = setTimeout(
      () => setPhase((p) => (p.view === view ? { view, loading: false } : p)),
      SKELETON_MS,
    );
    return () => clearTimeout(t);
  }, [view]);
  const loading = phase.loading || phase.view !== view;

  // History-aware back — recorded synchronously in render so availability is
  // correct immediately (exactly like the prototype).
  history.record(view, location.pathname);
  // Returns to the actual previous screen, wherever you came from.
  const onBack =
    history.depth() > 1
      ? () => {
          history.pop();
          const prev = history.pop();
          if (prev) navigate(prev.path);
        }
      : null;

  const handleNavigate = (target: OpsStaticView) => navigate(opsPath(target));

  const handleLogout = () => {
    logout();
    history.clear();
    navigate(AUTH_LOGIN_PATH);
  };

  return (
    <div className="bg-bg-app flex h-full overflow-hidden">
      <OpsSidebar active={navActive} onNavigate={handleNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <OpsTopbar
          view={view}
          onNavigate={handleNavigate}
          onOpenHospital={(id) => navigate(opsHospitalDetailPath(id))}
          onLogout={handleLogout}
          onBack={onBack}
        />
        <div className="flex-1 overflow-y-auto p-5">
          <ErrorBoundary
            key={view}
            fallback={(_err, reset) => (
              <ScreenError onRetry={reset} onHome={() => handleNavigate('dashboard')} />
            )}
          >
            {loading ? <OpsSkeleton /> : <Outlet />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
