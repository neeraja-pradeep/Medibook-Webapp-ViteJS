import { create } from 'zustand';

import { DEPTS_DATA, DOCS_DATA } from './catalog.fixtures';
import type { Dept, Doctor } from './catalog.types';

/**
 * Doctors & Departments catalog store, seeded from the design fixtures
 * (the prototype's `catSeed(DEPTS_DATA, DOCS_DATA)` applied at init).
 * Actions ported 1:1 from `data.jsx` (`catSaveDoctor` / `catDeleteDoctor` /
 * `catSaveDept` / `catDeleteDept`); id minting for new records moves from
 * the screens' `"dc"/"dp" + Date.now()` to deterministic counters that
 * continue the seed's "dc<N>"/"dp<N>" style.
 */

let doctorIdSeq = DOCS_DATA.length; // seed occupies dc0..dc6

let deptIdSeq = DEPTS_DATA.length; // seed occupies dp0..dp5

/** Doctor payload — a missing id means "create" and mints `dc<N>`. */
export type DoctorDraft = Omit<Doctor, 'id'> & { readonly id?: string };

/** Department payload — a missing id means "create" and mints `dp<N>`. */
export type DeptDraft = Omit<Dept, 'id'> & { readonly id?: string };

interface CatalogState {
  depts: readonly Dept[];
  docs: readonly Doctor[];
}

interface CatalogActions {
  /** Upsert a doctor profile — replace by id, or prepend a new record. */
  catSaveDoctor: (doc: DoctorDraft) => void;
  catDeleteDoctor: (id: string) => void;
  /** Upsert a department — replace by id, or append a new record. */
  catSaveDept: (dept: DeptDraft) => void;
  catDeleteDept: (id: string) => void;
}

export const useCatalogStore = create<CatalogState & CatalogActions>()((set) => ({
  depts: DEPTS_DATA,
  docs: DOCS_DATA,

  catSaveDoctor: (doc) =>
    set((s) => {
      const id = doc.id || `dc${doctorIdSeq++}`;
      const record: Doctor = { ...doc, id };
      const exists = s.docs.some((x) => x.id === id);
      return {
        docs: exists ? s.docs.map((x) => (x.id === id ? record : x)) : [record, ...s.docs],
      };
    }),

  catDeleteDoctor: (id) => set((s) => ({ docs: s.docs.filter((x) => x.id !== id) })),

  catSaveDept: (dept) =>
    set((s) => {
      const id = dept.id || `dp${deptIdSeq++}`;
      const record: Dept = { ...dept, id };
      const exists = s.depts.some((x) => x.id === id);
      return {
        depts: exists ? s.depts.map((x) => (x.id === id ? record : x)) : [...s.depts, record],
      };
    }),

  catDeleteDept: (id) => set((s) => ({ depts: s.depts.filter((x) => x.id !== id) })),
}));
