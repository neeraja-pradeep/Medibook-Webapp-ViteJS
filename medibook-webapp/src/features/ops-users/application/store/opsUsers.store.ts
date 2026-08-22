import { create } from 'zustand';

import { OPS_USERS } from './opsUsers.fixtures';
import type { OpsRole, OpsUser } from './opsUsers.types';

/**
 * Internal Medibook users store (design `OpsDB.users` + the Ops.jsx
 * AddOpsUserModal / delete-user mutations). Toasts for these flows come
 * from the screens' `useOpsAct` runs, as in the prototype.
 */

/** Add User modal payload — everything else starts in the Pending state. */
export interface AddOpsUserForm {
  readonly name: string;
  readonly email: string;
  readonly role: OpsRole;
}

interface OpsUsersState {
  users: readonly OpsUser[];
}

interface OpsUsersActions {
  /** Prepend an invited user (2FA Pending, status Pending, no avatar). */
  addUser: (f: AddOpsUserForm) => void;
  deleteUser: (id: number) => void;
}

export const useOpsUsersStore = create<OpsUsersState & OpsUsersActions>()((set) => ({
  users: OPS_USERS,

  addUser: (f) =>
    set((s) => {
      const id = Math.max(...s.users.map((u) => u.id)) + 1;
      const record: OpsUser = {
        id,
        name: f.name,
        email: f.email,
        role: f.role,
        twofa: 'Pending',
        lastActive: '—',
        status: 'Pending',
        av: null,
      };
      return { users: [record, ...s.users] };
    }),

  deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
}));
