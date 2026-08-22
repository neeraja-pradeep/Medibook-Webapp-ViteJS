import { create } from 'zustand';

import { OPS_INVOICES, OPS_PAYMENTS } from './billing.fixtures';
import type { Invoice, Payment } from './billing.types';

/**
 * Ops subscription-billing store (design `OpsDB.invoices` / `OpsDB.payments`).
 * The design has no billing mutations — invoice/payment rows are static reads
 * (download/regenerate flows are toast-only demos) — so the store is state
 * only, kept as a store so the later query-hook swap stays mechanical.
 */

interface BillingState {
  invoices: readonly Invoice[];
  payments: readonly Payment[];
}

export const useBillingStore = create<BillingState>()(() => ({
  invoices: OPS_INVOICES,
  payments: OPS_PAYMENTS,
}));
