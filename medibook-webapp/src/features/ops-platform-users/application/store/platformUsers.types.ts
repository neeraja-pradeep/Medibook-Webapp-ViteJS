/**
 * Platform-user (patient account) view-model types — interim entities for the
 * static-seed phase. Shapes transcribed from the design prototype's
 * `OpsDB.platformUsers` (Ops.jsx).
 */

/** Account state of a patient account from the Medibook mobile app. */
export type PlatformUserStatus = 'Active' | 'Blocked';

/** A family member linked to a patient account. */
export interface FamilyMember {
  readonly name: string;
  readonly rel: string;
  readonly age: number;
  readonly gender: 'Female' | 'Male';
}

/** Outcome state of one booking in a patient's history. */
export type PlatformBookingStatus =
  'Scheduled' | 'In Queue' | 'Completed' | 'No-show' | 'Cancelled';

/** One booking in a patient account's history. */
export interface PlatformBooking {
  readonly hospital: string;
  readonly department: string;
  readonly date: string;
  readonly status: PlatformBookingStatus;
}

/** One patient account from the Medibook mobile app. */
export interface PlatformUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly city: string;
  readonly bookings: number;
  readonly joined: string;
  readonly status: PlatformUserStatus;
  readonly av: string | null;
  readonly family: readonly FamilyMember[];
  readonly history: readonly PlatformBooking[];
}
