/**
 * Interim view-model types for the Hospital Settings screen (design
 * `data.jsx` `DEFAULT_SETTINGS`). The string-valued rule fields hold the
 * exact option labels the settings screen's selects offer (e.g. "15 mins",
 * "Auto", "Auto Mark No-show").
 */

export interface MapPin {
  readonly x: number;
  readonly y: number;
}

export interface HospitalBank {
  readonly accountName: string;
  readonly bank: string;
  readonly account: string;
  readonly ifsc: string;
  readonly upi: string;
}

export interface HospitalRules {
  readonly duration: string;
  readonly onlineBooking: boolean;
  readonly maxPerSlot: string;
  readonly buffer: string;
  readonly allowCancel: boolean;
  readonly cancelBefore: string;
  readonly autoNoShow: string;
  readonly tokenGen: string;
  readonly showToken: boolean;
  readonly allowHold: boolean;
  readonly holdTimeout: string;
  readonly grace: string;
  readonly afterGrace: string;
  readonly opFee: string;
  readonly feeValidity: string;
  readonly applyAllDepts: boolean;
}

export interface HospitalNotify {
  readonly confirm: boolean;
  readonly reminder: boolean;
  readonly settleReceived: boolean;
  readonly settleOverdue: boolean;
  readonly quotaLow: boolean;
}

export interface HospitalSettings {
  readonly name: string;
  readonly regNo: string;
  readonly gstin: string;
  readonly phone: string;
  readonly email: string;
  readonly about: string;
  readonly address: string;
  readonly lat: string;
  readonly lng: string;
  /** Logo image data-URL, or null when none uploaded. */
  readonly logo: string | null;
  /** Map pin position in % of the map box. */
  readonly pin: MapPin;
  readonly hoursOpen: string;
  readonly hoursClose: string;
  /** Open flags Mon..Sun (7 entries). */
  readonly hoursDays: readonly boolean[];
  readonly bank: HospitalBank;
  readonly rules: HospitalRules;
  readonly notify: HospitalNotify;
}
