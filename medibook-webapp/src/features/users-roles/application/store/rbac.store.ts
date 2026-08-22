import { create } from 'zustand';

import { SEED_ROLES, SEED_USERS } from './rbac.fixtures';
import type { HospitalUser, Role } from './rbac.types';

/**
 * Users & Roles (hospital RBAC) store — admin-defined roles with granular
 * CRUD permissions plus hospital staff users. Actions ported 1:1 from the
 * design prototype (`data.jsx` `rbacAddRole` / `rbacUpdateRole` /
 * `rbacDeleteRole` / `rbacAddUser` / `rbacUpdateUser`).
 */

interface RbacState {
  roles: readonly Role[];
  users: readonly HospitalUser[];
}

interface RbacActions {
  rbacAddRole: (role: Role) => void;
  rbacUpdateRole: (id: string, patch: Partial<Role>) => void;
  rbacDeleteRole: (id: string) => void;
  rbacAddUser: (u: HospitalUser) => void;
  rbacUpdateUser: (id: string, patch: Partial<HospitalUser>) => void;
}

export const useRbacStore = create<RbacState & RbacActions>()((set) => ({
  roles: SEED_ROLES,
  users: SEED_USERS,

  rbacAddRole: (role) => set((s) => ({ roles: [...s.roles, role] })),

  rbacUpdateRole: (id, patch) =>
    set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

  rbacDeleteRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

  rbacAddUser: (u) => set((s) => ({ users: [u, ...s.users] })),

  rbacUpdateUser: (id, patch) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
}));
