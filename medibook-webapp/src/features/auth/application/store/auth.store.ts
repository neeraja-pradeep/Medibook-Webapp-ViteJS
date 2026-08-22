import { create } from 'zustand';

/**
 * Demo auth/role state, ported from the design prototype's `App()` state
 * (`Medibook mbAdmin.html`) + `Auth.jsx`. Nothing is persisted — a reload
 * starts logged out, exactly like the prototype.
 */

/** The three app roles ("hospital" login lands on the admin role). */
export type AuthRole = 'receptionist' | 'admin' | 'ops';

/** Which login tab submitted (design `onLogin(kind)`). */
export type LoginKind = 'hospital' | 'ops';

interface AuthState {
  authed: boolean;
  role: AuthRole;
}

interface AuthActions {
  /** Design `onLogin`: hospital login lands on the admin role. */
  login: (kind: LoginKind) => void;
  logout: () => void;
  /** Hospital topbar role switcher (redirect rules live in the router). */
  switchRole: (role: AuthRole) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  authed: false,
  role: 'receptionist',
  login: (kind) => set({ authed: true, role: kind === 'ops' ? 'ops' : 'admin' }),
  logout: () => set({ authed: false }),
  switchRole: (role) => set({ role }),
}));
