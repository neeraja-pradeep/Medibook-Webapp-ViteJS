import { useNavigate, useParams } from 'react-router-dom';

import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { InfoGrid } from '@/shared/ui/InfoGrid';
import { IconBtn } from '@/shared/ui/IconBtn';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { TableShell, tdClass } from '@/shared/ui/TableShell';

import { OPS_BASE_PATH, OPS_VIEW_SEGMENT, opsHospitalDetailPath } from '@/app/router/paths';

import { useBillingStore } from '@/features/ops-billing/application/store/billing.store';
import {
  gstinOf,
  hospName,
  opsHospById,
} from '@/features/ops-hospitals/application/store/hospitals.store';
import { useOpsSettingsStore } from '@/features/ops-settings/application/store/opsSettings.store';

/**
 * Ops invoice detail (design `Ops.jsx` `OpsInvoiceDetail`): the selected
 * invoice resolves from the `:id` URL param with a first-record fallback.
 * Header + View Hospital + Download PDF (busy) button, the tax/treatment
 * InfoGrid (hospital GSTIN via `gstinOf`, Medibook GSTIN from ops settings),
 * the single line item with base = amount / 1.18 and CGST/SGST halves, the
 * totals block, and the linked payment-attempts table.
 */
export function OpsInvoiceDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [busy, run] = useOpsAct();
  const invoices = useBillingStore((s) => s.invoices);
  const payments = useBillingStore((s) => s.payments);
  const medibookGstin = useOpsSettingsStore((s) => s.settings.gst);

  const inv = invoices.find((x) => x.id === Number(id)) ?? invoices[0];
  const host = opsHospById(inv.hid);
  const hostGstin = host ? gstinOf(host) : null;
  const base = Math.round(inv.amount / 1.18);
  const gstHalf = Math.round((inv.amount - base) / 2);
  const attempts = payments.filter((p) => p.inv === inv.no);

  const totals: readonly (readonly [string, number])[] = [
    ['Subtotal', base],
    ['CGST (9%)', gstHalf],
    ['SGST (9%)', gstHalf],
  ];

  const toPayment = (pid: number): void => {
    navigate(`${OPS_BASE_PATH}/${OPS_VIEW_SEGMENT['payment-detail'].replace(':id', String(pid))}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-blue-soft-bg text-text-navy flex size-14 flex-none items-center justify-center rounded-lg">
            <Icon name="file-text" size={26} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-3">
              <SectionTitle size={20}>
                <span className="tabular-nums">{inv.no}</span>
              </SectionTitle>
              <Badge status={inv.status} />
            </div>
            <span className="text-caption text-text-muted">
              {hospName(inv)} · Issued {inv.issued} · Due {inv.due}
            </span>
          </div>
          <div className="flex-1"></div>
          <Button
            variant="ghost"
            onClick={() => {
              if (inv.hid && opsHospById(inv.hid)) navigate(opsHospitalDetailPath(inv.hid));
            }}
          >
            View Hospital
          </Button>
          <Button
            variant="secondary"
            icon="download"
            onClick={busy.dl ? undefined : () => run('dl', `Invoice ${inv.no} downloaded.`)}
            className={cn(busy.dl && 'opacity-50')}
          >
            {busy.dl ? 'Downloading…' : 'Download PDF'}
          </Button>
        </div>
      </Card>
      <InfoGrid
        items={[
          { k: 'Hospital', v: hospName(inv) },
          { k: 'Billing Period', v: 'June 01 – June 30, 2026' },
          { k: 'Plan', v: host ? host.plan : 'Growth' },
          { k: 'Issued', v: inv.issued },
          { k: 'Due', v: inv.due },
          { k: 'Amount', v: money(inv.amount), num: true },
          { k: 'Hospital GSTIN', v: hostGstin || '—', num: Boolean(hostGstin) },
          { k: 'Medibook GSTIN', v: medibookGstin, num: true },
          { k: 'Tax Treatment', v: '18% GST (9% CGST + 9% SGST)' },
        ]}
      />
      <Card>
        <SectionTitle className="mb-4">Line Items</SectionTitle>
        <TableShell columns={['Item', 'Period', 'Amount']} rightCols={['Amount']}>
          <tr>
            <td className={tdClass}>{host ? host.plan : 'Growth'} Plan — Monthly subscription</td>
            <td className={tdClass}>June 01 – June 30, 2026</td>
            <td className={cn(tdClass, 'text-right tabular-nums')}>{money(base)}</td>
          </tr>
        </TableShell>
        <div className="mt-4 flex justify-end">
          <div className="flex w-75 flex-col gap-2">
            {totals.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-body text-text-muted">{k}</span>
                <span className="text-body text-text-strong tabular-nums">{money(v)}</span>
              </div>
            ))}
            <div className="border-border-soft flex justify-between border-t pt-2">
              <span className="text-body-lg text-text-strong font-semibold">Total</span>
              <span className="text-body-lg text-text-strong font-semibold tabular-nums">
                {money(inv.amount)}
              </span>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle className="mb-4">Payment Attempts</SectionTitle>
        {attempts.length > 0 ? (
          <TableShell columns={['Transaction', 'Method', 'Date', 'Status', 'Action']}>
            {attempts.map((p) => (
              <tr key={p.id}>
                <td className={cn(tdClass, 'tabular-nums')}>{p.txn}</td>
                <td className={tdClass}>{p.method}</td>
                <td className={tdClass}>{p.date}</td>
                <td className={tdClass}>
                  <Badge status={p.status} />
                </td>
                <td className={tdClass}>
                  <IconBtn
                    name="eye"
                    box={36}
                    size={16}
                    title="View payment"
                    onClick={() => toPayment(p.id)}
                  />
                </td>
              </tr>
            ))}
          </TableShell>
        ) : (
          <div className="text-body text-text-faint py-6 text-center">No payment attempts yet.</div>
        )}
      </Card>
    </div>
  );
}
