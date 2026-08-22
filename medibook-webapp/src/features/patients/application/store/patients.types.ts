/**
 * Interim view-model types for the patients feature (static-data phase).
 * Patient records are identity + contact only — Medibook stores NO
 * clinical/medical data.
 */

export type Gender = 'Male' | 'Female' | 'Other';

export type PatientStatus = 'Active' | 'Inactive';

export interface Patient {
  readonly mrn: string;
  readonly name: string;
  readonly age: number;
  readonly gender: Gender;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly status: PatientStatus;
}
