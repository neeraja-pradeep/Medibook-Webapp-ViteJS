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
 * deliberately overrides the global 22px "Comfy" density for these compact
 * receipt sub-tables (utilities layer wins over base).
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

interface MultiReceiptModalProps {
  open: boolean;
  patient?: string;
  appts: readonly Appointment[] | null;
  onClose: () => void;
}

/** Combined receipt + a token slip per consultation (design `Flows.jsx` `MultiReceiptModal`). */
export function MultiReceiptModal({ open, patient, appts, onClose }: MultiReceiptModalProps) {
  if (!open || !appts || !appts.length) return null;
  const a0 = appts[0];
  if (!a0) return null;
  const total = appts.reduce((s, a) => s + a.amount, 0);
  const rno = 'RCPT-' + (a0.mrn || '').slice(-5) + '-' + new Date().getDate();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={appts.length > 1 ? 'Receipt & Tokens' : 'Receipt & Token'}
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
        <div className="border-border flex-[1.5] overflow-hidden rounded-lg border">
          <div className="bg-bg-tint flex items-center justify-between p-4.5">
            <div className="flex items-center gap-2.5">
              <img src={LOGO_SRC} className="size-8.5" alt={`${HOSPITAL_NAME} logo`} />
              <div>
                <div className="text-h3 text-text-navy">{HOSPITAL_NAME}</div>
                <div className="text-caption text-text-muted">
                  Payment Receipt · Collected at Desk
                </div>
              </div>
            </div>
            <Badge status="Paid" />
          </div>
          <div className="p-4.5">
            <div className="text-body mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              <Kv k="Receipt No." v={rno} />
              <Kv k="Date" v={`${a0.date}, ${a0.time}`} />
              <Kv k="Patient" v={patient} />
              <Kv k="MR Number" v={a0.mrn} />
              <Kv k="Payment Mode" v={a0.payMode || 'Cash'} />
              <Kv k="Reference" v={a0.payRef || '—'} />
            </div>
            <table className="text-body w-full border-collapse">
              <thead>
                <tr>
                  <th className={cn(rcTh, 'text-left')}>Consultation</th>
                  <th className={cn(rcTh, 'text-right')}>Token</th>
                  <th className={cn(rcTh, 'text-right')}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td className={rcTd}>
                      {a.doctor} ({a.dept})
                    </td>
                    <td className={cn(rcTd, 'text-blue text-right font-semibold')}>{a.token}</td>
                    <td className={cn(rcTd, 'text-right tabular-nums')}>{money(a.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td
                    className={cn(rcTd, 'text-text-strong border-none font-semibold')}
                    colSpan={2}
                  >
                    Total Paid
                  </td>
                  <td
                    className={cn(rcTd, 'text-g-700 border-none text-right font-bold tabular-nums')}
                  >
                    {money(total)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="text-caption text-text-faint mt-3.5 leading-[1.6]">
              Payment collected at the hospital desk and recorded in Medibook. This is a
              computer-generated receipt.
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3">
          {appts.map((a) => (
            <TokenSlip key={a.id} appt={a} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
