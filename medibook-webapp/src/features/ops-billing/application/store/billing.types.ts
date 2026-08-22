/**
 * Subscription-billing view-model types (interim entities for the static-seed
 * phase). Shapes transcribed from the design prototype's `OpsDB.invoices` and
 * `OpsDB.payments` (Ops.jsx).
 */

/** Lifecycle state of a subscription invoice. */
export type InvoiceStatus = 'Completed' | 'Pending' | 'Overdue' | 'Payment failed';

/** One subscription invoice issued to a hospital. */
export interface Invoice {
  readonly id: number;
  readonly no: string;
  /** Tenant id in the ops hospital registry (joined on id, never on name). */
  readonly hid: number;
  readonly hospital: string;
  readonly amount: number;
  readonly issued: string;
  readonly due: string;
  readonly status: InvoiceStatus;
}

/** Payment channel used for a subscription payment. */
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking';

/** Lifecycle state of a payment transaction. */
export type PaymentStatus = 'Success' | 'Pending' | 'Payment failed';

/** One payment transaction against a subscription invoice. */
export interface Payment {
  readonly id: number;
  readonly txn: string;
  readonly inv: string;
  /** Tenant id in the ops hospital registry (joined on id, never on name). */
  readonly hid: number;
  readonly hospital: string;
  readonly method: PaymentMethod;
  readonly amount: number;
  readonly date: string;
  readonly status: PaymentStatus;
}
