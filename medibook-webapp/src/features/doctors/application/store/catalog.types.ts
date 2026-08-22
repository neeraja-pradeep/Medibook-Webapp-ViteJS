/**
 * Interim view-model types for the Doctors & Departments catalog
 * (design `Catalog.jsx`). The catalog feeds the Medibook patient app.
 */

/** One day of a weekly-hours grid ("Mon".."Sun"). */
export interface WeekDay {
  readonly day: string;
  readonly on: boolean;
  readonly from: string;
  readonly to: string;
}

export type DeptStatus = 'Active' | 'Inactive';

export interface Dept {
  readonly id: string;
  readonly name: string;
  readonly about: string;
  readonly fee: number;
  /** Display summary, e.g. "Mon–Sat · 9am–6pm". */
  readonly hours: string;
  readonly status: DeptStatus;
  /** Concrete hex color — feeds data-driven inline styles (cards, gradients). */
  readonly color: string;
  readonly week: readonly WeekDay[];
  /** Optional cover image data-URL added via the dept editor. */
  readonly image?: string | null;
}

/** Catalog-side doctor availability (distinct from the live queue DoctorStatus). */
export type CatalogDoctorStatus = 'Active' | 'On Leave' | 'Inactive';

export interface DoctorLeave {
  readonly from: string;
  readonly to: string;
  readonly reason: string;
}

/** A patient review shown on the doctor profile (author, rating, date, text). */
export interface DoctorReview {
  readonly a: string;
  readonly r: number;
  readonly d: string;
  readonly t: string;
}

export interface Doctor {
  readonly id: string;
  readonly name: string;
  readonly depts: readonly string[];
  readonly spec: string;
  readonly room: string;
  readonly fee: number;
  readonly rating: number;
  readonly reviews: number;
  readonly status: CatalogDoctorStatus;
  readonly week: readonly WeekDay[];
  readonly leave: readonly DoctorLeave[];
  readonly list: readonly DoctorReview[];
  /** Optional profile fields edited via the doctor drawer. */
  readonly phone?: string;
  readonly email?: string;
  readonly qual?: string;
  readonly exp?: string;
  readonly reg?: string;
  readonly photo?: string | null;
  readonly about?: string;
}
