import { create } from 'zustand';

import { SEED_PATIENTS } from './patients.fixtures';
import type { Patient, PatientStatus } from './patients.types';

/**
 * Patient records store — identity + contact only (no clinical data).
 * Actions ported 1:1 from the design prototype (`data.jsx` `Actions.patAdd`
 * / `patUpdate` / `patDelete`). The prototype's `selectedMrn` is a URL param
 * now and is intentionally NOT kept here.
 */

/**
 * MRN mint counter — replaces the prototype's
 * `"AP" + Math.floor(800000 + Math.random() * 90000)` with a deterministic
 * sequence in the same AP8xxxxx style (seed MRNs live at AP8472xx).
 */
let mrnSeq = 800000;

/** Mint the next AP8xxxxx MRN (also used by appointments' walk-in create). */
export function mintMrn(): string {
  mrnSeq += 1;
  return `AP${mrnSeq}`;
}

/** New-patient payload — `mrn`/`status` are filled in when absent. */
export interface PatientDraft {
  readonly mrn?: string;
  readonly name: string;
  readonly age: number;
  readonly gender: Patient['gender'];
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly status?: PatientStatus;
}

/** Editable fields of a patient record (everything but the MRN key). */
export type PatientPatch = Partial<Omit<Patient, 'mrn'>>;

interface PatientsState {
  patients: readonly Patient[];
}

interface PatientsActions {
  /** Prepend a patient, minting an AP8xxxxx MRN when none given; returns the MRN. */
  patAdd: (p: PatientDraft) => string;
  /**
   * Upsert by MRN — merge into the existing record, or prepend a new one.
   * Every real call site sends the full record; absent fields on an insert
   * fall back to empty values (the prototype left them undefined).
   */
  patUpdate: (mrn: string, patch: PatientPatch) => void;
  patDelete: (mrn: string) => void;
}

export const usePatientsStore = create<PatientsState & PatientsActions>()((set) => ({
  patients: SEED_PATIENTS,
  patAdd: (p) => {
    const mrn = p.mrn || mintMrn();
    const record: Patient = {
      mrn,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address,
      status: p.status ?? 'Active',
    };
    set((s) => ({ patients: [record, ...s.patients] }));
    return mrn;
  },
  patUpdate: (mrn, patch) =>
    set((s) => {
      const exists = s.patients.some((p) => p.mrn === mrn);
      if (exists) {
        return { patients: s.patients.map((p) => (p.mrn === mrn ? { ...p, ...patch } : p)) };
      }
      const inserted: Patient = {
        mrn,
        name: patch.name ?? '',
        age: patch.age ?? 0,
        gender: patch.gender ?? 'Male',
        phone: patch.phone ?? '',
        email: patch.email ?? '',
        address: patch.address ?? '',
        status: patch.status ?? 'Active',
      };
      return { patients: [inserted, ...s.patients] };
    }),
  patDelete: (mrn) => set((s) => ({ patients: s.patients.filter((p) => p.mrn !== mrn) })),
}));
