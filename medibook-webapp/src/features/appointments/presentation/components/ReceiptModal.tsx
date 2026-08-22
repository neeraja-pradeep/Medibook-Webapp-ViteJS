import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

import type { Appointment } from '@/features/appointments/application/store/appointments.types';
import { TokenSlip } from '@/features/appointments/presentation/components/TokenSlip';

/** Demo hospital identity + logo — the design read these from `window.__*`. */
const HOSPITAL_NAME = 'Apollo Hospital';
const LOGO_SRC = '/assets/apollo-logo.png';

/**
 * Receipt table cell classes — the design's `rcTh`/`rcTd`. The `py-*` here
 * deliberately overrides the global 22px "Comfy" density: these compact
 * receipt sub-tables want tight rows (utilities layer wins over base).
 */
const rcTh =
  'border-border text-text-muted text-caption border-b px-2 py-2.5 uppercase tracking-[.05em]';
const rcTd = 'border-border-soft text-text-body border-b px-2 py-3';

function Kv({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-text-muted">{k}</span>
      <span className="text-text-strong text-right font-medium">{v}</span>
    </div>
  );
}

interface ReceiptModalProps {
  appt: Appointment | null;
  onClose: () => void;
}

/** Printable payment receipt + token slip (design `Flows.jsx` `ReceiptModal`). */
export function ReceiptModal({ appt, onClose }: ReceiptModalProps) {
  if (!appt) return null;
  const rno = 'RCPT-' + (appt.mrn || '').slice(-5) + '-' + new Date().getDate();
  return (
    <Modal
      open={!!appt}
      onClose={onClose}
      title="Receipt & Token"
      width={820}
      footer={
        <>
          <Button variant="secondary" icon="printer" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="info" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="print-area flex items-stretch gap-6">
        {/* receipt */}
        <div className="border-border flex-[1.4] overflow-hidden rounded-lg border">
          <div className="bg-bg-tint flex items-center justify-between p-4.5">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_SRC} className="size-8.5" alt={`${HOSPITAL_NAME} logo`} />
              <div>
                <div className="text-h3 text-text-navy">{HOSPITAL_NAME}</div>
                <div className="text-caption text-text-muted">
                  {appt.source === 'Online'
                    ? 'Payment Receipt · Prepaid via Medibook'
                    : 'Payment Receipt · Collected at Desk'}
                </div>
              </div>
            </div>
            <Badge status="Paid" />
          </div>
          <div className="p-4.5">
            <div className="text-body mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              <Kv k="Receipt No." v={rno} />
              <Kv k="Date" v={`${appt.date}, ${appt.time}`} />
              <Kv k="Patient" v={appt.name} />
              <Kv k="MR Number" v={appt.mrn} />
              <Kv k="Payment Mode" v={appt.payMode || 'Cash'} />
              <Kv k="Reference" v={appt.payRef || '—'} />
            </div>
            <table className="text-body w-full border-collapse">
              <thead>
                <tr>
                  <th className={cn(rcTh, 'text-left')}>Service</th>
                  <th className={cn(rcTh, 'text-right')}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={rcTd}>
                    Consultation — {appt.doctor} ({appt.dept})
                  </td>
                  <td className={cn(rcTd, 'text-right tabular-nums')}>{money(appt.amount)}</td>
                </tr>
                <tr>
                  <td className={cn(rcTd, 'text-text-strong border-none font-semibold')}>
                    Total Paid
                  </td>
                  <td
                    className={cn(rcTd, 'text-g-700 border-none text-right font-bold tabular-nums')}
                  >
                    {money(appt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="text-caption text-text-faint mt-3.5 leading-[1.6]">
              {appt.source === 'Online'
                ? 'Booked & prepaid through the Medibook app. This is a computer-generated receipt.'
                : 'Payment collected at the hospital desk and recorded in Medibook. This is a computer-generated receipt.'}
            </div>
          </div>
        </div>
        {/* token */}
        <div className="flex flex-1 items-center">
          <TokenSlip appt={appt} />
        </div>
      </div>
    </Modal>
  );
}
