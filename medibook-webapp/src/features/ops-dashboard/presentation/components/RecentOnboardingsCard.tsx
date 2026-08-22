import { useNavigate } from 'react-router-dom';

import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { IconBtn } from '@/shared/ui/IconBtn';
import type { OpsTint } from '@/shared/ui/OpsConfirm';
import { OpsEntity } from '@/shared/ui/OpsEntity';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { TableShell, tdClass } from '@/shared/ui/TableShell';

import { opsHospitalDetailPath, opsPath } from '@/app/router/paths';

import {
  hospName,
  useHospitalsStore,
} from '@/features/ops-hospitals/application/store/hospitals.store';

const COLUMNS = ['Hospital', 'Plan', 'Location', 'Onboarded', 'Status', 'Action'] as const;

/** Rotating icon-box tint by index (design `opsTintOf`). */
const TINT_CYCLE = ['primary', 'info', 'success', 'warning', 'neutral'] as const;
const opsTintOf = (i: number): OpsTint => TINT_CYCLE[i % TINT_CYCLE.length];

/** "Recent Hospital Onboardings" — the first five registry rows, each opening
 * that hospital's ops profile. */
export function RecentOnboardingsCard() {
  const navigate = useNavigate();
  const hospitals = useHospitalsStore((s) => s.hospitals);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Recent Hospital Onboardings</SectionTitle>
        <button
          type="button"
          onClick={() => navigate(opsPath('hospitals'))}
          className="text-body text-blue cursor-pointer font-medium"
        >
          View All
        </button>
      </div>
      <TableShell columns={COLUMNS}>
        {hospitals.slice(0, 5).map((h) => (
          <tr
            key={h.id}
            onClick={() => navigate(opsHospitalDetailPath(h.id))}
            className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
          >
            <td className={tdClass}>
              <OpsEntity
                icon="building-2"
                tint={opsTintOf(h.id)}
                title={hospName(h.id)}
                sub={h.email}
              />
            </td>
            <td className={tdClass}>{h.plan}</td>
            <td className={tdClass}>
              {h.city}, {h.st}
            </td>
            <td className={tdClass}>{h.onboarded}</td>
            <td className={tdClass}>
              <Badge status={h.status} />
            </td>
            <td className={tdClass} onClick={(e) => e.stopPropagation()}>
              <IconBtn
                name="eye"
                box={36}
                size={16}
                title="View hospital"
                onClick={() => navigate(opsHospitalDetailPath(h.id))}
              />
            </td>
          </tr>
        ))}
      </TableShell>
    </Card>
  );
}
