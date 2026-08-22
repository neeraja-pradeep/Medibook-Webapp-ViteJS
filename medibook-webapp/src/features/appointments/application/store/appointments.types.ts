/**
 * Interim view-model types + domain constants for the appointments feature,
 * transcribed 1:1 from the design prototype (`data.jsx`). When the real
 * domain/infrastructure layers land, these become domain entities and the
 * constants move behind the API.
 */

/** The six seeded departments (design `DEPARTMENTS`). */
export const DEPARTMENTS = [
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'ENT',
  'Dermatology',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

/** Doctors per department (design `DOCTORS`). */
export const DOCTORS: Readonly<Record<Department, readonly string[]>> = {
  Cardiology: ['Dr. Thomas K.', 'Dr. Anil R.'],
  Orthopedics: ['Dr. Geetha R.'],
  Pediatrics: ['Dr. Kumar V.'],
  Neurology: ['Dr. Maya S.'],
  ENT: ['Dr. Arun B.'],
  Dermatology: ['Dr. Leela P.'],
};

/** Consultation fee per department (design `FEES`). */
export const FEES: Readonly<Record<Department, number>> = {
  Cardiology: 800,
  Orthopedics: 700,
  Pediatrics: 600,
  Neurology: 1000,
  ENT: 500,
  Dermatology: 650,
};

/** Per-doctor metadata (room, specialization) — used by the live queue & doctor profile. */
export interface DoctorMeta {
  readonly room: string;
  readonly spec: string;
  readonly dept: Department;
}

/** Design `DOCTOR_META`, keyed by doctor display name. */
export const DOCTOR_META: Readonly<Record<string, DoctorMeta>> = {
  'Dr. Thomas K.': { room: '101', spec: 'Cardiologist', dept: 'Cardiology' },
  'Dr. Anil R.': { room: '102', spec: 'Cardiologist', dept: 'Cardiology' },
  'Dr. Geetha R.': { room: '201', spec: 'Orthopedic Surgeon', dept: 'Orthopedics' },
  'Dr. Kumar V.': { room: '301', spec: 'Pediatrician', dept: 'Pediatrics' },
  'Dr. Maya S.': { room: '401', spec: 'Neurologist', dept: 'Neurology' },
  'Dr. Arun B.': { room: '501', spec: 'ENT Specialist', dept: 'ENT' },
  'Dr. Leela P.': { room: '601', spec: 'Dermatologist', dept: 'Dermatology' },
};

/**
 * Design `TOKEN_PREFIX` — kept for call-site compatibility / future
 * per-department token schemes (the live scheme is hospital-wide "T-001").
 */
export const TOKEN_PREFIX: Readonly<Record<Department, string>> = {
  Cardiology: 'C',
  Orthopedics: 'O',
  Pediatrics: 'P',
  Neurology: 'N',
  ENT: 'E',
  Dermatology: 'D',
};

/** "Online" = pre-booked + pre-paid via the Medibook app; "Walk-in" = booked at the desk. */
export type AppointmentSource = 'Online' | 'Walk-in';

export type PaymentState = 'Paid' | 'Pending' | 'Refunded';

export type AppointmentStatus = 'Scheduled' | 'In Queue' | 'Completed' | 'Cancelled' | 'No-show';

export type Gender = 'Male' | 'Female' | 'Other';

/** Desk payment modes offered by the Mark Payment flow. */
export type PaymentMode = 'Cash' | 'UPI' | 'Card';

/** A doctor's live queue status (design `docStatus` values). */
export type DoctorStatus = 'Available' | 'Consulting' | 'Waiting' | 'On Break';

export interface Appointment {
  readonly id: string;
  readonly mrn: string;
  readonly name: string;
  readonly age: number;
  readonly gender: Gender;
  readonly phone: string;
  readonly dept: Department;
  readonly doctor: string;
  readonly source: AppointmentSource;
  /** Relative demo label — "Today", "Tomorrow" or a "14 Jun"-style date. */
  readonly date: string;
  /** Slot label, e.g. "8:30 am". */
  readonly time: string;
  readonly amount: number;
  readonly payment: PaymentState;
  readonly token: string | null;
  readonly status: AppointmentStatus;
  readonly remark: string;
  /** Lifecycle fields written by actions after seed time. */
  readonly payMode?: PaymentMode;
  readonly payRef?: string;
  /** Epoch ms the token was called for consultation; null after a skip. */
  readonly calledAt?: number | null;
  /** Queue re-order stamp set when a patient is skipped to the back. */
  readonly qorder?: number;
  readonly cancelReason?: string;
  readonly refundVia?: 'Desk';
}
