import { hospName } from '@/features/ops-hospitals/application/store/hospitals.store';
import { cn } from '@/shared/lib/cn';
import { fmtDate, money } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import { tdClass } from '@/shared/ui/TableShell';

import { opsTintOf, type SettlementRow } from './settlement-model';

interface SettlementQueueRowProps {
  s: SettlementRow;
  /** Flat list shows an Expected column; payout-run cards do not. */
  showDate: boolean;
  onOpenHosp: (hid: number) => void;
  /** Release button (Pending / Overdue) — parent guards the missing-bank case. */
  onRelease: (row: SettlementRow) => void;
  /** Retry button (Payout failed) — reopens the release modal. */
  onRetry: (row: SettlementRow) => void;
}

/** One statement row of the settlement queue (design `settleRow`). */
export function SettlementQueueRow({
  s,
  showDate,
  onOpenHosp,
  onRelease,
  onRetry,
}: SettlementQueueRowProps) {
  return (
    <tr>
      <td
        onClick={() => onOpenHosp(s.hid)}
        title="Open hospital profile"
        className={cn(tdClass, 'cursor-pointer')}
      >
        <OpsEntity
          icon="landmark"
          tint={opsTintOf(s.gross % 5)}
          title={hospName(s)}
          sub={`${s.id} · ${s.period}`}
        />
        {s.remark && <div className="text-caption text-blue mt-1 ml-11">“{s.remark}”</div>}
      </td>
      <td className={cn(tdClass, 'text-right tabular-nums')}>{money(s.gross)}</td>
      <td className={cn(tdClass, 'text-right tabular-nums')}>{money(s.commission)}</td>
      <td className={cn(tdClass, 'text-text-strong text-right font-medium tabular-nums')}>
        {money(s.net)}
        {s.releasedAmt && s.releasedAmt !== s.net ? (
          <div className="text-caption text-y-700 font-normal">released {money(s.releasedAmt)}</div>
        ) : null}
      </td>
      {showDate && <td className={tdClass}>{fmtDate(s.expected)}</td>}
      <td className={tdClass}>
        <Badge status={s.status} />
        {s.utr && <div className="text-caption text-text-muted mt-1 tabular-nums">{s.utr}</div>}
        {s.requested && <div className="text-caption text-blue mt-1">Requested by hospital</div>}
      </td>
      <td className={tdClass}>
        {s.status === 'Pending' || s.status === 'Overdue' ? (
          <Button size="sm" onClick={() => onRelease(s)}>
            Release
          </Button>
        ) : s.status === 'Payout failed' ? (
          <Button size="sm" variant="secondary" icon="refresh-cw" onClick={() => onRetry(s)}>
            Retry
          </Button>
        ) : s.status === 'Released' ? (
          <span className="text-caption text-text-muted">Awaiting hospital confirmation</span>
        ) : (
          <span className="text-caption text-g-600 inline-flex items-center gap-1.25">
            <Icon name="check" size={15} /> {fmtDate(s.receivedOn)}
          </span>
        )}
      </td>
    </tr>
  );
}
